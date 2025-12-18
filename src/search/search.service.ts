import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  timestamp: Date;
}

@Injectable()
export class InternetSearchService {
  private readonly logger = new Logger(InternetSearchService.name);
  private readonly searchEngine = process.env.SEARCH_ENGINE || 'google';
  private readonly apiKey = process.env.SEARCH_API_KEY;
  private readonly searchCache = new Map<string, SearchResponse>();

  /**
   * Perform internet search with caching
   */
  async search(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    try {
      // Check cache first
      const cacheKey = `${query}_${maxResults}`;
      if (this.searchCache.has(cacheKey)) {
        this.logger.log(`✅ Cache hit for query: ${query}`);
        return this.searchCache.get(cacheKey)!.results;
      }

      // Use Google Custom Search API (if configured) or fallback to SerpAPI
      let results: SearchResult[] = [];

      if (this.searchEngine === 'google') {
        if (!this.apiKey || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
          this.logger.warn('Google search selected but SEARCH_API_KEY or GOOGLE_SEARCH_ENGINE_ID is missing');
          return [];
        }
        results = await this.googleSearch(query, maxResults);
      } else if (this.searchEngine === 'serpapi') {
        if (!this.apiKey) {
          this.logger.warn('SerpAPI selected but SEARCH_API_KEY is missing');
          return [];
        }
        results = await this.serpApiSearch(query, maxResults);
      } else {
        this.logger.warn('No search API configured');
        return [];
      }

      // Cache results
      this.searchCache.set(cacheKey, {
        query,
        results,
        timestamp: new Date(),
      });

      return results;
    } catch (error) {
      this.logger.error(`❌ Search failed for query "${query}":`, error);
      return [];
    }
  }

  /**
   * Google Custom Search API
   */
  private async googleSearch(query: string, maxResults: number): Promise<SearchResult[]> {
    const url = 'https://www.googleapis.com/customsearch/v1';
    const params = {
      q: query,
      key: this.apiKey,
      cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
      num: Math.min(maxResults, 10),
    };

    try {
      const response = await axios.get(url, { params });
      return (response.data.items || []).map((item: any) => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        source: 'Google',
      }));
    } catch (error: any) {
      this.logger.error(`Google search API error: ${error?.response?.status} ${error?.response?.statusText}`, error?.response?.data || error.message);
      throw error;
    }
  }

  /**
   * SerpAPI search (fallback)
   */
  private async serpApiSearch(query: string, maxResults: number): Promise<SearchResult[]> {
    const url = 'https://serpapi.com/search';
    const params = {
      q: query,
      api_key: this.apiKey,
      num: maxResults,
    };

    try {
      const response = await axios.get(url, { params });
      return (response.data.organic_results || []).slice(0, maxResults).map((result: any) => ({
        title: result.title,
        url: result.link,
        snippet: result.snippet,
        source: 'SerpAPI',
      }));
    } catch (error: any) {
      this.logger.error(`SerpAPI error: ${error?.response?.status} ${error?.response?.statusText}`, error?.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Extract relevant information from search results
   */
  async getRelevantInfo(query: string, maxResults: number = 3): Promise<string> {
    const results = await this.search(query, maxResults);
    
    if (results.length === 0) {
      return 'No search results found.';
    }

    const info = results
      .map((result, index) => `${index + 1}. ${result.title}: ${result.snippet}`)
      .join('\n');

    return `Search results for "${query}":\n${info}`;
  }

  /**
   * Search for current information about a topic
   */
  async getCurrentInfo(topic: string): Promise<string> {
    const query = `${topic} latest news 2024 2025`;
    return this.getRelevantInfo(query, 3);
  }

  /**
   * Clear search cache
   */
  clearCache() {
    this.searchCache.clear();
    this.logger.log('🗑️ Search cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.searchCache.size,
      keys: Array.from(this.searchCache.keys()),
    };
  }
}
