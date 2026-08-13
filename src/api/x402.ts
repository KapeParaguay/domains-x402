import express, { Request, Response, Router } from 'express';
import { InstaDomainService } from '../services/instadomain';
import { EscrowService } from '../services/escrow';

const router = Router();
const instadomain = new InstaDomainService(process.env.INSTADOMAIN_API_KEY!);
const escrow = new EscrowService(process.env.RPC_URL);

// POST /x402/domains/search
router.post('/domains/search', async (req: Request, res: Response) => {
  try {
    const { domain, tld } = req.body;

    if (!domain || !tld) {
      return res.status(400).json({ error: 'domain and tld required' });
    }

    const result = await instadomain.searchDomain(domain, tld);
    const yourPrice = (result.price * 1.3).toFixed(2);

    // x402 Payment Info Header
    res.set('x-payment-info', JSON.stringify({
      amount: yourPrice,
      currency: 'USDC',
      network: 'base',
      recipient: process.env.WALLET_ADDRESS
    }));

    res.json({
      available: result.available,
      domain: domain.toLowerCase(),
      tld: tld.toLowerCase(),
      baseCost: result.price,
      yourPrice,
      margin: (parseFloat(yourPrice) - result.price).toFixed(2),
      currency: 'USDC'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /x402/domains/purchase
router.post('/domains/purchase', async (req: Request, res: Response) => {
  try {
    const { domain, tld, registrant, xPaymentProof, agentId } = req.body;

    if (!domain || !tld || !registrant) {
      return res.status(400).json({ error: 'domain, tld, and registrant required' });
    }

    // 1. Verify x402 Payment
    const paymentValid = await escrow.verifyX402Payment(xPaymentProof);
    if (!paymentValid) {
      return res.status(402).json({
        error: 'Payment required',
        code: 'PAYMENT_REQUIRED',
        headers: {
          'x-payment-info': JSON.stringify({
            amount: '128.70',
            currency: 'USDC',
            network: 'base'
          })
        }
      });
    }

    // 2. Lock Escrow
    const searchResult = await instadomain.searchDomain(domain, tld);
    const escrowLock = await escrow.lockEscrow({
      amount: searchResult.price,
      domain: domain.toLowerCase(),
      tld: tld.toLowerCase(),
      agent: agentId || 'anonymous'
    });

    // 3. Register Domain
    const orderResult = await instadomain.registerDomain({
      domain: domain.toLowerCase(),
      tld: tld.toLowerCase(),
      registrant: {
        name: registrant.name || 'Agent Owner',
        email: registrant.email || 'noreply@agentcash.dev',
        phone: registrant.phone,
        organization: registrant.organization || 'AI Agent'
      },
      autoRenew: true,
      cloudflareConfig: true
    });

    // 4. Check Status
    const status = await instadomain.getDomainStatus(orderResult.orderId);

    if (status.status === 'active') {
      // 5. Release Escrow
      await escrow.releaseEscrow(escrowLock.escrowId);

      res.json({
        success: true,
        domain: `${domain.toLowerCase()}.${tld.toLowerCase()}`,
        orderId: orderResult.orderId,
        status: 'active',
        expiresAt: status.expiresAt,
        escrowId: escrowLock.escrowId,
        txHash: escrowLock.txHash,
        message: 'Domain registered successfully'
      });
    } else {
      // 6. Refund if Failed
      await escrow.refundEscrow(escrowLock.escrowId);

      res.status(400).json({
        error: 'Domain registration failed',
        status: status.status,
        orderId: orderResult.orderId,
        refunded: true,
        escrowId: escrowLock.escrowId
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /x402/domains/status/:orderId
router.get('/domains/status/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const status = await instadomain.getDomainStatus(orderId);

    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /x402/domains/list
router.get('/domains/list', async (req: Request, res: Response) => {
  try {
    const domains = await instadomain.listUserDomains();
    res.json({ domains, count: domains.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /x402/domains/buy-crypto (simplified x402 flow)
router.post('/domains/buy-crypto', async (req: Request, res: Response) => {
  try {
    const { domain, registrant, agentId } = req.body;

    if (!domain || !registrant?.email) {
      return res.status(400).json({ error: 'domain and registrant.email required' });
    }

    // Create crypto order via InstaDomain
    const order = await instadomain.buyCrypto(domain, registrant);

    res.json({
      orderId: order.order_id,
      domain,
      priceUSDC: order.price_usdc,
      paymentUrl: `https://instadomain.fly.dev${order.pay_url}`,
      network: order.network,
      asset: order.asset,
      message: 'Order created. Visit paymentUrl and pay with x402 USDC'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /x402/domains/buy-crypto/:orderId/status
router.get('/domains/buy-crypto/:orderId/status', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const status = await instadomain.getDomainStatus(orderId);

    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /x402/domains/renew
router.post('/domains/renew', async (req: Request, res: Response) => {
  try {
    const { domain, tld, xPaymentProof } = req.body;

    if (!domain || !tld) {
      return res.status(400).json({ error: 'domain and tld required' });
    }

    // Verify payment
    const paymentValid = await escrow.verifyX402Payment(xPaymentProof);
    if (!paymentValid) {
      return res.status(402).json({ error: 'Payment required' });
    }

    const result = await instadomain.renewDomain(domain, tld);

    res.json({
      success: true,
      domain: `${domain}.${tld}`,
      orderId: result.orderId,
      expiresAt: result.expiresAt,
      message: 'Domain renewed successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
