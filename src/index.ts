#!/usr/bin/env node
/**
 * @tenpo/mcp — Tenpo MCP server (universal: works with any MCP client)
 *
 * A thin stdio MCP wrapper that translates MCP protocol calls into HTTP
 * calls against Tenpo's /api/v1/* endpoints.
 *
 * Compatible with ANY MCP client:
 *   • Coding agents:  Claude Code, Cursor, Codex, Cline, Aider, Continue,
 *                     Windsurf, Zed, Cody, Roo Code, Open Interpreter, Goose
 *   • Chat clients:   Claude Desktop, ChatGPT (when MCP lands), Open WebUI,
 *                     LibreChat, generic stdio MCP hosts
 *   • Whatever LLM:   Opus, Sonnet, GPT-4/5, Gemini, DeepSeek, Qwen, Llama,
 *                     Mistral — host AI does the reasoning, Tenpo provides
 *                     the data + tools + skills + memory.
 *
 * Tenpo NEVER runs an LLM. Free tier ≈ 200 messages/month (50 MCP calls/day).
 * Trial: 7 days, ~30 calls/day. Higher limits available on paid tiers.
 *
 * The npm package is ~5KB. ALL the intelligence lives on Tenpo's VPS.
 *
 * Setup (in any MCP client config):
 *   {
 *     "mcpServers": {
 *       "tenpo": {
 *         "command": "npx",
 *         "args": ["-y", "@tenpo/mcp"],
 *         "env": { "TENPO_API_KEY": "tnp_live_..." }
 *       }
 *     }
 *   }
 *
 * Or for trial (no API key — auto-issued):
 *   { "command": "npx", "args": ["-y", "@tenpo/mcp"] }
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  CreateMessageRequestSchema,
  CreateMessageResultSchema,
} from "@modelcontextprotocol/sdk/types.js";

const TENPO_API_BASE = process.env.TENPO_API_URL ?? "https://api.tenpo.ai";
let TENPO_API_KEY = process.env.TENPO_API_KEY ?? "";

const log = (...args: unknown[]) => console.error("[@tenpo/mcp]", ...args);

// ── HTTP helper ──────────────────────────────────────────────────────────────

async function tenpoFetch(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<unknown> {
  const url = `${TENPO_API_BASE}${path}`;
  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(TENPO_API_KEY ? { Authorization: `Bearer ${TENPO_API_KEY}` } : {}),
      "User-Agent": "@tenpo/mcp/0.1.0",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(180_000),
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const errBody = json as { error?: string };
    throw new Error(
      `Tenpo API error ${res.status}: ${errBody.error ?? text.slice(0, 200)}`,
    );
  }
  return json;
}

// ── First-run trial-key issuance ─────────────────────────────────────────────

async function ensureApiKey(): Promise<void> {
  if (TENPO_API_KEY) return;

  log("No TENPO_API_KEY set. Issuing free-tier key (500 calls/day, no expiry).");
  try {
    // /api/v1/connect/issue-key is the current name; backend also accepts the
    // legacy /trial-key for back-compat with older MCP package versions.
    const res = (await tenpoFetch("/api/v1/connect/issue-key", {
      method: "POST",
      body: { client_hint: process.env.npm_package_name ?? "mcp-stdio" },
    })) as {
      api_key?: string;
      merchant_id?: string;
      tier?: string;
      daily_call_limit?: number;
      upgrade_url?: string;
      connect_url?: string;
    };
    if (res.api_key) {
      TENPO_API_KEY = res.api_key;
      log(
        `\n` +
          `╔══════════════════════════════════════════════════════════════════════╗\n` +
          `║ Tenpo MCP — Free Tier API Key Issued                                ║\n` +
          `╠══════════════════════════════════════════════════════════════════════╣\n` +
          `║ Save this in your MCP config to keep using the same key:            ║\n` +
          `║                                                                      ║\n` +
          `║   TENPO_API_KEY=${(res.api_key ?? "").padEnd(54)}║\n` +
          `║                                                                      ║\n` +
          `║ Free tier: ${(res.daily_call_limit ?? 500).toString().padEnd(4)} calls/day, no expiry.${" ".repeat(28)}║\n` +
          `║ Upgrade for higher limits: ${(res.upgrade_url ?? "https://tenpo.ai/billing/upgrade").padEnd(42)}║\n` +
          `║ Connect your store:        ${(res.connect_url ?? "https://tenpo.ai/connect").padEnd(42)}║\n` +
          `╚══════════════════════════════════════════════════════════════════════╝\n`,
      );
    }
  } catch (err) {
    log(`Failed to issue API key: ${String(err).slice(0, 120)}`);
  }
}

// ── MCP server ──────────────────────────────────────────────────────────────

const server = new Server(
  {
    name: "tenpo",
    version: "0.2.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
      // NOTE: sampling is a CLIENT capability (declared by the host, not the
      // server). We just call sampling/createMessage — supported clients (Claude
      // Desktop / Claude Code) handle it, others return method-not-found and
      // we fall back to BM25 gracefully.
    },
  },
);

// ── Sampling capability detection ───────────────────────────────────────────
// Some hosts (Claude Desktop, Claude Code) support sampling. Others don't yet.
// Attempt detection by checking client capabilities after handshake.
let CLIENT_SUPPORTS_SAMPLING: boolean | null = null;

async function tryClassifyIntentViaSampling(query: string, taxonomy: string): Promise<string | null> {
  if (CLIENT_SUPPORTS_SAMPLING === false) return null;
  try {
    const result = await server.request(
      {
        method: "sampling/createMessage",
        params: {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `${taxonomy}\n\nMERCHANT QUERY: ${query.slice(0, 400)}\n\nReply with ONLY the JSON: {"intent":"<intent_id>","confidence":0.0-1.0,"reason":"one short sentence"}`,
              },
            },
          ],
          maxTokens: 200,
          temperature: 0,
          systemPrompt:
            "You are a deterministic intent classifier. Read the taxonomy. Pick the single best intent_id for the query. Reply with valid JSON only — no prose, no fences.",
          modelPreferences: {
            // Cheap, fast, accurate — host AI picks the model it has available
            speedPriority: 0.7,
            costPriority: 0.7,
            intelligencePriority: 0.5,
          },
        },
      },
      CreateMessageResultSchema,
    );
    CLIENT_SUPPORTS_SAMPLING = true;
    const text = (result?.content as { type: string; text?: string } | undefined)?.text ?? "";
    const m = text.match(/\{[\s\S]*?\}/);
    if (!m) return null;
    return m[0];
  } catch (err) {
    const errMsg = String(err);
    // Method-not-found = host doesn't support sampling. Cache the negative.
    if (/-32601|method.*not.*found|sampling/i.test(errMsg)) {
      CLIENT_SUPPORTS_SAMPLING = false;
    }
    return null;
  }
}

// ── Tools ───────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "tenpo_route",
    description:
      "PREFLIGHT INTELLIGENCE — Returns a curated tool/skill bundle for a query. Tenpo NEVER runs an LLM; you (the host) do the synthesis with your own tokens. Returns: relevant_tools (top 5 of 175+), relevant_skills (top 3 of 199 with content), suggested_path, pre_executed_data (revenue/alerts), suggested_next_actions, soul. Call this once per user query, then tenpo_run_tool for each tool you need.",
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: {
        query: {
          type: "string",
          description: "What the merchant wants to know or do, in natural language",
        },
        top_tools: { type: "number", description: "How many tools to return (default 5)" },
        top_skills: { type: "number", description: "How many skills to return (default 3)" },
        skip_pre_exec: {
          type: "boolean",
          description: "Skip pre-executing SQL data (faster, less context)",
        },
      },
    },
  },
  {
    name: "tenpo_run_tool",
    description:
      "Execute any of Tenpo's 175+ specific tools by name. Use after tenpo_route or tenpo_overview shows you which tool fits the task. Examples: tenpo_query (raw SQL on merchant DB), top_customers, low_stock, revenue_trend, tenpo_fetch_url (free webpage fetch — markdown/text/html), tenpo_create_workflow, tenpo_meta_ads, send_email, etc. Pass merchantId in args.",
    inputSchema: {
      type: "object",
      required: ["tool", "args"],
      properties: {
        tool: { type: "string", description: "Tenpo tool name (e.g. 'tenpo_query', 'top_customers')" },
        args: {
          type: "object",
          description: "Tool-specific arguments. merchantId is auto-injected.",
        },
      },
    },
  },
  {
    name: "tenpo_classify_intent",
    description:
      "INTENT CLASSIFIER — classifies a merchant query into one of Tenpo's intents (connect / investigate / create / launch / pause / discover / memory / onboard / strategy / global_signal / etc.) and returns the routing bundle for that intent. Uses MCP sampling (your host LLM) to do the classification — Tenpo never calls a paid LLM. Returns: classified_intent, confidence, matched_tools, matched_skills, suggested_path. Call this BEFORE tenpo_run_tool when the user query is ambiguous or compound (multiple intents). For clear single-intent queries, you can skip this and pick directly from tools/list.",
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string", description: "The merchant's query in natural language" },
        top_tools: { type: "number", description: "Max tools to return (default 5)" },
      },
    },
  },
  {
    name: "tenpo_get_resource",
    description:
      "Read a Tenpo resource. soul (5 always-on skills), machine_rules (concise operating rules), playbook (operational scenarios), user_md (per-merchant context files + last 7 daily memos), cross_session_memory, memory, graduated_routines, schema (DuckDB), integrations, recent_alerts, intelligence_snapshot (heartbeat data), sync_status, autonomous_incidents, action_patterns, skills_index, routines.",
    inputSchema: {
      type: "object",
      required: ["resource"],
      properties: {
        resource: {
          type: "string",
          enum: [
            "soul",
            "machine_rules",
            "playbook",
            "cross_session_memory",
            "user_md",
            "graduated_routines",
            "memory",
            "schema",
            "integrations",
            "recent_alerts",
            "intelligence_snapshot",
            "sync_status",
            "autonomous_incidents",
            "action_patterns",
            "skills_index",
            "routines",
            "recommended_mcps",
          ],
        },
      },
    },
  },
  // tenpo_route_skills DROPPED — read tenpo://skills_index, pick by judgment
  // tenpo_overview DROPPED — use ListToolsRequestSchema/ListResourcesRequestSchema
  {
    name: "tenpo_get_prompt",
    description:
      "Get one of Tenpo's 199 expert skill playbooks (refund response, ad audit, supplier email, etc.) as a callable prompt template. Use when the host AI faces a domain-specific task and wants Tenpo's playbook.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: {
          type: "string",
          description: "Skill ID (e.g. 'tenpo-crm', '40rty-routines-morning-store-briefing')",
        },
        variables: {
          type: "object",
          description: "Optional variables to interpolate ({{customer_id}}, etc.)",
        },
      },
    },
  },
  {
    name: "tenpo_list_prompts",
    description:
      "List all 199 available Tenpo skill playbooks. Optionally filter by search query.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Search query (filters by name/description)" },
      },
    },
  },
  {
    name: "tenpo_connect_integration",
    description:
      "Connect a new integration via API key (no OAuth — chat-only flow). Step 1: call with {integration_id} to get instructions. Step 2: call with {integration_id, credentials} to save & sync. Supported: shopify, klaviyo, meta_ads, google_ads, stripe, gmail, telegram, slack, particl, custom_http, +20 more.",
    inputSchema: {
      type: "object",
      required: ["integration_id"],
      properties: {
        integration_id: {
          type: "string",
          description: "Integration to connect (e.g. 'shopify', 'klaviyo')",
        },
        credentials: {
          type: "object",
          description: "Optional — if omitted, returns instructions. Otherwise saves the credentials.",
        },
      },
    },
  },
  {
    name: "tenpo_remember",
    description:
      "Save context to per-merchant memory. scope='fact'|'preference'|'decision'|'terminology' writes to the semantic-searchable DB; scope='user_md'|'memory_md'|'context_md'|'profile_md' appends/replaces the per-merchant markdown files. Cross-session, durable.",
    inputSchema: {
      type: "object",
      required: ["content"],
      properties: {
        content: { type: "string", description: "What to remember (3-2000 chars for DB, up to 50,000 for markdown)" },
        scope: {
          type: "string",
          enum: ["fact", "preference", "decision", "terminology", "user_md", "memory_md", "context_md", "profile_md"],
          description: "Storage scope (default: fact)",
        },
        mode: {
          type: "string",
          enum: ["append", "prepend", "replace"],
          description: "For markdown scopes only (default: append)",
        },
      },
    },
  },
  // DROPPED: tenpo_pattern_detect (host runs SQL via tenpo_query, detects itself),
  //          tenpo_fetch_url (host has WebFetch/@web/browser),
  //          tenpo_write_md (merged into tenpo_remember).
];

// Dynamic tool surface — fetched lazily on first tools/list. Each Tenpo tool
// (175+ in total) is registered as a first-class MCP tool with its proper
// inputSchema so the host AI can call it directly with valid args, instead of
// going through the `tenpo_run_tool` wildcard. Refreshed every 10 minutes.
type DynamicTool = { name: string; description?: string; inputSchema?: unknown };
let DYNAMIC_TOOLS_CACHE: { fetchedAt: number; tools: DynamicTool[] } | null = null;
const DYNAMIC_TOOLS_TTL_MS = 10 * 60 * 1000;

async function loadDynamicTools(): Promise<DynamicTool[]> {
  // Cache check
  if (
    DYNAMIC_TOOLS_CACHE &&
    Date.now() - DYNAMIC_TOOLS_CACHE.fetchedAt < DYNAMIC_TOOLS_TTL_MS
  ) {
    return DYNAMIC_TOOLS_CACHE.tools;
  }
  try {
    const result = (await tenpoFetch(
      "/api/v1/tools?include_schema=1&include_descriptions=1",
    )) as {
      tools?: DynamicTool[];
      meta_tools?: DynamicTool[];
    };
    // Merge gateway tools + meta-only tools the runtime advertises (e.g.
    // tenpo_winning_patterns, tenpo_competitor_*) — they only exist as MCP
    // tools, not in the gateway-tools registry, but are callable.
    const all: DynamicTool[] = [
      ...(result.tools ?? []),
      ...(result.meta_tools ?? []),
    ];
    // Dedupe by name (gateway tools take precedence — they have schemas)
    const seen = new Set<string>();
    const deduped: DynamicTool[] = [];
    for (const t of all) {
      if (!t?.name || seen.has(t.name)) continue;
      seen.add(t.name);
      deduped.push(t);
    }
    DYNAMIC_TOOLS_CACHE = { fetchedAt: Date.now(), tools: deduped };
    return deduped;
  } catch (err) {
    log(`[mcp] failed to load dynamic tools: ${String(err).slice(0, 120)}`);
    return [];
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  await ensureApiKey();
  const dynamic = await loadDynamicTools();
  // Filter out names that collide with our 7 meta-tools — those have richer
  // descriptions tailored to host-AI ergonomics, so we want ours to win.
  const metaNames = new Set(TOOLS.map((t) => t.name));
  const dynamicEntries = dynamic
    .filter((t) => !metaNames.has(t.name))
    .map((t) => ({
      name: t.name,
      description: t.description ?? `Tenpo tool: ${t.name}`,
      // Default to permissive object schema if backend didn't include one
      // (some meta-only tools advertise themselves without schemas).
      inputSchema:
        (t.inputSchema as { type?: string; properties?: unknown }) ?? {
          type: "object",
          properties: {},
        },
    }));
  return { tools: [...TOOLS, ...dynamicEntries] };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  await ensureApiKey();
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case "tenpo_route": {
        const result = await tenpoFetch("/api/v1/route", {
          method: "POST",
          body: args,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "tenpo_run_tool": {
        const a = args as { tool?: string; args?: Record<string, unknown> };
        if (!a.tool) throw new Error("tool name required");
        const result = await tenpoFetch(`/api/v1/tools/${encodeURIComponent(a.tool)}`, {
          method: "POST",
          body: a.args ?? {},
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "tenpo_classify_intent": {
        const a = args as { query?: string; top_tools?: number };
        if (!a.query) throw new Error("query required");
        // 1. Fetch the intent taxonomy from Tenpo VPS (cached server-side)
        const taxonomy = await tenpoFetch("/api/v1/resources/intent_taxonomy");
        const taxonomyText =
          (taxonomy as { data?: { taxonomy_prompt?: string } })?.data?.taxonomy_prompt ?? "";

        // 2. Use MCP sampling to ask the HOST LLM to classify against the taxonomy.
        //    Host AI does the LLM call — Tenpo pays nothing.
        let classifiedIntent: string | null = null;
        let confidence = 0;
        let reason = "";
        const sampled = await tryClassifyIntentViaSampling(a.query, taxonomyText);
        if (sampled) {
          try {
            const parsed = JSON.parse(sampled) as { intent?: string; confidence?: number; reason?: string };
            classifiedIntent = parsed.intent ?? null;
            confidence = Number(parsed.confidence ?? 0);
            reason = String(parsed.reason ?? "");
          } catch {
            /* parse failure — fall through to BM25 path */
          }
        }

        // 3. Pass the classified intent to Tenpo VPS so it can route precisely.
        //    If sampling wasn't supported / failed, the VPS falls back to BM25.
        const result = await tenpoFetch("/api/v1/route", {
          method: "POST",
          body: {
            query: a.query,
            top_tools: a.top_tools ?? 5,
            top_skills: 4,
            classified_intent: classifiedIntent,
            classification_confidence: confidence,
          },
        });

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              ...(result as object),
              classification: {
                intent: classifiedIntent,
                confidence,
                reason,
                method: classifiedIntent ? "host_llm_sampling" : "bm25_fallback",
                client_supports_sampling: CLIENT_SUPPORTS_SAMPLING,
              },
            }, null, 2),
          }],
        };
      }

      case "tenpo_get_resource": {
        const a = args as { resource?: string };
        if (!a.resource) throw new Error("resource name required");
        const result = await tenpoFetch(`/api/v1/resources/${encodeURIComponent(a.resource)}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "tenpo_get_prompt": {
        const a = args as { id?: string; variables?: Record<string, string> };
        if (!a.id) throw new Error("id required");
        let path = `/api/v1/prompts/${encodeURIComponent(a.id)}`;
        if (a.variables) {
          const params = new URLSearchParams();
          for (const [k, v] of Object.entries(a.variables)) {
            params.append(`var_${k}`, v);
          }
          path += `?${params.toString()}`;
        }
        const result = await tenpoFetch(path);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "tenpo_list_prompts": {
        const a = args as { q?: string };
        const path = a.q
          ? `/api/v1/prompts?q=${encodeURIComponent(a.q)}`
          : `/api/v1/prompts`;
        const result = await tenpoFetch(path);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "tenpo_connect_integration": {
        const a = args as { integration_id?: string; credentials?: Record<string, string> };
        if (!a.integration_id) throw new Error("integration_id required");
        if (a.credentials) {
          const result = await tenpoFetch("/api/v1/connect/save", {
            method: "POST",
            body: { integration_id: a.integration_id, credentials: a.credentials },
          });
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        const result = await tenpoFetch("/api/v1/connect/start", {
          method: "POST",
          body: { integration_id: a.integration_id },
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "tenpo_remember": {
        const a = args as { content?: string; fact?: string; scope?: string; memory_type?: string; mode?: string };
        const content = a.content ?? a.fact;
        if (!content) throw new Error("content required");
        const result = await tenpoFetch("/api/v1/tools/tenpo_remember", {
          method: "POST",
          body: { content, scope: a.scope ?? a.memory_type ?? "fact", mode: a.mode ?? "append" },
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      // tenpo_pattern_detect, tenpo_fetch_url, tenpo_write_md, tenpo_route_skills,
      // tenpo_overview cases DROPPED — host AI's native capabilities cover them.

      default: {
        // Dynamic-tool path. The 175 gateway tools + meta-tools were surfaced
        // as first-class MCP tools by `loadDynamicTools()`. When the host AI
        // calls one of them directly (instead of going through tenpo_run_tool),
        // proxy it to the runtime's tool-invoke endpoint here.
        const dynamic = await loadDynamicTools();
        const exists = dynamic.some((t) => t.name === name);
        if (!exists) {
          throw new Error(
            `Unknown tool: ${name}. Use tenpo_route to discover available tools.`,
          );
        }
        const result = await tenpoFetch(
          `/api/v1/tools/${encodeURIComponent(name)}`,
          { method: "POST", body: args },
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    }
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
      isError: true,
    };
  }
});

// ── Resources ───────────────────────────────────────────────────────────────

const RESOURCES = [
  // ════ Tenpo's brain (read on demand, not prescriptive) ════
  { uri: "tenpo://soul", name: "Tenpo Soul (5 always-on skills)", mimeType: "application/json", description: "Tenpo's operator personality + commerce/psychology/db skills (5 always-on). Read once per session if you want to sound like Tenpo's deep playbook; otherwise the minimal soul is in tenpo_route's response." },
  { uri: "tenpo://machine_rules", name: "Machine Rules (concise)", mimeType: "application/json", description: "Essential operating rules — data integrity, SQL safety, output shape, cascade pattern, memory primitive. ~100 lines, not the old 1.2K-line lecture." },
  { uri: "tenpo://playbook", name: "Operational Playbook", mimeType: "application/json", description: "Authored operational scenario investigations (Hidden Stockout Crisis, ad-spend bleed, payment cliff). Reference when diagnosing complex multi-domain problems." },
  { uri: "tenpo://routines", name: "20 Cron Routines", mimeType: "application/json", description: "20 portable routine specs (revenue dip, OOS check, ad efficiency, etc.) — clone to a merchant or run the prompt directly." },
  // ════ PER-MERCHANT CONTEXT ════
  { uri: "tenpo://user_md", name: "User Profile (USER.md, MEMORY.md, CONTEXT.md, PROFILE.md + last 7 daily session memos)", mimeType: "application/json", description: "Per-merchant markdown context files PLUS last 7 days of session memos (memory/YYYY-MM-DD.md). Currency, language, tone, business model, what was discussed recently." },
  { uri: "tenpo://cross_session_memory", name: "Cross-Session Memory", mimeType: "application/json", description: "Full cross-session memory: facts, preferences, terminology, recent_actions. Read this BEFORE answering anything that might reference past context." },
  { uri: "tenpo://memory", name: "Quick Memory", mimeType: "application/json", description: "Lightweight per-merchant memory snapshot (faster than cross_session_memory)." },
  { uri: "tenpo://graduated_routines", name: "Graduated Routines (learned patterns)", mimeType: "application/json", description: "Routines this merchant has automated after multiple manual approvals. Tells you what they care enough about to lock in." },
  // ════ LIVE DATA ════
  { uri: "tenpo://schema", name: "DB Schema", mimeType: "application/json", description: "Full DuckDB schema (all tables + columns) so the host AI can write SQL via tenpo_query." },
  { uri: "tenpo://integrations", name: "Connected Integrations", mimeType: "application/json", description: "Which integrations are connected for this merchant (Shopify, Klaviyo, Meta Ads, ...) and their last-sync state, plus the catalog of available integrations." },
  { uri: "tenpo://recent_alerts", name: "Recent Alerts (24h)", mimeType: "application/json", description: "Anything Tenpo's background heartbeat + 39-adapter sync flagged in the last 24h." },
  { uri: "tenpo://intelligence_snapshot", name: "Intelligence Snapshot (heartbeat data, no LLM)", mimeType: "application/json", description: "What Tenpo's background routines have captured — active alerts, recent insights, pending approvals, deterministic detector signals, integration health. Pure data, no Tenpo LLM." },
  { uri: "tenpo://sync_status", name: "Sync Status (39-adapter health)", mimeType: "application/json", description: "Per-integration last_sync_at, last_sync_rows, error_count, health (healthy|stale|errored|inactive). Surface this when merchant asks 'is my data current?'" },
  { uri: "tenpo://autonomous_incidents", name: "Autonomous Incidents (last 7d)", mimeType: "application/json", description: "Last 7 days of deterministic detector hits + tier-2 LLM scout findings. dedup-protected severity stream — what Tenpo flagged while merchant was offline." },
  { uri: "tenpo://action_patterns", name: "Action Patterns (graduation candidates)", mimeType: "application/json", description: "Per-pattern view of skill graduation: which actions are at 1/3, 2/3, 3/3 approvals. 3/3 auto-graduates to a recurring routine on the next hour." },
  { uri: "tenpo://skills_index", name: "Skills Index (categorized)", mimeType: "application/json", description: "All 200+ skills bucketed by category (psychology, strategy, marketing, market-research, ad-library-intel, video-creative, customers, inventory, finance, etc.) for fast lookup without semantic routing." },
  { uri: "tenpo://recommended_mcps", name: "Recommended MCPs (complementary)", mimeType: "application/json", description: "External MCPs that pair well with Tenpo (Higgsfield for video, Apify for scraping, Replicate for image/video gen, Browserbase for headless browser, Stripe official, ElevenLabs, etc.). Surface to the merchant when their need maps to one of these — install alongside Tenpo." },
];

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: RESOURCES,
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  await ensureApiKey();
  const uri = request.params.uri;
  if (!uri.startsWith("tenpo://")) {
    throw new Error(`Unknown URI scheme: ${uri}`);
  }
  const resource = uri.slice("tenpo://".length);
  const result = await tenpoFetch(`/api/v1/resources/${encodeURIComponent(resource)}`);
  return {
    contents: [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
});

// ── Prompts ─────────────────────────────────────────────────────────────────

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  await ensureApiKey();
  try {
    const result = (await tenpoFetch("/api/v1/prompts")) as {
      prompts?: Array<{ id: string; name: string; description: string }>;
    };
    const prompts = (result.prompts ?? []).map((p) => ({
      name: p.id,
      description: `${p.name}: ${p.description}`.slice(0, 200),
    }));
    return { prompts };
  } catch {
    return { prompts: [] };
  }
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  await ensureApiKey();
  const id = request.params.name;
  const variables = (request.params.arguments ?? {}) as Record<string, string>;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(variables)) {
    params.append(`var_${k}`, v);
  }
  const path = `/api/v1/prompts/${encodeURIComponent(id)}${params.toString() ? `?${params.toString()}` : ""}`;
  const result = (await tenpoFetch(path)) as { name?: string; description?: string; content?: string };
  return {
    description: result.description ?? "",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: result.content ?? "(skill content not available)",
        },
      },
    ],
  };
});

// ── Boot ────────────────────────────────────────────────────────────────────

async function main() {
  log(`Starting Tenpo MCP server (api: ${TENPO_API_BASE})`);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log("Connected via stdio. Ready for requests.");
}

main().catch((err) => {
  log("Fatal error:", err);
  process.exit(1);
});
