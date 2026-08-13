---
name: domains-x402
slug: domains-x402
description: "Autonomous domain registration for AI agents. x402 USDC payments. No setup required."
version: 1.0.0
author: "Fabrizio Augustin"
license: MIT
metadata:
  agentcash:
    category: "commerce"
    tags: ["domains", "x402", "usdc", "base", "commerce"]
    requires:
      env: []
    emoji: 🌐
    pricing_model: "per-transaction"
    currency: "USDC"
    network: "base"
---

# domains-x402

**Autonomous domain registration for AI agents.**

Register domains, manage portfolios, auto-renew. Pay with USDC via x402. Built for agent commerce.

## API Endpoints

### Search Domain
```
POST /x402/domains/search
{
  "domain": "example",
  "tld": "dev"
}

Response:
{
  "available": true,
  "domain": "example",
  "tld": "dev",
  "baseCost": 12.99,
  "yourPrice": "16.89",
  "margin": "3.90",
  "currency": "USDC"
}
```

### Buy Domain (x402)
```
POST /x402/domains/buy-crypto
{
  "domain": "example.dev",
  "registrant": {
    "first_name": "Agent",
    "last_name": "Name",
    "email": "agent@example.com",
    "phone": "+1.5555555555"
  }
}

Response:
{
  "orderId": "ord_xxx",
  "domain": "example.dev",
  "priceUSDC": "16.89",
  "paymentUrl": "https://instadomain.fly.dev/pay/ord_xxx",
  "network": "eip155:8453"
}
```

### Check Order Status
```
GET /x402/domains/buy-crypto/{orderId}/status
```

## Features

✅ **100+ TLDs** (.com, .ai, .dev, .io, .store, .app, etc)  
✅ **x402 payments** (USDC on Base, HTTP 402 standard)  
✅ **Instant registration** via InstaDomain MCP  
✅ **Auto Cloudflare DNS** (ready to use)  
✅ **No setup** (public API, no credentials)  
✅ **Atomic escrow** (payment held until domain active)  

## Pricing

| TLD | Price (USDC) |
|-----|--------------|
| .dev | $12.99 |
| .com | $18.12 |
| .app | $16.99 |
| .xyz | $21.25 |
| .ai | ~$99+ |

*30% markup from wholesale. Bulk discounts available.*

## Use Cases

**Dropshipping Agent**
- Auto-register domains for product sites
- Setup Cloudflare DNS
- Connect checkout (Rye / e-commerce skill)
- Revenue: $500-2000/mo

**Content Agent**
- Register niche domains
- Auto-publish articles
- Monetize with affiliate links
- Revenue: $1000-5000/mo

**SaaS Agents**
- Register custom domains for tenants
- Instant DNS setup
- White-label for end-users
- Revenue: per-domain commission

## Technical

**Backend:** Node.js + Express + TypeScript  
**Payment:** x402 HTTP 402 protocol  
**Registrar:** InstaDomain (OpenSRS/Tucows)  
**DNS:** Cloudflare (auto-configured)  
**Network:** Base blockchain (USDC)  

**GitHub:** https://github.com/fabrizioagustinpfannl/domains-x402  
**Docs:** https://domains-x402.dev  
**Issues:** GitHub Issues

## Getting Started

1. **Search domain:**
   ```bash
   curl -X POST http://localhost:3000/x402/domains/search \
     -H "Content-Type: application/json" \
     -d '{"domain":"example","tld":"dev"}'
   ```

2. **Create order:**
   ```bash
   curl -X POST http://localhost:3000/x402/domains/buy-crypto \
     -H "Content-Type: application/json" \
     -d '{
       "domain": "example.dev",
       "registrant": {
         "first_name": "Agent",
         "last_name": "User",
         "email": "agent@agentcash.dev",
         "phone": "+1.5555555555"
       }
     }'
   ```

3. **Pay via x402:**
   Visit the `paymentUrl` returned in step 2. Sign with your AgentCash wallet.

4. **Domain ready in 2 minutes.**

## FAQ

**Do I own the domain?**  
Yes. You are the legal registrant. domains-x402 is listed as admin/tech contact only.

**Can I transfer to another registrar?**  
Yes. Use InstaDomain's transfer code feature anytime.

**Why x402 instead of Stripe?**  
Fully autonomous. No human approval. Agents self-sovereign. Better UX.

**Multi-chain support?**  
Base (eip155:8453) only for now. Ethereum coming soon.

---

**Built with ❤️ for AI agents.**
