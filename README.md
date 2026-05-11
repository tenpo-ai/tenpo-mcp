<div align="center">

# Tenpo

**The operator that runs alongside your store.**

Most "AI for e-commerce" tools answer questions about your dashboard.
Tenpo runs your dashboards *for* you — across every platform, every minute, in plain English.

[![npm](https://img.shields.io/npm/v/@tenpo/mcp.svg?style=flat-square&color=000)](https://www.npmjs.com/package/@tenpo/mcp)
[![license](https://img.shields.io/badge/license-MIT-000.svg?style=flat-square)](LICENSE)

[**Get started in 2 lines →**](#install-in-2-lines)  ·  [**See it think →**](#how-tenpo-thinks)  ·  [**What it covers →**](#what-tenpo-covers)

</div>

---

## The problem every store owner has

Your orders are in Shopify. Your marketing is split across Meta, Google, and TikTok. Customer support lives in Gorgias. Email is in Klaviyo. Inventory is somewhere else. Accounting is in Xero.

You can see that revenue dropped. You can't easily see **why**. Is it a stock issue? An ad problem? A supplier delay? A churn wave? You'd need hours of cross-referencing — and most store owners don't have those hours.

Decisions get made on gut feel. Problems get spotted late. Opportunities get missed entirely.

---

## What Tenpo is

Not a dashboard. Not a chatbot. **An operator that runs your store next to you.**

When you ask Tenpo something, it doesn't look up a pre-calculated answer. It queries your live data across every connected platform, traces the cause back through every related signal, attaches a financial impact, and tells you exactly what to do — in one message.

It's like having a business partner who:

- Has memorised every order, product, customer, campaign, and supplier — once you connect them
- Spots problems before they become expensive
- Connects dots no human analyst would realistically cross-reference
- Knows *when to act* and *when to ask*
- Gets smarter about your specific business the longer you work together

You bring an AI host (Claude Desktop, Cursor, Claude Code, Codex, Hermes, OpenClaw — anything that speaks MCP). Tenpo brings the synapses. **Your AI does the thinking, Tenpo provides the truth.**

---

## How Tenpo thinks

The thing that makes Tenpo different isn't a feature. It's how it reasons.

Most tools answer the question you asked. Tenpo answers the question that **matters** — which is usually a different one.

You ask: *"Why is revenue down this week?"*

A normal tool says "revenue dropped 31% vs last week." Accurate but useless.

Tenpo runs this instead:

```
"Revenue is down 31% this week"
              │
    ┌─────────┴──────────┐
    ▼                    ▼
When did it drop?    What drove last
  → Tuesday           week's revenue?
    │                    │
    ▼                    ▼
What happened       Are those products
on Tuesday?         still in stock?
    │                    │
    ▼                    ▼
3 top SKUs went     NO — all 3 went OOS
out of stock        on Tuesday
    │                    │
    └─────────┬──────────┘
              ▼
   Are ads still running on those OOS products?
              │
              ▼
        YES — $840/week wasted
              │
    ┌─────────┴──────────┐
    ▼                    ▼
When's the next      Are customers
PO arriving?         churning because of this?
    │                    │
    ▼                    ▼
14 days away         Repeat purchase rate
$22K/day at risk     dropped 68% → 51%
= $3.1K total risk   = frustrated buyers
                       going to competitors
```

One question. Seven angles investigated. A full causal chain — from symptom to root, with dollars attached at every step.

This is **multi-directional thinking**. Tenpo keeps pulling threads until it finds the *full* answer, not just *an* answer. Every response follows the same four-part shape:

> **What I'm seeing** → **Why this is happening** → **What this means** → **What I'd do about it**

---

## The cascade effect

In real businesses, nothing happens in isolation. Tenpo knows this.

You say four words: *"I received PO #42."*

Here's what happens automatically:

| Step | Action |
|---|---|
| 1 | Marks PO #42 received, updates stock levels |
| 2 | Finds 3 waiting orders for those SKUs — fulfils them |
| 3 | Notices Meta + Google ads were paused on those SKUs (because they were OOS) — resumes them |
| 4 | Records the $48,000 expense in Xero |
| 5 | Updates the supplier's reliability score for next time |
| 6 | Notes: "Klaviyo not connected — back-in-stock email would have triggered for 47 customers" |

Nine things across five platforms. **Every action triggers a chain reaction.** You did nothing but say four words.

---

## What Tenpo covers

Eight sectors. One operator. **You don't need to know which tool to call — just describe the outcome you want.**

<table>
<tr>
<th align="left">Sector</th>
<th align="left">What you can ask</th>
</tr>

<tr><td><b>Sales & Revenue</b></td><td>

How is my store doing this week · what's driving / killing revenue · best and worst products by margin · daily business overview · forecast next month's revenue · why did Tuesday spike

</td></tr>

<tr><td><b>Inventory & Suppliers</b></td><td>

What's about to run out · what to reorder (and how much) · which products are dead stock tying up cash · supplier reliability scorecards (A/B/C/D/F) · generate a PO and email it to my supplier · read incoming supplier emails and extract quotes · compare quotes from 3 suppliers · mark PO #42 received → cascade everything

</td></tr>

<tr><td><b>Marketing & Email</b></td><td>

Draft a winback campaign for lapsed champions · send a Klaviyo campaign · design a 30-day content calendar · A/B test subject lines · build a flash-sale flow · find cross-sell opportunities · which customers haven't bought in 60 days

</td></tr>

<tr><td><b>Paid Ads</b></td><td>

What's my true ROAS after COGS + shipping + fees · which campaigns to pause right now · reallocate budget from underperformers to winners · pause ads on out-of-stock products · auto-pause if ROAS drops below 2× · generate ad copy and creative concepts · campaign performance with revenue attribution

</td></tr>

<tr><td><b>Customers</b></td><td>

Who's about to churn · predicted next order date per customer · top 1% / 10% / 25% concentration risk · cross-sell next-best-product · win-back the right customers at the right time · respond to support tickets in Gorgias / Zendesk · reply to reviews on Trustpilot / Okendo / Judge.me

</td></tr>

<tr><td><b>Finance & Operations</b></td><td>

P&L waterfall (gross → COGS → fees → ad spend → operating profit) · what's leaking at each step · process Stripe refunds · push invoices to Xero / QuickBooks · create shipping labels · track shipments · sales-tax nexus monitoring · payout holds and disputes

</td></tr>

<tr><td><b>Competitors</b></td><td>

What's [competitor] priced at right now · who dropped prices this week · what emails are top brands sending this month · new SKUs they launched · their promo cadence · benchmark my AOV / LTV / repurchase rate against peers in my category (anonymous, k≥3 merchants)

</td></tr>

<tr><td><b>Automation</b></td><td>

Every Monday morning, send me a store overview · when revenue drops 30%, ping me on WhatsApp · auto-pause ads on OOS products · trigger the win-back flow when a customer hits 60 days quiet · let me approve once and never ask again for the same pattern

</td></tr>

</table>

Eight headline sectors. Behind them: **47 platform integrations, 229 tools your AI can call, and 100+ specialist skills loaded automatically based on what you ask.**

---

## Beyond data — built-in expertise

Tenpo isn't just retrieving data. It applies deep, structured expertise to interpret it.

When you ask Tenpo to write a campaign, it doesn't just write copy — it picks the right **psychological framework** for the moment:

| You're trying to… | Tenpo reaches for… |
|---|---|
| Convert hesitant first-time visitors | Loss Aversion + Social Proof |
| Move slow-selling inventory | Decoy Effect + Scarcity |
| Bring back lapsed customers | Zeigarnik Effect + Reciprocity |
| Increase average order value | Anchoring + Bundling Psychology |
| Reduce cart abandonment | Endowment Effect + Commitment Consistency |
| Launch a new product | Authority Bias + Social Proof |
| Run a flash sale | Scarcity + Urgency + Peak-End Rule |
| Re-engage a cold email list | Curiosity Gap + Reciprocity |

When you ask about pricing, it thinks in a **Velocity × Margin matrix**. When you ask about churn, it knows the recovery probability decays from 25% at 30 days to <1% at 180+ days, and routes each customer to the right message at the right time. When you ask about conversion, it audits the full funnel — traffic quality → landing experience → product page → checkout → post-purchase → retention — not just the headline number.

**No human campaign manager coordinates all of this in a single pass. Tenpo does it every time, in seconds.**

---

## Background watchers — for connected stores

Once you've connected at least one integration, Tenpo runs background checks on your data automatically — no tier upgrade required, no manual setup:

| Watcher | What it catches |
|---|---|
| **Stock risk** | Products getting dangerously close to selling out before the next supplier delivery |
| **Revenue cliff** | Unexplained week-over-week revenue drops |
| **Refund spike** | Today's refund count exceeding 3× the recent baseline |
| **ROAS death** | Ad campaigns running below breakeven |
| **Dead stock with active ads** | Ad spend on SKUs that haven't sold in 14+ days while inventory sits |
| **Payment failure spike** | Stripe / processor anomalies signalling card-data drift or outages |
| **Inventory desync** | DB stock says "available", Shopify says "out" — pipeline drift |

When a watcher fires, you get a notification on the channel you set up — Telegram, WhatsApp, Slack, or email. When the situation resolves itself, the alert closes automatically.

> **What this needs:** at least one connected store + a notification channel set up. Watchers don't run for accounts that registered but never connected anything (we don't burn cycles on empty data).

---

## Install in 2 lines

```bash
npx -y @tenpo/mcp
```

That's the first line. **First run auto-issues a free API key** (500 calls/month, no expiry, no card, no signup form). The key prints once in the host's stderr — copy it into your config so it's reused next time.

The second line goes into your AI host's config:

> ⚠️ **After editing the config, fully restart your AI host.**
> MCP servers are loaded at host startup — `claude mcp add`, saving Claude Desktop's config, or editing Cursor's MCP settings will register Tenpo, but the new tools won't appear in your running session until you **quit and relaunch the app** (Cmd+Q on Mac, fully close on Windows). This is a host-side limitation, not a Tenpo one.

<details>
<summary><b>Claude Desktop</b> · <code>claude_desktop_config.json</code></summary>

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

Restart Claude Desktop. The first call prints your auto-generated key — paste it into `env.TENPO_API_KEY` to keep using the same one across restarts:

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

</details>

<details>
<summary><b>Claude Code</b> (CLI)</summary>

```bash
claude mcp add tenpo --command "npx -y @tenpo/mcp"
```

The first call auto-issues your key. Add it to the env if you want it persisted across machines.

</details>

<details>
<summary><b>Cursor</b></summary>

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

Leave `TENPO_API_KEY` blank on first run — it'll be auto-issued and printed. Then paste it in.

</details>

<details>
<summary><b>Codex · OpenClaw · Hermes · or any MCP-compatible host</b></summary>

Standard stdio transport. Point the client at `npx -y @tenpo/mcp`. The package is a small stdio↔HTTPS proxy — works in any MCP host.

You don't need to provide an API key on first run. The MCP package will:

1. See no `TENPO_API_KEY` in env
2. Call the public `/api/v1/connect/issue-key` endpoint
3. Print your new key to stderr in a framed banner
4. Use it for the rest of the session

Save the key from that banner into `env.TENPO_API_KEY` so subsequent runs reuse it (otherwise a new key is issued each time).

</details>

Once installed, just talk to your AI as you normally would. Say *"connect my store"* and Tenpo walks you through it.

---

## Connecting your store

Tenpo supports any storefront. Just say which one you're on:

| Native, paste-token (90 sec) | Native OAuth (3 min) | Custom adapters (5 min) | Anything else |
|---|---|---|---|
| Shopify, WooCommerce | Amazon, Etsy | Squarespace, Wix, BigCommerce, Magento, Adobe Commerce, Salesforce Commerce Cloud, Webflow | CSV / JSON import — accepts Shopify, Woo, and Stripe export formats as-is |

After your store connects, layer in the platforms that matter to you — Klaviyo, Mailchimp, Omnisend, Meta Ads, Google Ads, TikTok Ads, Google Analytics 4, Stripe, Gorgias, Zendesk, Xero, QuickBooks, Slack, Telegram, WhatsApp, 30+ others. Each one is a one-line ask: *"connect my Klaviyo."*

---

## Pricing

| Tier | Cap | Price | What you get |
|---|---|---|---|
| **Free** | 500 calls / **month** | $0 | Every tool. Every integration. 1 connected store. No expiry. No card. |
| **Pro Monthly** | **Unlimited** | $19 / month | Everything in Free with no monthly cap. |
| **Pro Yearly** | **Unlimited** | $190 / year | Same as Pro Monthly, save $38. |

Your same API key works across tiers — upgrade just lifts the cap server-side. When you hit the free-tier cap, every response includes a one-click upgrade link. Pay → cap lifts in seconds (Dodo Payments).

The monthly cap resets on the 1st (UTC). 500 calls is roughly 50–80 user messages a month — enough to evaluate, plus comfortable light use.

**You always pay for your AI's tokens. Tenpo runs no LLM in the analytical path on our side** — every analytical tool is deterministic SQL or HTTP. That's why the free tier is genuinely free.

---

## How it works under the hood

```
┌──────────────────────────────────────────────────────────────────┐
│  Claude Desktop · Cursor · Claude Code · Codex · Hermes · etc.   │
└──────────────────────┬───────────────────────────────────────────┘
                       │  MCP protocol (stdio JSON-RPC)
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  @tenpo/mcp  (this package — small stdio↔HTTPS proxy)            │
└──────────────────────┬───────────────────────────────────────────┘
                       │  HTTPS, Bearer tnp_live_*
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  Tenpo backend                                                   │
│  ├─ 229 deterministic tools (SQL helpers + HTTP integrations)    │
│  ├─ Per-merchant database (your data, isolated, encrypted)       │
│  ├─ Background syncs every 15 min (only for connected merchants) │
│  ├─ Background watchers (revenue, stock, supplier, churn, ads…)  │
│  └─ Anonymous network telemetry (peer benchmarks, k≥3 merchants) │
└──────────────────────────────────────────────────────────────────┘
```

Your AI does the synthesis. Tenpo provides the synapses.

---

## Privacy

- **Your data is yours.** Per-merchant database, isolated from every other merchant. No cross-tenant queries are possible.
- **Network telemetry is anonymous.** When Tenpo learns from cross-merchant patterns (e.g. "what most stores in your category approve"), merchant IDs are salt-hashed irreversibly. Free-text fields (email, phone, $ amounts, IDs, API tokens) are stripped to placeholders before any aggregation.
- **K-anonymity (k≥3).** No stat surfaces until at least 3 distinct merchants contributed to it. You're never the only data point.
- **No LLM on the analytical path.** Your data isn't sent to a model — Tenpo runs SQL and returns rows. Your AI host (Claude, Cursor, etc.) sees the rows and writes a sentence.
- **Retention.** Raw events expire after 90 days. Aggregates kept indefinitely (already anonymised).

---

## Examples of what to ask

Plug Tenpo in. Then ask your AI host things like:

> *"How is my store doing this week?"*

> *"Why is revenue down today?"*

> *"What are the 3 highest-leverage things I should fix this week?"*

> *"Draft a winback campaign for customers who lapsed 60+ days ago."*

> *"Generate a PO for my top supplier for the 5 SKUs about to run out, and email it."*

> *"Which Meta ads should I pause right now? Show me the dollars I'd save."*

> *"What's my true ROAS this month after COGS, shipping, and Stripe fees?"*

> *"Which suppliers should I renegotiate with? Rank them with a grade."*

> *"Who's about to churn, and what should I send each segment?"*

> *"Every Monday at 9am, send me a one-paragraph store brief on WhatsApp."*

> *"Compare my AOV to other apparel stores my size."*

You don't need to know which tool runs. You don't need to learn a syntax. **Just describe the outcome.** Your AI picks the tools, Tenpo runs them, and the answer comes back grounded in real numbers.

---

## Status

- 🟢 Backend live at `api.tenpo.ai`
- 🟢 Sub-10ms p50 latency on analytical tools (verified live)
- 🟢 47 platform integrations
- 🟢 Anonymous network intelligence with peer benchmarks
- 🟡 Public-facing site at tenpo.ai is in active development

---

## Support

Questions, issues, feedback → **contact@tenpo.ai**

---

## License

MIT — fork freely. The MCP package is a thin client; all the intelligence lives in Tenpo's hosted backend.
