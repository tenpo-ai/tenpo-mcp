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
export {};
