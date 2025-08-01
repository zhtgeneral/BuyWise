import express, { Request, Response } from 'express';
import { RecommendationService } from '../services/RecommendationService';
import { authenticate } from '../middleware/auth';
import RecommendationCache from '../models/RecommendationCache';

const router = express.Router();

/**
 * @swagger
 * /api/recommender:
 *   get:
 *     summary: Get personalized product recommendations
 *     tags: [Recommender]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Number of recommendations to return
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Specific category for recommendations (optional)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [personalized, trending, default]
 *           default: personalized
 *         description: Type of recommendations to return
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 recommendedProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "13089528601052672663"
 *                       source:
 *                         type: string
 *                         example: "Best Buy"
 *                       title:
 *                         type: string
 *                         example: "HP 17.3\" HD+ Laptop"
 *                       image:
 *                         type: string
 *                         format: uri
 *                         description: Product image URL
 *                       price:
 *                         type: number
 *                         format: float
 *                         example: 579.99
 *                       url:
 *                         type: string
 *                         format: uri
 *                         description: Product purchase URL
 *                       rating:
 *                         type: number
 *                         format: float
 *                         example: 4.7
 *                       reviews:
 *                         type: integer
 *                         example: 91
 *                 message:
 *                   type: string
 *                   example: "Recommendations retrieved successfully"
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid limit parameter"
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Authentication required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch recommendations"
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { limit = 10, category, type = 'personalized' } = req.query;
    const userId = req.user?.id;
    // TODO: Get user email from database using userId
    // For now, we'll use userId for recommendations
    const email = req.user?.email;

    // Validate limit parameter
    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be a number between 1 and 50'
      });
    }

    let recommendations: any[] = [];

    // Handle different recommendation types
    switch (type) {
      case 'trending':
        recommendations = await RecommendationService.getTrendingProducts(limitNum);
        break;
      
      case 'default':
        recommendations = await RecommendationService.getDefaultRecommendations(limitNum);
        break;
      
      case 'personalized':
      default:
        if (category) {
          // Category-specific recommendations
          recommendations = await RecommendationService.getCategoryRecommendations(
            category as string, 
            limitNum
          );
        } else {
          // Personalized recommendations based on user data
          recommendations = await RecommendationService.getRecommendations(
            userId, 
            email, 
            limitNum
          );
        }
        break;
    }

    console.log(`/api/recommender GET returned ${recommendations.length} recommendations for user ${email || 'anonymous'}`);

    return res.status(200).json({
      success: true,
      recommendedProducts: recommendations,
      message: 'Recommendations retrieved successfully',
      metadata: {
        type,
        category: category || null,
        count: recommendations.length,
        userId: userId || null,
        email: email || null
      }
    });

  } catch (error: any) {
    console.error('/api/recommender GET error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch recommendations'
    });
  }
});

/**
 * @swagger
 * /api/recommender/trending:
 *   get:
 *     summary: Get trending product recommendations
 *     tags: [Recommender]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Number of trending products to return
 *     responses:
 *       200:
 *         description: Trending products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 recommendedProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       source:
 *                         type: string
 *                       title:
 *                         type: string
 *                       image:
 *                         type: string
 *                       price:
 *                         type: number
 *                       url:
 *                         type: string
 *                       rating:
 *                         type: number
 *                       reviews:
 *                         type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/trending', authenticate, async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit as string);
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be a number between 1 and 50'
      });
    }

    const trendingProducts = await RecommendationService.getTrendingProducts(limitNum);

    return res.status(200).json({
      success: true,
      recommendedProducts: trendingProducts,
      message: 'Trending products retrieved successfully'
    });

  } catch (error: any) {
    console.error('/api/recommender/trending GET error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch trending products'
    });
  }
});

/**
 * @swagger
 * /api/recommender/category/{category}:
 *   get:
 *     summary: Get category-specific product recommendations
 *     tags: [Recommender]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Product category (e.g., laptops, smartphones, headphones)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Number of recommendations to return
 *     responses:
 *       200:
 *         description: Category recommendations retrieved successfully
 *       400:
 *         description: Invalid category parameter
 *       500:
 *         description: Internal server error
 */
router.get('/category/:category', authenticate, async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit as string);

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category parameter is required'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be a number between 1 and 50'
      });
    }

    const categoryRecommendations = await RecommendationService.getCategoryRecommendations(
      category, 
      limitNum
    );

    return res.status(200).json({
      success: true,
      recommendedProducts: categoryRecommendations,
      message: `Category recommendations for ${category} retrieved successfully`
    });

  } catch (error: any) {
    console.error('/api/recommender/category/:category GET error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch category recommendations'
    });
  }
});

/**
 * @swagger
 * /api/recommender/refresh:
 *   post:
 *     summary: Force refresh recommendations by clearing cache
 *     tags: [Recommender]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Recommendations cache cleared successfully"
 *       500:
 *         description: Internal server error
 */
router.post('/refresh', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const email = req.user?.email;

    // Clear cache for this user
    const cacheQuery: any = {};
    if (userId) {
      cacheQuery.userId = userId;
    } else if (email) {
      cacheQuery.email = email;
    }

    // Clear all cached recommendations for this user
    await RecommendationCache.deleteMany(cacheQuery);

    console.log(`/api/recommender/refresh POST cleared cache for user ${email || userId || 'anonymous'}`);

    return res.status(200).json({
      success: true,
      message: 'Recommendations cache cleared successfully'
    });

  } catch (error: any) {
    console.error('/api/recommender/refresh POST error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear recommendations cache'
    });
  }
});

export default router; 