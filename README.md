# @tenpo/mcp

> The commerce intelligence layer for any AI agent.
> 229 deterministic tools across orders, ads, email, inventory, suppliers, customers, finance, and competitors —
> exposed as a Model Context Protocol server that plugs into Claude Code, Cursor, Claude Desktop, ChatGPT, or any MCP host.

[![npm](https://img.shields.io/npm/v/@tenpo/mcp.svg)](https://www.npmjs.com/package/@tenpo/mcp)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

```bash
npx -y @tenpo/mcp
```

That's it. First run auto-issues a free API key (500 calls/day, no expiry, no card).

---

## Why Tenpo MCP

Most "AI for ecommerce" tools wrap an LLM around your store. **We don't.**

Tenpo is a **stateless commerce-ops backend** that your AI of choice calls directly. The tools return real data + grounded analysis; your AI does the reasoning and writes the response. You pay for *your* AI's tokens — Tenpo never spins up an LLM on our side, so the free tier is genuinely free.

What that means in practice:
- **Your AI gets factual answers**: tools execute SQL against your store, hit Klaviyo's API, ping Meta Ad Manager — never hallucinate
- **Multi-source joins are cheap**: ask *"true ROAS after fees"* and Tenpo joins Shopify orders × Meta spend × Stripe fees deterministically — no LLM in the join path
- **Latency is sub-10ms p50** for the analytics tools — they're SQL helpers, not LLM calls
- **Privacy is default-on**: per-merchant DuckDB, no cross-tenant leakage, k-anonymous network telemetry

---

## What you get

### 4 god-mode intelligence tools

| Tool | What it returns |
|---|---|
| `tenpo_inventory_intelligence` | Working capital aging by SKU + bundle-affinity OOS impact + lead-time-adjusted reorder priorities (CRITICAL/URGENT/PLAN/OK). Sub-100ms even on large catalogs. |
| `tenpo_supplier_scorecard` | Per-supplier A/B/C/D/F grade combining on-time rate, lead-time variance, price drift QoQ, and lifetime spend. |
| `tenpo_customer_intelligence` | Predicted next-order date + churn-risk score (0–100) + top-1%/10%/25% concentration risk + cross-sell next-best-product. |
| `tenpo_creative_dna` | Library of 10 proven email/ad patterns + draft mode generates 3 variants with **explicit hypothesis per variant** + analyze-winners mode extracts patterns from your past top performers. |

### 25 commerce primitives (always loaded)

Storefront, orders, products, customers, segments, suppliers, POs, ad spend, email campaigns, charts, drafts, approvals, integrations connect/disconnect/sync, workflows, web search, SQL queries.

### ~200 specialist tools (loaded on demand by your AI)

Ad-spend pause, PO generation + email, refund processing, abandoned-cart flows, Shopify GraphQL/Admin, Meta/Google/TikTok ads, Klaviyo campaign create + execute, Gorgias support reply, bulk Shopify operations, custom-platform adapters, more.

### Network intelligence

`tenpo_network_intelligence` exposes 6 sections of **k-anonymous (k≥3 merchants)** signals from across the network — top intents merchants ask, tool health (call-count, p50/p95 latency, error rate), per-detector signal/noise grades, creative pattern effectiveness (drafts → launches → revenue), and peer benchmarks (`category × metric` median/p20/p80).

---

## Installation

### Claude Code (CLI)

```bash
claude mcp add tenpo --command "npx -y @tenpo/mcp"
```

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "tenpo": {
      "command": "npx",
      "args": ["-y", "@tenpo/mcp"]
    }
  }
}
```

Restart Claude Desktop. The first call auto-issues a free key and prints it to your terminal — save it to `env.TENPO_API_KEY` to keep using the same key permanently:

```json
{
  "mcpServers": {
    "tenpo": {
      "command": "npx",
      "args": ["-y", "@tenpo/mcp"],
      "env": { "TENPO_API_KEY": "tnp_live_..." }
    }
  }
}
```

### Cursor

Settings → MCP → Add new global MCP server:

```json
{
  "mcpServers": {
    "tenpo": {
      "command": "npx",
      "args": ["-y", "@tenpo/mcp"],
      "env": { "TENPO_API_KEY": "tnp_live_..." }
    }
  }
}
```

### Codex / Hermes / OpenClaw / any MCP-compatible client

Standard stdio transport — point the client at `npx -y @tenpo/mcp` with `TENPO_API_KEY` in env.

---

## Connecting your store

The first time your AI calls a data tool, Tenpo's onboarding flow walks you through connecting your store. Just say:

> *"connect my Shopify store"*

…and the agent walks you through paste-the-token (Shopify, WooCommerce) or OAuth (Amazon, Etsy). Other platforms supported via lazy-mode adapters: **Squarespace, Wix, BigCommerce, Magento (Adobe Commerce), Salesforce Commerce Cloud, Webflow**, plus CSV/JSON import for any platform.

After the store connects, you can layer in Klaviyo / Mailchimp / Omnisend (email), Meta Ads / Google Ads / TikTok Ads (paid), Google Analytics 4 (attribution), Stripe (payments), and 40+ others.

---

## Pricing

| Tier | Daily call limit | Cost | What you get |
|---|---|---|---|
| **Free** | 500 calls/day | $0 | Full tool access, 1 connected store, Klaviyo + Meta + GA4, no expiry |
| **Pro Monthly** | 5,000 calls/day | $19/mo | Everything in Free + higher limits, priority support |
| **Pro Yearly** | Unlimited | $190/yr | Everything in Pro Monthly, no daily cap, save $38 |

Your same API key keeps working after upgrade — the limit just changes server-side.

When you hit a free-tier limit, every response includes an `upgrade_url` pointing at a hosted Dodo Payments checkout. Pay → tier auto-bumps via webhook → you're on Pro within seconds.

**You always pay for your AI's tokens.** Tenpo runs zero LLMs server-side — every analytical tool is deterministic SQL or HTTP, sub-10ms p50.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Claude Code / Cursor / Claude Desktop / Codex / your MCP host   │
└──────────────────────┬───────────────────────────────────────────┘
                       │ stdio (MCP protocol, JSON-RPC)
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  @tenpo/mcp  (this package — ~5 KB, no LLM, pure proxy)          │
└──────────────────────┬───────────────────────────────────────────┘
                       │ HTTPS, Bearer tnp_live_*
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  api.tenpo.ai  (gateway + runtime — Tenpo's hosted backend)      │
│  ├─ 229 deterministic tools (SQL helpers + HTTP integrations)    │
│  ├─ Per-merchant DuckDB (your store data, encrypted)             │
│  ├─ Background syncs (Klaviyo, Meta, GA4, Stripe — every 15min)  │
│  ├─ Heartbeat detectors (revenue cliff, stockout, refund spike)  │
│  └─ K-anonymous network telemetry (Supabase, retained 90d)       │
└──────────────────────────────────────────────────────────────────┘
```

