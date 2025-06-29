import express, { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';

const router = express.Router();

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products using SerpAPI
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (e.g., "Laptop under $400")
 *       - in: query
 *         name: device
 *         schema:
 *           type: string
 *           enum: [mobile, desktop]
 *         description: Device type for search results
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Location for search results
 *     responses:
 *       200:
 *         description: Products found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                         example: "Popular products"
 *                       thumbnail:
 *                         type: string
 *                         format: uri
 *                         description: Product thumbnail image URL
 *                       source_logo:
 *                         type: string
 *                         format: uri
 *                         description: Source store logo URL
 *                       source:
 *                         type: string
 *                         example: "Best Buy"
 *                       title:
 *                         type: string
 *                         example: "HP 14\" Intel Celeron Laptop"
 *                       rating:
 *                         type: number
 *                         format: float
 *                         example: 4.2
 *                       reviews:
 *                         type: integer
 *                         example: 148
 *                       price:
 *                         type: string
 *                         example: "$199.99"
 *                       extracted_price:
 *                         type: number
 *                         format: float
 *                         example: 199.99
 *                       location:
 *                         type: string
 *                         example: "Nearby, 13 mi"
 *                       product_id:
 *                         type: string
 *                         example: "2197135960910078338"
 *                       seller_details:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             position:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                               example: "Best Buy"
 *                             top_quality_store:
 *                               type: boolean
 *                               example: true
 *                             payment_methods:
 *                               type: string
 *                               example: "PayPal, Zip accepted"
 *                             rating:
 *                               type: number
 *                               format: float
 *                               example: 4.6
 *                             reviews:
 *                               type: integer
 *                               example: 532
 *                             reviews_original:
 *                               type: string
 *                               example: "(532)"
 *                             link:
 *                               type: string
 *                               format: uri
 *                               description: Google redirect link
 *                             direct_link:
 *                               type: string
 *                               format: uri
 *                               description: Direct store link
 *                             details_and_offers:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   text:
 *                                     type: string
 *                                     example: "5.3 mi · In stock at GainesvilleToday: 10:00 AM - 8:00 PM"
 *                             base_price:
 *                               type: string
 *                               example: "$199.99"
 *                             additional_price:
 *                               type: object
 *                               properties:
 *                                 shipping:
 *                                   type: string
 *                                   example: "See website"
 *                             total_price:
 *                               type: string
 *                               example: "$199.99"
 *       400:
 *         description: Invalid search query
 *       500:
 *         description: Error fetching products from SerpAPI
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    /** Note q gets converted into a string by axios */
    /** if q is an array, it becomes undefined */
    const { q, device = 'mobile', location } = req.query;

    console.log("type of query " + typeof q);

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const products = await ProductService.searchProducts(q, device as string, location as string);
    console.log("/api/products/search GET got products from SerpAPI: " + JSON.stringify(products, null, 2));

    return res.status(200).json({
      success: true,
      products: products
    });

  } catch (error: any) {
    console.error('/api/products/search GET Product search error: ', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch products from SerpAPI'
    });
  }
});

export default router; 