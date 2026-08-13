# domains-x402

Domain registration skill for AgentCash. Register .com/.ai/.dev/.io domains autonomously via x402 USDC payments.

## Quick Start

```bash
# Install
npm install

# Setup env
cp .env.example .env
# Fill: INSTADOMAIN_API_KEY

# Dev
npm run dev

# Build
npm run build

# Start
npm start
```

## API Endpoints

### Search Domain
```bash
POST /x402/domains/search
{
  "domain": "example",
  "tld": "ai"
}
```

Response:
```json
{
  "available": true,
  "domain": "example",
  "tld": "ai",
  "baseCost": 99,
  "yourPrice": "128.70",
  "margin": "29.70",
  "currency": "USDC"
}
```

### Register Domain (with x402 payment)
```bash
POST /x402/domains/purchase
{
  "domain": "example",
  "tld": "ai",
  "registrant": {
    "name": "Agent Name",
    "email": "agent@example.ai"
  },
  "xPaymentProof": {...},
  "agentId": "agent-123"
}
```

Response:
```json
{
  "success": true,
  "domain": "example.ai",
  "status": "active",
  "expiresAt": "2027-08-04",
  "escrowId": "esc_...",
  "txHash": "0x..."
}
```

### Check Domain Status
```bash
GET /x402/domains/status/:orderId
```

### List Domains
```bash
GET /x402/domains/list
```

### Renew Domain
```bash
POST /x402/domains/renew
{
  "domain": "example",
  "tld": "ai",
  "xPaymentProof": {...}
}
```

## Deployment

### Smithery (MCP Playground)
1. Push to GitHub
2. Go to smithery.ai/new
3. Connect repo
4. Auto-builds in 10 min

### Vercel (Production)
```bash
vercel --prod
```

## Features

✅ Search availability + pricing
✅ Atomic escrow (ERC-8183)
✅ Auto Cloudflare DNS config
✅ Auto-renewal management
✅ x402 payment integration
✅ Bulk operations support

## Pricing

| TLD | Cost | Your Price | Margin |
|-----|------|-----------|--------|
| .com | $10.99 | $14.28 | $3.29 |
| .ai | $99 | $128.70 | $29.70 |
| .dev | $21 | $27.30 | $6.30 |
| .io | $52 | $67.60 | $15.60 |

Markup: 30% on all TLDs

## Support

- Docs: https://domains-x402.dev (after deployment)
- Issues: GitHub Issues
- Contact: x402@domains.dev