Your AI does the synthesis. Tenpo provides the synapses.

---

## Privacy

- **Per-merchant DuckDB**: every merchant gets their own database file. No cross-tenant SQL.
- **Salt-hashed merchant IDs** in network telemetry: `sha256(salt + merchant_id)`. Irreversible.
- **PII strip on free text**: emails, phone numbers, $ amounts, IDs, and API tokens are replaced with placeholders before any cross-merchant aggregation.
- **K-anonymity (k≥3)** enforced on every read API: stats only surface when ≥3 distinct merchants contributed.
- **Retention**: raw events 90 days, aggregates indefinitely. Retention cron runs daily in Postgres.
- **No LLM in the analytical path**: your queries don't get fed to any model — Tenpo just runs SQL and returns rows.

---

## Examples

Once installed, ask your AI host things like:

> *"Why is revenue down today?"*
> → calls `tenpo_revenue_trend`, `tenpo_inventory_intelligence`, `tenpo_top_products`; AI synthesizes a one-paragraph answer with the actual numbers

> *"Draft a winback campaign for lapsed champions"*
> → calls `tenpo_creative_dna(mode: draft, goal: winback)` → returns 3 variants with explicit hypotheses → AI fills in the copy → optional: `tenpo_create_campaign(pattern_id: ...)` to launch it via Klaviyo

> *"Which suppliers should I renegotiate with?"*
> → calls `tenpo_supplier_scorecard` → AI ranks D/F-graded suppliers and drafts an opening email via `tenpo_draft_supplier_email`

> *"Which competitor changed prices this week?"*
> → calls `tenpo_competitor_intel(brand: "Allbirds")` → first call scrapes live + caches 24h → returns price-change diff

> *"How am I doing vs other apparel stores my size?"*
> → calls `tenpo_network_intelligence(section: benchmark, category: apparel, metric: aov)` → returns peer median/p20/p80 (k-anonymous, ≥3 merchants required)

---

## Development

```bash
git clone https://github.com/tenpo-ai/tenpo-mcp
cd mcp
npm install
npm run build
TENPO_API_URL=http://localhost:3199 TENPO_API_KEY=tnp_live_... node dist/index.js
```

The MCP package itself is ~200 lines of TypeScript — a thin stdio↔HTTPS proxy. All the intelligence lives at `api.tenpo.ai`.

---

## Status

- Production-grade, running live at [api.tenpo.ai](https://api.tenpo.ai)
- 229 tools exposed, 6 telemetry signal types, k-anonymous network intelligence
- Sub-10ms p50 latency on analytical tools (verified live on multi-GB merchant data)
- Standard Webhooks signature verification + idempotency on billing webhooks

## License

MIT — fork freely. The MCP package is a thin client; the heavy lifting happens on Tenpo's hosted backend.

## Links

- **Website**: [tenpo.ai](https://tenpo.ai)
- **API base**: [api.tenpo.ai](https://api.tenpo.ai)
- **Issues**: [github.com/tenpo-ai/tenpo-mcp/issues](https://github.com/tenpo-ai/tenpo-mcp/issues)
- **Source**: [github.com/tenpo-ai/tenpo-mcp](https://github.com/tenpo-ai/tenpo-mcp)
