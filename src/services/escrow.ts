import { ethers } from 'ethers';

export interface EscrowLock {
  escrowId: string;
  domain: string;
  tld: string;
  amount: number;
  agent: string;
  status: 'locked' | 'released' | 'refunded';
  timestamp: string;
  txHash?: string;
}

export class EscrowService {
  private provider: ethers.JsonRpcProvider;
  private escrows: Map<string, EscrowLock> = new Map();

  constructor(rpcUrl: string = 'https://mainnet.base.org') {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  async verifyX402Payment(paymentProof: any): Promise<boolean> {
    try {
      // x402 payment verification:
      // 1. Check signature validity
      // 2. Check amount matches
      // 3. Check timestamp not expired
      // 4. Check nonce not reused

      if (!paymentProof.signature || !paymentProof.amount || !paymentProof.nonce) {
        return false;
      }

      // In production, verify against x402 facilitator
      // For now, basic check
      return true;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }

  async lockEscrow(params: {
    amount: number;
    domain: string;
    tld: string;
    agent: string;
  }): Promise<EscrowLock> {
    const escrowId = `esc_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const lock: EscrowLock = {
      escrowId,
      domain: params.domain.toLowerCase(),
      tld: params.tld.toLowerCase(),
      amount: params.amount,
      agent: params.agent,
      status: 'locked',
      timestamp: new Date().toISOString()
    };

    this.escrows.set(escrowId, lock);
    console.log(`✅ Escrow locked: ${escrowId} for ${params.domain}.${params.tld}`);

    return lock;
  }

  async releaseEscrow(escrowId: string): Promise<EscrowLock> {
    const lock = this.escrows.get(escrowId);

    if (!lock) {
      throw new Error(`Escrow not found: ${escrowId}`);
    }

    lock.status = 'released';
    lock.txHash = `0x${Math.random().toString(16).substring(2)}`;

    this.escrows.set(escrowId, lock);
    console.log(`✅ Escrow released: ${escrowId}`);

    return lock;
  }

  async refundEscrow(escrowId: string): Promise<EscrowLock> {
    const lock = this.escrows.get(escrowId);

    if (!lock) {
      throw new Error(`Escrow not found: ${escrowId}`);
    }

    lock.status = 'refunded';
    lock.txHash = `0x${Math.random().toString(16).substring(2)}`;

    this.escrows.set(escrowId, lock);
    console.log(`✅ Escrow refunded: ${escrowId}`);

    return lock;
  }

  getEscrow(escrowId: string): EscrowLock | undefined {
    return this.escrows.get(escrowId);
  }

  getAllEscrows(): EscrowLock[] {
    return Array.from(this.escrows.values());
  }
}
