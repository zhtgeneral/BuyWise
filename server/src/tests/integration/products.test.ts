import { describe, beforeAll, afterEach, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import sinon from 'sinon';
import productsRouter from '../../routes/products';
import { ProductService } from '../../services/ProductService';

describe('Products API', () => {
  let app: express.Express;
  
  beforeAll(() => {
    app = express();
    app.use('/api/products', productsRouter);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('GET /api/products/search', () => {
    it('should return 200 and products for a valid search query', async () => {
      const fakeProducts = [
        {
          category: 'Popular products',
          thumbnail: 'https://example.com/image.jpg',
          source_logo: 'https://example.com/logo.png',
          source: 'Best Buy',
          title: 'HP 14" Intel Celeron Laptop',
          rating: 4.2,
          reviews: 148,
          price: '$199.99',
          extracted_price: 199.99,
          location: 'Nearby, 13 mi',
          product_id: '2197135960910078338',
          seller_details: [
            {
              position: 1,
              name: 'Best Buy',
              top_quality_store: true,
              payment_methods: 'PayPal, Zip accepted',
              rating: 4.6,
              reviews: 532,
              reviews_original: '(532)',
              link: 'https://google.com/redirect',
              direct_link: 'https://bestbuy.com/product',
              details_and_offers: [{ text: '5.3 mi · In stock at GainesvilleToday: 10:00 AM - 8:00 PM' }],
              base_price: '$199.99',
              additional_price: { shipping: 'See website' },
              total_price: '$199.99',
            }
          ],
        },
      ];

      sinon.stub(ProductService, 'searchProducts').resolves(fakeProducts);

      const res = await request(app)
        .get('/api/products/search')
        .query({ q: 'Laptop under $400', device: 'desktop', location: 'Canada' });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.products).to.deep.equal(fakeProducts);
    });

    it('should return 400 if the search query is missing', async () => {
      const res = await request(app).get('/api/products/search');

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.error).to.equal('Search query is required');
    });

    it('should return 500 if the ProductService throws an error', async () => {
      sinon.stub(ProductService, 'searchProducts').throws(new Error('SerpAPI error'));

      const res = await request(app)
        .get('/api/products/search')
        .query({ q: 'Laptop' });

      expect(res.status).to.equal(500);
      expect(res.body.success).to.be.false;
      expect(res.body.error).to.equal('SerpAPI error');
    });
  });
});
