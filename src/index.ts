import express from 'express';
import dotenv from 'dotenv';
import x402Routes from './api/x402';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'domains-x402', timestamp: new Date().toISOString() });
});

// Skill Manifest (for AgentCash marketplace)
app.get('/skill.md', (req, res) => {
  res.type('text/markdown').sendFile(`${process.cwd()}/SKILL.md`);
});

app.get('/skill.json', (req, res) => {
  res.json({
    name: 'domains-x402',
    slug: 'domains-x402',
    description: 'Autonomous domain registration for AI agents. x402 USDC payments. No setup required.',
    version: '1.0.0',
    author: 'Fabrizio Augustin',
    license: 'MIT',
    repository: 'https://github.com/KapeParaguay/domains-x402',
    endpoints: {
      search: 'POST /x402/domains/search',
      buyCrypto: 'POST /x402/domains/buy-crypto',
      status: 'GET /x402/domains/buy-crypto/:orderId/status'
    },
    pricing: {
      model: 'per-transaction',
      currency: 'USDC',
      network: 'base',
      examples: {
        dev: '12.99',
        com: '18.12',
        app: '16.99'
      }
    },
    tags: ['domains', 'x402', 'usdc', 'base', 'commerce']
  });
});

// x402 Routes
app.use('/x402', x402Routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🌐 domains-x402 running on http://localhost:${PORT}`);
  console.log(`📝 SKILL.md: ${process.cwd()}/SKILL.md`);
  console.log(`🔑 API Key required: INSTADOMAIN_API_KEY`);
});

export default app;
