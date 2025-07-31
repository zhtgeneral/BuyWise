import { ProductService } from './ProductService';
import Chat from '../models/Chat';
import ProxyLog from '../models/ProxyLog';
import RecommendationCache from '../models/RecommendationCache';
import connectDB from '../lib/db';

export class RecommendationService {
  /**
   * Get product recommendations for a user based on their chat history and click data
   * For new users, returns popular products as default recommendations
   */
  static async getRecommendations(userId?: string, email?: string, limit: number = 10) {
    try {
      await connectDB();

      // Check cache first
      const cacheKey = this.generateCacheKey(userId, email, 'personalized');
      const cachedResult = await this.getCachedRecommendations(cacheKey);
      if (cachedResult) {
        return cachedResult.slice(0, limit);
      }

      // For new users (no history), return popular products as default recommendations
      if (!userId && !email) {
        const defaultRecs = await this.getDefaultRecommendations(limit);
        await this.cacheRecommendations(cacheKey, defaultRecs, 'default');
        return defaultRecs;
      }

      // Extract user interests from chat history and click patterns in parallel
      const [chatInterests, clickPatterns] = await Promise.all([
        email ? this.extractInterestsFromChat(email) : Promise.resolve([]),
        this.analyzeClickPatterns(userId, email)
      ]);

      // If user has some history, generate personalized recommendations
      if (chatInterests.length > 0 || clickPatterns.length > 0) {
        const personalizedRecs = await this.generatePersonalizedRecommendations(chatInterests, clickPatterns, limit);
        await this.cacheRecommendations(cacheKey, personalizedRecs, 'personalized');
        return personalizedRecs;
      }

      // Fallback to default recommendations if no meaningful history
      const defaultRecs = await this.getDefaultRecommendations(limit);
      await this.cacheRecommendations(cacheKey, defaultRecs, 'default');
      return defaultRecs;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  /**
   * Extract product interests from user chat messages
   * Analyzes chat content to identify product categories, brands, and preferences
   */
  private static async extractInterestsFromChat(email: string): Promise<string[]> {
    try {
      const chats = await Chat.find({ email }).sort({ createdAt: -1 }).limit(10);
      
      const interests: string[] = [];
      const productKeywords = [
        'laptop', 'computer', 'pc', 'desktop', 'notebook',
        'smartphone', 'phone', 'mobile', 'iphone', 'android',
        'headphones', 'earbuds', 'speakers', 'audio',
        'gaming', 'console', 'xbox', 'playstation', 'nintendo',
        'camera', 'photography', 'lens',
        'tablet', 'ipad', 'android tablet',
        'smartwatch', 'fitness tracker',
        'appliance', 'refrigerator', 'washing machine', 'microwave',
        'furniture', 'chair', 'desk', 'table',
        'clothing', 'shoes', 'accessories'
      ];

      const brandKeywords = [
        'apple', 'samsung', 'dell', 'hp', 'lenovo', 'asus', 'acer',
        'sony', 'lg', 'nike', 'adidas', 'canon', 'nikon',
        'microsoft', 'google', 'amazon', 'best buy', 'walmart'
      ];

      const priceKeywords = [
        'budget', 'cheap', 'expensive', 'affordable', 'premium',
        'under', 'over', 'dollar', 'price', 'cost'
      ];

      for (const chat of chats) {
        for (const message of chat.messages) {
          const text = message.text.toLowerCase();
          
          // Extract product categories
          for (const keyword of productKeywords) {
            if (text.includes(keyword)) {
              interests.push(keyword);
            }
          }

          // Extract brand preferences
          for (const brand of brandKeywords) {
            if (text.includes(brand)) {
              interests.push(brand);
            }
          }

          // Extract price-related terms
          for (const priceTerm of priceKeywords) {
            if (text.includes(priceTerm)) {
              interests.push(priceTerm);
            }
          }
        }
      }

      // Remove duplicates and return unique interests
      return [...new Set(interests)];
    } catch (error) {
      console.error('Error extracting interests from chat:', error);
      return [];
    }
  }

  /**
   * Analyze user click patterns from ProxyLog
   * Extracts product preferences from user's click history
   */
  private static async analyzeClickPatterns(userId?: string, email?: string): Promise<any[]> {
    try {
      let query: any = {};
      
      if (userId) {
        query.userId = userId;
      }
      
      // TODO: Add email-based query when email field is added to ProxyLog
      // if (email) {
      //   query.email = email;
      // }
      
      const clickLogs = await ProxyLog.find(query)
        .sort({ createdAt: -1 })
        .limit(50);

      // Analyze click patterns to extract product preferences
      const clickAnalysis = {
        categories: new Set<string>(),
        brands: new Set<string>(),
        priceRanges: new Set<string>(),
        stores: new Set<string>(),
        recentClicks: clickLogs.slice(0, 10) // Most recent clicks
      };

      for (const log of clickLogs) {
        const params = log.params || {};
        const title = params.title || '';
        const source = params.source || '';
        
        // Extract product categories from title
        const titleLower = title.toLowerCase();
        if (titleLower.includes('laptop') || titleLower.includes('computer')) {
          clickAnalysis.categories.add('laptop');
        } else if (titleLower.includes('phone') || titleLower.includes('smartphone')) {
          clickAnalysis.categories.add('smartphone');
        } else if (titleLower.includes('headphone') || titleLower.includes('earbud')) {
          clickAnalysis.categories.add('headphones');
        } else if (titleLower.includes('gaming') || titleLower.includes('console')) {
          clickAnalysis.categories.add('gaming');
        } else if (titleLower.includes('camera')) {
          clickAnalysis.categories.add('camera');
        } else if (titleLower.includes('tablet')) {
          clickAnalysis.categories.add('tablet');
        }

        // Extract brands from title and source
        const brandKeywords = ['apple', 'samsung', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'sony', 'lg'];
        for (const brand of brandKeywords) {
          if (titleLower.includes(brand) || source.toLowerCase().includes(brand)) {
            clickAnalysis.brands.add(brand);
          }
        }

        // Extract store preferences
        if (source) {
          clickAnalysis.stores.add(source);
        }

        // Analyze price ranges (if price is available)
        const price = params.price || 0;
        if (price > 0) {
          if (price < 200) {
            clickAnalysis.priceRanges.add('budget');
          } else if (price < 500) {
            clickAnalysis.priceRanges.add('mid-range');
          } else {
            clickAnalysis.priceRanges.add('premium');
          }
        }
      }

      return [clickAnalysis];
    } catch (error) {
      console.error('Error analyzing click patterns:', error);
      return [];
    }
  }

  /**
   * Generate personalized recommendations based on user data
   * Combines chat interests and click patterns to create personalized suggestions
   */
  private static async generatePersonalizedRecommendations(
    interests: string[], 
    clickPatterns: any[], 
    limit: number
  ): Promise<any[]> {
    try {
      const personalizedQueries: string[] = [];
      
      // Extract click analysis if available
      const clickAnalysis = clickPatterns[0];
      
      // Combine chat interests with click patterns
      const allInterests = [...interests];
      
      if (clickAnalysis) {
        // Add categories from clicks
        clickAnalysis.categories.forEach((category: string) => {
          allInterests.push(category);
        });
        
        // Add brands from clicks
        clickAnalysis.brands.forEach((brand: string) => {
          allInterests.push(brand);
        });
        
        // Add price preferences from clicks
        clickAnalysis.priceRanges.forEach((priceRange: string) => {
          allInterests.push(priceRange);
        });
      }

      // Remove duplicates
      const uniqueInterests = [...new Set(allInterests)];

      // Generate search queries based on interests
      if (uniqueInterests.length > 0) {
        // Create queries based on most common interests
        const interestCounts: { [key: string]: number } = {};
        uniqueInterests.forEach(interest => {
          interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        });

        // Sort by frequency and take top interests
        const topInterests = Object.entries(interestCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([interest]) => interest);

        // Generate personalized queries
        for (const interest of topInterests) {
          if (interest === 'laptop' || interest === 'computer') {
            personalizedQueries.push('best laptops under $500');
            personalizedQueries.push('popular laptops');
          } else if (interest === 'smartphone' || interest === 'phone') {
            personalizedQueries.push('best smartphones');
            personalizedQueries.push('popular mobile phones');
          } else if (interest === 'headphones') {
            personalizedQueries.push('best headphones');
            personalizedQueries.push('wireless headphones');
          } else if (interest === 'gaming') {
            personalizedQueries.push('gaming accessories');
            personalizedQueries.push('gaming laptops');
          } else if (interest === 'budget') {
            personalizedQueries.push('best budget laptops');
            personalizedQueries.push('affordable smartphones');
          } else if (interest === 'premium') {
            personalizedQueries.push('premium laptops');
            personalizedQueries.push('high-end smartphones');
          } else {
            // Generic query for other interests
            personalizedQueries.push(`best ${interest}`);
          }
        }

        // Add brand-specific queries if brands are detected
        const brandInterests = uniqueInterests.filter(interest => 
          ['apple', 'samsung', 'dell', 'hp', 'lenovo', 'asus', 'acer'].includes(interest)
        );
        
        for (const brand of brandInterests.slice(0, 2)) {
          personalizedQueries.push(`${brand} products`);
        }
      }

      // If no personalized queries, fall back to default
      if (personalizedQueries.length === 0) {
        return await this.getDefaultRecommendations(limit);
      }

      // Fetch products based on personalized queries in parallel
      const productPromises = personalizedQueries.map(async (query) => {
        try {
          const products = await ProductService.searchProducts(query, 'mobile');
          if (products && products.length > 0) {
            return products.slice(0, Math.ceil(limit / personalizedQueries.length));
          }
          return [];
        } catch (error) {
          console.error(`Error fetching products for personalized query "${query}":`, error);
          return [];
        }
      });

      const productResults = await Promise.all(productPromises);
      const recommendations = productResults.flat();

      // If we don't have enough recommendations, add some default ones
      if (recommendations.length < limit) {
        const defaultRecs = await this.getDefaultRecommendations(limit - recommendations.length);
        recommendations.push(...defaultRecs);
      }

      // Shuffle and limit the recommendations
      const shuffled = recommendations.sort(() => 0.5 - Math.random());
      const limitedRecommendations = shuffled.slice(0, limit);
      
      return this.transformToClientFormat(limitedRecommendations);
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      return await this.getDefaultRecommendations(limit);
    }
  }

  /**
   * Generate cache key for recommendations
   */
  private static generateCacheKey(userId?: string, email?: string, type: string = 'personalized'): string {
    const identifier = userId || email || 'anonymous';
    return `${identifier}_${type}`;
  }

  /**
   * Get cached recommendations if available and not expired
   */
  private static async getCachedRecommendations(cacheKey: string): Promise<any[] | null> {
    try {
      const now = new Date();
      const cached = await RecommendationCache.findOne({
        $or: [
          { userId: cacheKey.split('_')[0] },
          { email: cacheKey.split('_')[0] }
        ],
        type: cacheKey.split('_')[1],
        expiresAt: { $gt: now }
      });

      return cached ? cached.recommendations : null;
    } catch (error) {
      console.error('Error getting cached recommendations:', error);
      return null;
    }
  }

  /**
   * Cache recommendations for 1 hour
   */
  private static async cacheRecommendations(cacheKey: string, recommendations: any[], type: string): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      const identifier = cacheKey.split('_')[0];
      
      // Determine if it's userId or email
      const isUserId = identifier.length === 24 && /^[0-9a-fA-F]{24}$/.test(identifier);
      
      const cacheData: any = {
        type,
        recommendations,
        expiresAt
      };

      if (isUserId) {
        cacheData.userId = identifier;
      } else {
        cacheData.email = identifier;
      }

      await RecommendationCache.findOneAndUpdate(
        { 
          $or: [
            { userId: identifier },
            { email: identifier }
          ],
          type 
        },
        cacheData,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error caching recommendations:', error);
    }
  }

  /**
   * Get default recommendations for new users
   * Returns popular products across different categories
   */
  static async getDefaultRecommendations(limit: number = 10): Promise<any[]> {
    try {
      // Popular product categories for new users
      const defaultQueries = [
        'best selling laptops',
        'popular smartphones',
        'trending headphones',
        'best gaming accessories',
        'popular home appliances'
      ];

      const recommendations: any[] = [];
      
      // Get recommendations from multiple categories in parallel
      const productPromises = defaultQueries.map(async (query) => {
        try {
          const products = await ProductService.searchProducts(query, 'mobile');
          if (products && products.length > 0) {
            // Take 2 products from each category
            return products.slice(0, 2);
          }
          return [];
        } catch (error) {
          console.error(`Error fetching products for query "${query}":`, error);
          return [];
        }
      });

      const productResults = await Promise.all(productPromises);
      recommendations.push(...productResults.flat());

      // Shuffle and limit the recommendations
      const shuffled = recommendations.sort(() => 0.5 - Math.random());
      const limitedRecommendations = shuffled.slice(0, limit);
      
      // Transform to match client expected format
      return this.transformToClientFormat(limitedRecommendations);
    } catch (error) {
      console.error('Error getting default recommendations:', error);
      throw error;
    }
  }

  /**
   * Transform SerpAPI product format to client expected format
   * Creates proxy URLs for product links to track user clicks
   */
  private static transformToClientFormat(products: any[]): any[] {
    return products.map(product => {
      const originalUrl = product.seller_details?.direct_link || product.url || '';
      
      // Create proxy URL if we have a valid original URL
      let proxyUrl = '';
      if (originalUrl) {
        const params = {
          product_id: product.product_id || product.id || '',
          source: product.source || '',
          title: product.title || '',
          price: product.extracted_price || product.price || 0
        };
        proxyUrl = ProductService.createProxyUrl(originalUrl, params);
      }

      return {
        id: product.product_id || product.id || Math.random().toString(36).substring(2, 15),
        source: product.source || 'Unknown',
        title: product.title || 'Product Title',
        image: product.thumbnail || product.image || '',
        price: product.extracted_price || product.price || 0,
        url: proxyUrl || originalUrl, // Use proxy URL if available, fallback to original
        rating: product.rating || 0,
        reviews: product.reviews || 0
      };
    });
  }

  /**
   * Get trending products based on recent activity
   * Analyzes recent clicks to identify trending products
   */
  static async getTrendingProducts(limit: number = 10): Promise<any[]> {
    try {
      await connectDB();
      
      // Check cache first
      const cacheKey = this.generateCacheKey(undefined, undefined, 'trending');
      const cachedResult = await this.getCachedRecommendations(cacheKey);
      if (cachedResult) {
        return cachedResult.slice(0, limit);
      }
      
      // Get recent clicks from the last 48 hours
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      
      const recentClicks = await ProxyLog.find({
        createdAt: { $gte: twoDaysAgo }
      })
      .sort({ createdAt: -1 })
      .limit(100);

      // Analyze trending categories and products
      const trendingAnalysis = {
        categories: new Map<string, number>(),
        brands: new Map<string, number>(),
        products: new Map<string, number>()
      };

      for (const click of recentClicks) {
        const params = click.params || {};
        const title = params.title || '';
        const source = params.source || '';
        
        // Count categories
        const titleLower = title.toLowerCase();
        if (titleLower.includes('laptop') || titleLower.includes('computer')) {
          trendingAnalysis.categories.set('laptop', (trendingAnalysis.categories.get('laptop') || 0) + 1);
        } else if (titleLower.includes('phone') || titleLower.includes('smartphone')) {
          trendingAnalysis.categories.set('smartphone', (trendingAnalysis.categories.get('smartphone') || 0) + 1);
        } else if (titleLower.includes('headphone') || titleLower.includes('earbud')) {
          trendingAnalysis.categories.set('headphones', (trendingAnalysis.categories.get('headphones') || 0) + 1);
        } else if (titleLower.includes('gaming')) {
          trendingAnalysis.categories.set('gaming', (trendingAnalysis.categories.get('gaming') || 0) + 1);
        }

        // Count brands
        const brandKeywords = ['apple', 'samsung', 'dell', 'hp', 'lenovo', 'asus', 'acer'];
        for (const brand of brandKeywords) {
          if (titleLower.includes(brand)) {
            trendingAnalysis.brands.set(brand, (trendingAnalysis.brands.get(brand) || 0) + 1);
          }
        }

        // Count specific products (by title)
        if (title) {
          trendingAnalysis.products.set(title, (trendingAnalysis.products.get(title) || 0) + 1);
        }
      }

      // Generate trending queries based on most clicked categories and brands
      const trendingQueries: string[] = [];
      
      // Add top trending categories
      const topCategories = Array.from(trendingAnalysis.categories.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([category]) => category);

      for (const category of topCategories) {
        trendingQueries.push(`trending ${category}`);
        trendingQueries.push(`popular ${category}`);
      }

      // Add top trending brands
      const topBrands = Array.from(trendingAnalysis.brands.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([brand]) => brand);

      for (const brand of topBrands) {
        trendingQueries.push(`${brand} products`);
      }

      // If no trending data, use default queries
      if (trendingQueries.length === 0) {
        trendingQueries.push('trending laptops');
        trendingQueries.push('popular smartphones');
        trendingQueries.push('best selling products');
      }

      // Fetch trending products in parallel
      const productPromises = trendingQueries.map(async (query) => {
        try {
          const products = await ProductService.searchProducts(query, 'mobile');
          if (products && products.length > 0) {
            return products.slice(0, Math.ceil(limit / trendingQueries.length));
          }
          return [];
        } catch (error) {
          console.error(`Error fetching trending products for query "${query}":`, error);
          return [];
        }
      });

      const productResults = await Promise.all(productPromises);
      const recommendations = productResults.flat();

      // If we don't have enough recommendations, add some default ones
      if (recommendations.length < limit) {
        const defaultRecs = await this.getDefaultRecommendations(limit - recommendations.length);
        recommendations.push(...defaultRecs);
      }

      // Shuffle and limit the recommendations
      const shuffled = recommendations.sort(() => 0.5 - Math.random());
      const limitedRecommendations = shuffled.slice(0, limit);
      const transformedRecommendations = this.transformToClientFormat(limitedRecommendations);
      
      // Cache the results
      await this.cacheRecommendations(cacheKey, transformedRecommendations, 'trending');
      
      return transformedRecommendations;
    } catch (error) {
      console.error('Error getting trending products:', error);
      return await this.getDefaultRecommendations(limit);
    }
  }

  /**
   * Get category-based recommendations
   * TODO: Implement category-specific recommendation logic
   */
  static async getCategoryRecommendations(category: string, limit: number = 10): Promise<any[]> {
    try {
      await connectDB();
      
      // Check cache first
      const cacheKey = this.generateCacheKey(undefined, undefined, 'category');
      const cachedResult = await this.getCachedRecommendations(cacheKey);
      if (cachedResult) {
        return cachedResult.slice(0, limit);
      }
      
      // TODO: Implement category-specific recommendations
      // 1. Use category-specific search queries
      // 2. Consider user preferences within the category
      // 3. Apply category-specific filters
      
      const query = `best ${category}`;
      const products = await ProductService.searchProducts(query, 'mobile');
      const transformedProducts = this.transformToClientFormat(products);
      
      // Cache the results
      await this.cacheRecommendations(cacheKey, transformedProducts, 'category');
      
      return transformedProducts;
    } catch (error) {
      console.error('Error getting category recommendations:', error);
      return await this.getDefaultRecommendations(limit);
    }
  }
} 