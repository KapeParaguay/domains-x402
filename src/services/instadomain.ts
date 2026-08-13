import axios from 'axios';

export interface DomainSearchResult {
  domain: string;
  tld: string;
  available: boolean;
  price: number;
  currency: string;
  registrar: string;
}

export interface DomainRegistration {
  domain: string;
  tld: string;
  registrant: {
    name: string;
    email: string;
    phone?: string;
    organization?: string;
    country?: string;
  };
  autoRenew?: boolean;
  cloudflareConfig?: boolean;
}

export interface DomainStatus {
  orderId: string;
  domain: string;
  tld: string;
  status: 'pending' | 'active' | 'failed' | 'cancelled';
  registeredAt?: string;
  expiresAt?: string;
  nameservers?: string[];
}

export interface CryptoOrderResponse {
  order_id: string;
  pay_url: string;
  price_usdc: string;
  price_cents: number;
  price_display: string;
  network: string;
  asset: string;
}

export class InstaDomainService {
  private apiUrl = 'https://instadomain.fly.dev';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey || 'public';
  }

  async searchDomain(domain: string, tld: string): Promise<DomainSearchResult> {
    try {
      const fullDomain = `${domain.toLowerCase()}.${tld.toLowerCase()}`;
      const response = await axios.get(`${this.apiUrl}/check/${fullDomain}`);

      return {
        domain: domain.toLowerCase(),
        tld: tld.toLowerCase(),
        available: response.data.available,
        price: 19.99,
        currency: 'USDC',
        registrar: 'InstaDomain'
      };
    } catch (error: any) {
      return {
        domain: domain.toLowerCase(),
        tld: tld.toLowerCase(),
        available: false,
        price: 0,
        currency: 'USDC',
        registrar: 'InstaDomain'
      };
    }
  }

  async buyCrypto(domain: string, registrant: any): Promise<CryptoOrderResponse> {
    try {
      const fullDomain = `${domain.toLowerCase()}`;

      const [domainName, tld] = fullDomain.split('.');
      const parseName = registrant.name?.split(' ') || ['Agent', 'User'];

      const response = await axios.post(`${this.apiUrl}/buy/crypto`, {
        domain: fullDomain,
        registrant: {
          first_name: registrant.first_name || parseName[0] || 'Agent',
          last_name: registrant.last_name || parseName[1] || 'User',
          email: registrant.email,
          phone: registrant.phone || '+1.5555555555',
          org_name: registrant.organization || 'AI Agent',
          address1: registrant.address1 || '123 Main St',
          city: registrant.city || 'San Francisco',
          state: registrant.state || 'CA',
          postal_code: registrant.postal_code || '94102',
          country: registrant.country || 'US'
        }
      });

      return response.data as CryptoOrderResponse;
    } catch (error: any) {
      console.error('Crypto order error:', error.response?.data || error.message);
      throw new Error(`Failed to create crypto order: ${error.response?.data?.detail || error.message}`);
    }
  }

  async registerDomain(registration: DomainRegistration): Promise<DomainStatus> {
    try {
      const fullDomain = `${registration.domain.toLowerCase()}.${registration.tld.toLowerCase()}`;

      const order = await this.buyCrypto(fullDomain, registration.registrant);

      return {
        orderId: order.order_id,
        domain: registration.domain.toLowerCase(),
        tld: registration.tld.toLowerCase(),
        status: 'pending',
        registeredAt: new Date().toISOString()
      };
    } catch (error: any) {
      throw new Error(`Domain registration failed: ${error.message}`);
    }
  }

  async getDomainStatus(orderId: string): Promise<DomainStatus> {
    try {
      const response = await axios.get(`${this.apiUrl}/status/${orderId}`);

      return {
        orderId,
        domain: response.data.domain || 'unknown',
        tld: response.data.tld || 'com',
        status: response.data.status || 'active',
        registeredAt: response.data.created_at,
        expiresAt: response.data.expires_at,
        nameservers: response.data.nameservers || ['ns1.cloudflare.com', 'ns2.cloudflare.com']
      };
    } catch (error: any) {
      return {
        orderId,
        domain: 'unknown',
        tld: 'com',
        status: 'pending'
      };
    }
  }

  async renewDomain(domain: string, tld: string): Promise<{ orderId: string; expiresAt: string }> {
    try {
      const fullDomain = `${domain.toLowerCase()}.${tld.toLowerCase()}`;
      const response = await axios.post(`${this.apiUrl}/renew/${fullDomain}`, {
        years: 1
      });

      return {
        orderId: response.data.order_id || `renew_${Date.now()}`,
        expiresAt: response.data.expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };
    } catch (error: any) {
      throw new Error(`Domain renewal failed: ${error.message}`);
    }
  }

  async listUserDomains(): Promise<DomainStatus[]> {
    return [];
  }
}
