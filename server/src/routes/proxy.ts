import express from 'express';
import { ProductService } from '../services/ProductService';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ProxyCreateRequest:
 *       type: object
 *       required:
 *         - url
 *         - params
 *       properties:
 *         url:
 *           type: string
 *           description: The original URL to redirect to
 *           example: "https://amazon.com/product"
 *         params:
 *           type: object
 *           description: Query parameters to append to the URL
 *           example: { "asin": "B08N5WRWNW", "ref": "buywise" }
 *     
 *     ProxyCreateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         proxyUrl:
 *           type: string
 *           description: The generated proxy URL (full URL)
 *           example: "http://localhost:3000/api/buywise/redirect/1703123456789-abc123?data=eyJvcmlnaW5hbFVybCI6..."
 *         originalUrl:
 *           type: string
 *           description: The original URL provided
 *           example: "https://amazon.com/product"
 *         params:
 *           type: object
 *           description: The parameters that will be appended
 *           example: { "asin": "B08N5WRWNW", "ref": "buywise" }
 *     
 *     ProxyLog:
 *       type: object
 *       properties:
 *         originalUrl:
 *           type: string
 *           description: The original URL
 *           example: "https://amazon.com/product"
 *         proxyUrl:
 *           type: string
 *           description: The proxy URL that was accessed
 *           example: "/api/buywise/redirect/1703123456789-abc123"
 *         params:
 *           type: object
 *           description: The parameters that were used
 *           example: { "asin": "B08N5WRWNW", "ref": "buywise" }
 *         redirectUrl:
 *           type: string
 *           description: The final URL with parameters
 *           example: "https://amazon.com/product?asin=B08N5WRWNW&ref=buywise"
 *         userId:
 *           type: string
 *           description: User ID if authenticated
 *           example: "507f1f77bcf86cd799439011"
 *         userAgent:
 *           type: string
 *           description: User agent string
 *           example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *         ipAddress:
 *           type: string
 *           description: IP address of the user
 *           example: "192.168.1.1"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the log was created
 *           example: "2023-12-21T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the log was last updated
 *           example: "2023-12-21T10:35:00.000Z"
 *     
 *     ProxyLogsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         logs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProxyLog'
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *           example: "URL is required"
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token for authentication
 */

/**
 * @swagger
 * /api/buywise/redirect/create:
 *   post:
 *     summary: Create a proxy URL with parameters
 *     description: Creates a proxy URL that will redirect users to the original URL with specified parameters. The proxy URL contains encoded data and will log user clicks when accessed.
 *     tags: [Proxy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProxyCreateRequest'
 *           example:
 *             url: "https://amazon.com/dp/B08N5WRWNW"
 *             params:
 *               ref: "buywise"
 *               tag: "buywise-20"
 *               linkCode: "ogi"
 *     responses:
 *       200:
 *         description: Proxy URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProxyCreateResponse'
 *             example:
 *               success: true
 *               proxyUrl: "http://localhost:3000/api/buywise/redirect/1703123456789-abc123?data=eyJvcmlnaW5hbFVybCI6Imh0dHBzOi8vYW1hem9uLmNvbS9kcC9CMDhONVdSV05XIiwicGFyYW1zIjp7InJlZiI6ImJ1eXdpc2UiLCJ0YWciOiJidXl3aXNlLTIwIiwibGlua0NvZGUiOiJvZ2kifSwicmVkaXJlY3RVcmwiOiJodHRwczovL2FtYXpvbi5jb20vZHAvQjA4TjVXUlZOVz9yZWY9YnV5d2lzZSZ0YWc9YnV5d2lzZS0yMCZsaW5rQ29kZT1vZ2kifQ=="
 *               originalUrl: "https://amazon.com/dp/B08N5WRWNW"
 *               params:
 *                 ref: "buywise"
 *                 tag: "buywise-20"
 *                 linkCode: "ogi"
 *       400:
 *         description: Bad request - missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "URL is required"
 *       401:
 *         description: Unauthorized - invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Authentication required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    const { url, params } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    if (!params || typeof params !== 'object') {
      return res.status(400).json({ error: 'Params must be a valid object' });
    }
    
    const proxyUrl = await ProductService.createProxyUrl(url, params);
    
    res.json({ 
      success: true, 
      proxyUrl,
      originalUrl: url,
      params 
    });
  } catch (error) {
    console.error('Error creating proxy URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/buywise/redirect/logs:
 *   get:
 *     summary: Get all proxy logs
 *     description: Retrieves all proxy logs for admin purposes. Returns the 100 most recent logs sorted by creation date.
 *     tags: [Proxy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Proxy logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProxyLogsResponse'
 *             example:
 *               success: true
 *               logs:
 *                 - originalUrl: "https://amazon.com/dp/B08N5WRWNW"
 *                   proxyUrl: "/api/buywise/redirect/1703123456789-abc123"
 *                   params:
 *                     ref: "buywise"
 *                     tag: "buywise-20"
 *                     linkCode: "ogi"
 *                   redirectUrl: "https://amazon.com/dp/B08N5WRWNW?ref=buywise&tag=buywise-20&linkCode=ogi"
 *                   userId: "507f1f77bcf86cd799439011"
 *                   userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *                   ipAddress: "192.168.1.1"
 *                   createdAt: "2023-12-21T10:30:00.000Z"
 *                   updatedAt: "2023-12-21T10:30:00.000Z"
 *                 - originalUrl: "https://bestbuy.com/site/laptop"
 *                   proxyUrl: "/api/buywise/redirect/1703123456788-def456"
 *                   params:
 *                     affiliate_id: "buywise123"
 *                     campaign: "holiday_sale"
 *                   redirectUrl: "https://bestbuy.com/site/laptop?affiliate_id=buywise123&campaign=holiday_sale"
 *                   userId: null
 *                   userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
 *                   ipAddress: "192.168.1.2"
 *                   createdAt: "2023-12-21T10:25:00.000Z"
 *                   updatedAt: "2023-12-21T10:25:00.000Z"
 *       401:
 *         description: Unauthorized - invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Authentication required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 */
