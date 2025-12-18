import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface DomainInfo {
  domain: string;
  available: boolean;
  registered: boolean;
  registrar?: string;
  expirationDate?: string;
  price?: number;
}

export interface RegistrationQuote {
  domain: string;
  pricePerYear: number;
  currency: string;
  years: number;
  registrar: string;
  features: string[];
}

@Injectable()
export class DomainService {
  private readonly logger = new Logger(DomainService.name);
  private readonly whoisApi = 'https://www.whoisapi.com/api/v1';
  private readonly domainApi = process.env.DOMAIN_API_KEY;
  private readonly registrars = {
    namecheap: 'https://api.namecheap.com/api/v1/users/address/getList',
    godaddy: 'https://api.godaddy.com/v1/domains/available',
  };

  /**
   * Check if a domain is available
   */
  async checkDomainAvailability(domain: string): Promise<DomainInfo> {
    try {
      const normalizedDomain = this.normalizeDomain(domain);

      // Try GoDaddy API first
      const godaddyResult = await this.checkGoDaddyAvailability(normalizedDomain);
      if (godaddyResult) return godaddyResult;

      // Fallback to WHOIS API
      return await this.checkWhoisAvailability(normalizedDomain);
    } catch (error) {
      this.logger.error(`❌ Error checking domain ${domain}:`, error);
      return {
        domain,
        available: false,
        registered: true,
        registrar: 'Unknown',
      };
    }
  }

  /**
   * Check availability via GoDaddy API
   */
  private async checkGoDaddyAvailability(domain: string): Promise<DomainInfo | null> {
    try {
      if (!process.env.GODADDY_API_KEY) return null;

      const response = await axios.get(`${this.registrars.godaddy}/${domain}`, {
        headers: {
          Authorization: `sso-key ${process.env.GODADDY_API_KEY}:${process.env.GODADDY_API_SECRET}`,
        },
      });

      return {
        domain,
        available: response.data.available,
        registered: !response.data.available,
        registrar: 'GoDaddy',
      };
    } catch {
      return null;
    }
  }

  /**
   * Check availability via WHOIS API
   */
  private async checkWhoisAvailability(domain: string): Promise<DomainInfo> {
    try {
      if (!this.domainApi) {
        return {
          domain,
          available: false,
          registered: true,
          registrar: 'Unknown',
        };
      }

      const response = await axios.get(
        `${this.whoisApi}?apiKey=${this.domainApi}&domainName=${domain}`,
      );

      if (!response.data || !response.data.result) {
        this.logger.warn(`⚠️ WHOIS API returned unexpected payload for ${domain}: ${JSON.stringify(response.data)}`);
        return {
          domain,
          available: false,
          registered: true,
          registrar: 'Unknown',
        };
      }

      const available = response.data.result?.registrar === 'Not found';

      return {
        domain,
        available,
        registered: !available,
        registrar: response.data.result?.registrar,
        expirationDate: response.data.result?.expirationDate,
      };
    } catch (error: any) {
      this.logger.warn(`⚠️ WHOIS lookup failed for ${domain}: ${error?.message || error}`);
      return {
        domain,
        available: false,
        registered: true,
        registrar: 'Unknown',
      };
    }
  }

  /**
   * Get domain registration quote
   */
  async getDomainQuote(domain: string, years: number = 1): Promise<RegistrationQuote | null> {
    try {
      const normalizedDomain = this.normalizeDomain(domain);

      // Check availability first
      const domainInfo = await this.checkDomainAvailability(normalizedDomain);
      if (domainInfo.registered) {
        this.logger.log(`⚠️ Domain ${normalizedDomain} is already registered`);
        return null;
      }

      // Get quote from GoDaddy
      const quote = await this.getGoDaddyQuote(normalizedDomain, years);
      if (quote) return quote;

      // Return default estimate
      return {
        domain: normalizedDomain,
        pricePerYear: 10.99,
        currency: 'USD',
        years,
        registrar: 'Standard Registrar',
        features: ['Email forwarding', 'Domain lock', 'Privacy protection available'],
      };
    } catch (error) {
      this.logger.error(`❌ Error getting quote for ${domain}:`, error);
      return null;
    }
  }

  /**
   * Get quote from GoDaddy
   */
  private async getGoDaddyQuote(domain: string, years: number): Promise<RegistrationQuote | null> {
    try {
      if (!process.env.GODADDY_API_KEY) return null;

      const response = await axios.post(
        'https://api.godaddy.com/v1/domains/purchase/schema',
        {
          domain,
          years,
        },
        {
          headers: {
            Authorization: `sso-key ${process.env.GODADDY_API_KEY}:${process.env.GODADDY_API_SECRET}`,
          },
        },
      );

      return {
        domain,
        pricePerYear: response.data.price?.registration?.cost || 10.99,
        currency: response.data.price?.currency || 'USD',
        years,
        registrar: 'GoDaddy',
        features: ['Email forwarding', 'Domain lock', 'Privacy protection'],
      };
    } catch {
      return null;
    }
  }

  /**
   * Register a domain (would require payment gateway integration)
   */
  async registerDomain(
    domain: string,
    registrationDetails: {
      years: number;
      ownerEmail: string;
      registrar?: string;
    },
  ): Promise<{ success: boolean; message: string; orderId?: string }> {
    try {
      // Check if available
      const availability = await this.checkDomainAvailability(domain);
      if (availability.registered) {
        return {
          success: false,
          message: `Domain ${domain} is not available for registration`,
        };
      }

      // This would integrate with actual registrar APIs
      this.logger.log(`📝 Domain registration initiated for ${domain}`);

      return {
        success: true,
        message: `Domain registration for ${domain} initiated`,
        orderId: `ORD-${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(`❌ Registration error:`, error);
      return {
        success: false,
        message: 'Failed to process registration',
      };
    }
  }

  /**
   * Get domain suggestions
   */
  async getDomainSuggestions(keyword: string, extensions: string[] = ['com', 'net', 'io', 'app']): Promise<string[]> {
    try {
      const suggestions = extensions
        .map(ext => `${keyword}.${ext}`)
        .concat([
          `${keyword}online.com`,
          `${keyword}pro.com`,
          `get${keyword}.com`,
          `the${keyword}.com`,
        ]);

      // Check availability for suggestions
      const availableSuggestions: string[] = [];

      for (const domain of suggestions.slice(0, 10)) {
        const info = await this.checkDomainAvailability(domain);
        if (info.available) {
          availableSuggestions.push(domain);
        }
      }

      return availableSuggestions.slice(0, 5);
    } catch (error) {
      this.logger.error(`❌ Error generating suggestions:`, error);
      return [];
    }
  }

  /**
   * Normalize domain name
   */
  private normalizeDomain(domain: string): string {
    return domain
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\/(www\.)?/, '')
      .replace(/\/$/, '');
  }

  /**
   * Get domain information summary
   */
  async getDomainSummary(domain: string): Promise<string> {
    const normalizedDomain = this.normalizeDomain(domain);
    const availability = await this.checkDomainAvailability(normalizedDomain);

    if (availability.available) {
      const quote = await this.getDomainQuote(normalizedDomain);
      return `Domain ${normalizedDomain} is available for registration. Registration fee: $${quote?.pricePerYear}/year`;
    } else {
      return `Domain ${normalizedDomain} is already registered by ${availability.registrar || 'unknown registrar'}${
        availability.expirationDate ? ` and expires on ${availability.expirationDate}` : ''
      }`;
    }
  }
}
