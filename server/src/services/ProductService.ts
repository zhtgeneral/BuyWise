import { getJson } from 'serpapi';
import ProxyLog from '../models/ProxyLog';
import connectDB from '../lib/db';

export class ProductService {
  /**
   * Create a proxy URL with parameters
   */
  static createProxyUrl(originalUrl: string, params: Record<string, any>, userId?: string): string {
    try {
      // Create query string from params
      const queryString = new URLSearchParams(params).toString();
      
      // Create the redirect URL with query parameters
      const redirectUrl = queryString ? `${originalUrl}?${queryString}` : originalUrl;
      
      // Generate a unique proxy URL using BuyWise prefix and timestamp
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const proxyUrl = `/api/buywise/redirect/${timestamp}-${randomString}`;
      
      // Store the proxy mapping in memory or create a temporary entry
      // We'll use a simple approach: encode the data in the URL itself
      const encodedData = Buffer.from(JSON.stringify({
        originalUrl,
        params,
        redirectUrl,
        userId
      })).toString('base64');
      
      // Get the base URL from environment or use default
      const baseUrl = process.env.API_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
      
      return `${baseUrl}${proxyUrl}?data=${encodedData}`;
    } catch (error) {
      console.error('Error creating proxy URL:', error);
      throw error;
    }
  }

  /**
   * Get redirect URL and log the user click
   */
  static async getRedirectUrl(proxyUrl: string, userId?: string, userAgent?: string, ipAddress?: string): Promise<string | null> {
    try {
      // Connect to database
      await connectDB();
      
      // Extract the data from the URL
      const url = new URL(`http://localhost${proxyUrl}`);
      const encodedData = url.searchParams.get('data');
      
      if (!encodedData) {
        return null;
      }
      
      // Decode the data
      const decodedData = JSON.parse(Buffer.from(encodedData, 'base64').toString());
      const { originalUrl, params, redirectUrl, userId: encodedUserId } = decodedData;
      
      // Log the user click
      const proxyLog = new ProxyLog({
        originalUrl,
        proxyUrl,
        params,
        redirectUrl,
        userId: encodedUserId || userId, // Use encoded userId if available, otherwise fall back to parameter
        userAgent,
        ipAddress
      });
      
      await proxyLog.save();
      
      return redirectUrl;
    } catch (error) {
      console.error('Error getting redirect URL:', error);
      throw error;
    }
  }

  /**
   * Get seller details from SerpAPI for a specific product
   */
  private static async getSellerDetails(productId: string) {
    try {
      const productParams = {
        product_id: productId,
        engine: "google_product",
        api_key: process.env.SERPAPI_KEY || 'demo'
      };
      
      const productResponse = await getJson(productParams);

      const sellerResults = productResponse?.sellers_results?.online_sellers;

      const firstValidSeller = sellerResults?.find((seller: any) => seller?.direct_link) || {
        direct_link: "",
      };

      return firstValidSeller;
    } catch (error) {
      console.error('Error fetching seller details:', error);
      return null;
    }
  }

  /**
   * Search products using SerpAPI and enrich with seller details
   */
  static async searchProducts(query: string, device: string = 'mobile', location?: string) {
    try {
      // SerpAPI search parameters
      const searchParams: any = {
        q: query,
        device: device,
        api_key: process.env.SERPAPI_KEY || 'demo'
      };

      if (location) {
        searchParams.location = location;
      }

      const response = await getJson(searchParams);

      if (response.error) {
        throw new Error('Error from SerpAPI: ' + response.error);
      }

      // Filter immersive_products to only include "Popular Products"
      // TODO decide whether to use popular products or all products. Seller details is required for product link. seller details only works for popular products.
      const popularProducts = response["immersive_products"]?.filter((product: any) => 
        product.category === "Popular products"
      ).slice(0, 50) || [];

      const enrichedProducts = await Promise.all(
        popularProducts.map(async (product: any) => {
          const sellerDetails = await this.getSellerDetails(product.product_id);
          return {
            ...product,
            seller_details: sellerDetails
          };
        })
      );
      
      return enrichedProducts;

    } catch (error: any) {
      console.error('ProductService search error:', error);
      throw error;
    }
  }
} 