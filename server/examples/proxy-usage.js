// Example usage of the Proxy Service
// This file demonstrates how to use the proxy functionality

const API_BASE_URL = 'http://localhost:3000';

// Example 1: Create a proxy URL for an Amazon product
async function createAmazonProductProxy() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buywise/redirect/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
      },
      body: JSON.stringify({
        url: 'https://www.amazon.com/dp/B08N5WRWNW',
        params: {
          ref: 'buywise',
          tag: 'buywise-20',
          linkCode: 'ogi',
          language: 'en_US'
        }
      })
    });

    const data = await response.json();
    console.log('Proxy URL created:', data.proxyUrl);
    console.log('Original URL:', data.originalUrl);
    console.log('Parameters:', data.params);
    
    return data.proxyUrl;
  } catch (error) {
    console.error('Error creating proxy URL:', error);
  }
}

// Example 2: Create a proxy URL for a search query
async function createSearchProxy() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buywise/redirect/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
      },
      body: JSON.stringify({
        url: 'https://www.google.com/search',
        params: {
          q: 'laptop deals',
          source: 'buywise',
          utm_campaign: 'product_search'
        }
      })
    });

    const data = await response.json();
    console.log('Search proxy URL:', data.proxyUrl);
    
    return data.proxyUrl;
  } catch (error) {
    console.error('Error creating search proxy:', error);
  }
}

// Example 3: Create a proxy URL for tracking affiliate links
async function createAffiliateProxy() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buywise/redirect/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
      },
      body: JSON.stringify({
        url: 'https://www.bestbuy.com/site/laptop',
        params: {
          affiliate_id: 'buywise123',
          campaign: 'holiday_sale',
          medium: 'web',
          source: 'buywise_app'
        }
      })
    });

    const data = await response.json();
    console.log('Affiliate proxy URL:', data.proxyUrl);
    
    return data.proxyUrl;
  } catch (error) {
    console.error('Error creating affiliate proxy:', error);
  }
}

// Example 4: Get all proxy logs
async function getProxyLogs() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buywise/redirect/logs`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
      }
    });

    const data = await response.json();
    console.log('Proxy logs:', data.logs);
    
    return data.logs;
  } catch (error) {
    console.error('Error getting proxy logs:', error);
  }
}

// Example 5: Using the proxy URL in a web application
function redirectToProxy(proxyUrl) {
  // This would be used in a frontend application
  // proxyUrl is now a full URL, so we can use it directly
  window.location.href = proxyUrl;
}

// Example 6: Node.js server-side usage
async function serverSideProxyCreation() {
  const { ProductService } = require('./src/services/ProductService');
  
  try {
    const proxyUrl = await ProductService.createProxyUrl(
      'https://www.newegg.com/product',
      {
        item: 'N82E16834156123',
        ref: 'buywise',
        utm_source: 'buywise_api'
      }
    );
    
    console.log('Server-side proxy URL:', proxyUrl);
    return proxyUrl;
  } catch (error) {
    console.error('Server-side proxy creation error:', error);
  }
}

// Example 7: Batch proxy creation for multiple products
async function createBatchProxies(products) {
  const proxyUrls = [];
  
  for (const product of products) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/buywise/redirect/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
        },
        body: JSON.stringify({
          url: product.url,
          params: {
            ...product.params,
            batch_id: 'batch_001',
            created_at: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      proxyUrls.push({
        productId: product.id,
        proxyUrl: data.proxyUrl,
        originalUrl: data.originalUrl
      });
    } catch (error) {
      console.error(`Error creating proxy for product ${product.id}:`, error);
    }
  }
  
  console.log('Batch proxy URLs created:', proxyUrls);
  return proxyUrls;
}

// Example usage
if (typeof window !== 'undefined') {
  // Browser environment
  window.createAmazonProductProxy = createAmazonProductProxy;
  window.createSearchProxy = createSearchProxy;
  window.createAffiliateProxy = createAffiliateProxy;
  window.getProxyLogs = getProxyLogs;
  window.redirectToProxy = redirectToProxy;
} else {
  // Node.js environment
  module.exports = {
    createAmazonProductProxy,
    createSearchProxy,
    createAffiliateProxy,
    getProxyLogs,
    serverSideProxyCreation,
    createBatchProxies
  };
}

console.log('Proxy service examples loaded. Use the functions above to test the proxy functionality.'); 