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
