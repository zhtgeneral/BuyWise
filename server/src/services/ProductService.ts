import { getJson } from 'serpapi';

export class ProductService {
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
      ).slice(0, 10) || [];

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