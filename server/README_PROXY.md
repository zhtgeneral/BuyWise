# Proxy URL Service

This service provides functionality to create proxy URLs that log requests and redirect users to the original URL with parameters.

## Features

- Create proxy URLs with parameters (no database storage during creation)
- Log user clicks when they access the proxy URL
- Track user information (IP, User-Agent, User ID) at click time
- Redirect users to the original URL with query parameters
- Retrieve proxy logs for analytics and debugging

## API Endpoints

### 1. Create Proxy URL

**POST** `/api/buywise/redirect/create`

Creates a new proxy URL with the specified parameters.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://example.com/product",
  "params": {
    "id": "123",
    "color": "blue",
    "size": "large"
  }
}
```

**Response:**
```json
{
  "success": true,
  "proxyUrl": "http://localhost:3000/api/buywise/redirect/1703123456789-abc123?data=eyJvcmlnaW5hbFVybCI6Imh0dHBzOi8vZXhhbXBsZS5jb20vcHJvZHVjdCIsInBhcmFtcyI6eyJpZCI6IjEyMyIsImNvbG9yIjoiYmx1ZSIsInNpemUiOiJsYXJnZSJ9LCJyZWRpcmVjdFVybCI6Imh0dHBzOi8vZXhhbXBsZS5jb20vcHJvZHVjdD9pZD0xMjMmY29sb3I9Ymx1ZSZzaXplPWxhcmdlIn0=",
  "originalUrl": "https://example.com/product",
  "params": {
    "id": "123",
    "color": "blue",
    "size": "large"
  }
}
```

### 2. Redirect via Proxy

**GET** `/api/buywise/redirect/:proxyId`

Redirects the user to the original URL with parameters. This endpoint logs the request and redirects the user.

**Example:**
```
GET http://localhost:3000/api/buywise/redirect/1703123456789-abc123?data=eyJvcmlnaW5hbFVybCI6Imh0dHBzOi8vZXhhbXBsZS5jb20vcHJvZHVjdCIsInBhcmFtcyI6eyJpZCI6IjEyMyIsImNvbG9yIjoiYmx1ZSIsInNpemUiOiJsYXJnZSJ9LCJyZWRpcmVjdFVybCI6Imh0dHBzOi8vZXhhbXBsZS5jb20vcHJvZHVjdD9pZD0xMjMmY29sb3I9Ymx1ZSZzaXplPWxhcmdlIn0=
```

This will redirect to: `https://example.com/product?id=123&color=blue&size=large`

### 3. Get All Proxy Logs

**GET** `/api/buywise/redirect/logs`

Retrieves all proxy logs (for admin purposes).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "logs": [
    {
          "originalUrl": "https://example.com/product",
    "proxyUrl": "http://localhost:3000/api/buywise/redirect/1703123456789-abc123",
      "params": {
        "id": "123",
        "color": "blue",
        "size": "large"
      },
      "redirectUrl": "https://example.com/product?id=123&color=blue&size=large",
      "userId": "507f1f77bcf86cd799439011",
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1",
      "createdAt": "2023-12-21T10:30:00.000Z",
      "updatedAt": "2023-12-21T10:35:00.000Z"
    }
  ]
}
```

## Database Schema

The proxy requests are logged in the `ProxyLog` collection with the following schema:

```typescript
interface IProxyLog {
  originalUrl: string;        // The original URL
  proxyUrl: string;          // The generated proxy URL
  params: Record<string, any>; // The parameters passed
  userId?: ObjectId;         // User ID (if authenticated)
  userAgent?: string;        // User agent string
  ipAddress?: string;        // IP address of the request
  redirectUrl: string;       // Final URL with parameters
  createdAt: Date;           // Creation timestamp
  updatedAt: Date;           // Last update timestamp
}
```

## How It Works

1. **Create Proxy URL**: Generates a unique URL with encoded data (no database storage)
2. **User Clicks**: When user accesses the proxy URL, the system:
   - Decodes the original URL and parameters
   - Logs the click with user information (IP, User-Agent, User ID)
   - Redirects to the original URL with parameters
3. **Analytics**: All user clicks are logged for tracking and analytics

## Usage Examples

### Frontend Integration

```javascript
// Create a proxy URL
const createProxyUrl = async (url, params) => {
  const response = await fetch('/api/proxy/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ url, params })
  });
  
  const data = await response.json();
  return data.proxyUrl;
};

// Use the proxy URL
const proxyUrl = await createProxyUrl('https://amazon.com/product', {
  asin: 'B08N5WRWNW',
  ref: 'buywise'
});

// Redirect user to proxy URL
window.location.href = proxyUrl;
```

### Node.js/Express Integration

```javascript
const { ProductService } = require('./services/ProductService');

// Create proxy URL
const proxyUrl = await ProductService.createProxyUrl(
  'https://example.com/api',
  { key: 'value', user: '123' }
);

console.log('Proxy URL:', proxyUrl);
```

## Environment Variables

The proxy service uses the following environment variables to determine the base URL:

- `API_BASE_URL`: Primary environment variable for the API base URL
- `BASE_URL`: Fallback environment variable for the base URL
- Default: `http://localhost:3000` (if neither environment variable is set)

## Security Considerations

1. **Authentication**: The create endpoint requires authentication
2. **Rate Limiting**: Consider implementing rate limiting for proxy creation
3. **URL Validation**: The service accepts any URL - consider adding validation
4. **Parameter Sanitization**: Parameters are stored as-is - consider sanitization if needed

## Error Handling

The service returns appropriate HTTP status codes:

- `400`: Bad Request (missing URL or invalid parameters)
- `401`: Unauthorized (missing or invalid JWT token)
- `404`: Not Found (proxy URL not found)
- `500`: Internal Server Error (database or service errors) 