router.get('/logs', authenticate, async (req, res) => {
  try {
    console.log('/api/buywise/redirect/logs : called');
    
    // Import ProxyLog model
    const ProxyLog = (await import('../models/ProxyLog')).default;
    
    const logs = await ProxyLog.find().sort({ createdAt: -1 }).limit(100);
    
    res.json({
      success: true,
      logs: logs.map(log => ({
        originalUrl: log.originalUrl,
        proxyUrl: log.proxyUrl,
        params: log.params,
        redirectUrl: log.redirectUrl,
        userId: log.userId,
        userAgent: log.userAgent,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error getting proxy logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/buywise/redirect/{proxyId}:
 *   get:
 *     summary: Redirect to original URL with parameters
 *     description: Redirects the user to the original URL with parameters. This endpoint logs the user click and then performs the redirect. The proxyId should include the data parameter with encoded information.
 *     tags: [Proxy]
 *     parameters:
 *       - in: path
 *         name: proxyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The proxy ID with encoded data parameter
 *         example: "1703123456789-abc123?data=eyJvcmlnaW5hbFVybCI6Imh0dHBzOi8vYW1hem9uLmNvbS9kcC9CMDhONVdSV05XIiwicGFyYW1zIjp7InJlZiI6ImJ1eXdpc2UiLCJ0YWciOiJidXl3aXNlLTIwIiwibGlua0NvZGUiOiJvZ2kifSwicmVkaXJlY3RVcmwiOiJodHRwczovL2FtYXpvbi5jb20vZHAvQjA4TjVXUlZOVz9yZWY9YnV5d2lzZSZ0YWc9YnV5d2lzZS0yMCZsaW5rQ29kZT1vZ2kifQ=="
 *     responses:
 *       302:
 *         description: Redirect to the original URL
 *         headers:
 *           Location:
 *             description: The URL to redirect to
 *             schema:
 *               type: string
 *             example: "https://amazon.com/dp/B08N5WRWNW?ref=buywise&tag=buywise-20&linkCode=ogi"
 *       404:
 *         description: Proxy URL not found or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Proxy URL not found or invalid"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 */
router.get('/:proxyId', async (req, res) => {
  try {
    const { proxyId } = req.params;
    const proxyUrl = `/api/buywise/redirect/${proxyId}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
    
    // Get user information from request
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    // Get user ID if authenticated
    const userId = (req as any).user?.id;
    
    const redirectUrl = await ProductService.getRedirectUrl(proxyUrl, userId, userAgent, ipAddress);
    
    if (!redirectUrl) {
      return res.status(404).json({ error: 'Proxy URL not found or invalid' });
    }
    
    // Redirect to the original URL with parameters
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error handling proxy redirect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 