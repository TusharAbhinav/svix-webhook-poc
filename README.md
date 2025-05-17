# Svix Webhook Integration POC

This is a Proof of Concept (POC) project that demonstrates how to implement webhook functionality using [Svix](https://www.svix.com/) to enable real-time event notifications between systems.

## Overview

This POC demonstrates a typical webhook integration flow:

1. Register applications (merchants) in the system
2. Allow applications to register webhook endpoints
3. Send event notifications to registered endpoints
4. Verify webhook signatures for security

## Features

- TypeScript implementation for type safety
- Svix integration for reliable webhook delivery
- Proper error handling and logging
- Simple testing interface with both sender and receiver components
- Connection testing utilities

## Prerequisites

- Node.js 14+ and npm
- A Svix account (free tier available)
- API key from the Svix dashboard

## Installation

1. Clone this repository:
```bash
git clone https://github.com/TusharAbhinav/svix-webhook-poc.git
cd svix-webhook-poc
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Svix API key:
```
SVIX_API_KEY=your_svix_api_key
SVIX_API_URL=https://api.eu.svix.com  # Use the appropriate region
```

## Usage

### Testing Connection to Svix API

Before running the full POC, you can test your connection to the Svix API:
```bash
npm run test-connection
```

This will:
1. Attempt to connect to the Svix API using your credentials
2. Verify that your API key is valid
3. Display connection status and any error messages

### Running the POC

Start the main application:
```bash
npm run start
```

This will:
1. Register a test merchant in Svix
2. Create a webhook endpoint for the merchant
3. Send a test event to demonstrate the webhook flow

## Project Structure

```
svix-webhook-poc/
├── .env                    # Environment variables
├── package.json            # Project configuration
├── tsconfig.json           # TypeScript configuration
└── src/
    ├── config/             # Configuration management
    │   └── index.ts        # Config and logger setup
    ├── services/           # Core services
    │   └── webhookService.ts # Svix webhook implementation
    ├── index.ts            # Main entry point/demo
    └── testConnection.ts   # Utility to test Svix API connection
```

## Key Components

### WebhookService

The `WebhookService` class handles all webhook-related operations:

- `registerMerchant()`: Creates a new application in Svix
- `registerEndpoint()`: Registers a new webhook endpoint for an application
- `sendEvent()`: Sends a webhook event to all registered endpoints
- `getMessageStatus()`: Checks the delivery status of a message

### Connection Tester

The `testConnection.ts` utility helps diagnose connectivity issues:

- Tests connectivity to the Svix API
- Verifies API key validity
- Provides detailed error logging for troubleshooting

## Integration Examples

### Registering a Merchant

```typescript
const webhookService = new WebhookService();
const merchantId = await webhookService.registerMerchant({
  id: 'merchant123',
  name: 'Test Merchant Inc.'
});
```

### Registering an Endpoint

```typescript
const endpointId = await webhookService.registerEndpoint(merchantId, {
  url: 'https://your-webhook-url.com/webhook',
  description: 'Order status updates'
});
```

### Sending an Event

```typescript
const messageId = await webhookService.sendEvent(merchantId, {
  eventType: 'order.status_update',
  payload: {
    order_id: 'order_12345',
    status: 'shipped',
    updated_at: new Date().toISOString()
  }
});
```

### Receiving Webhooks

```typescript
import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';

const app = express();
app.use(bodyParser.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

app.post('/webhook', (req, res) => {
  // Verify the webhook signature
  const isValid = verifySignature(req.rawBody.toString(), 
                                 req.headers['svix-timestamp'], 
                                 req.headers['svix-signature']);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process the webhook
  const { eventType, payload } = req.body;
  console.log(`Received ${eventType} event:`, payload);
  
  // Return success
  res.status(200).json({ success: true });
});

app.listen(3001, () => {
  console.log('Webhook receiver running on port 3001');
});
```

## Webhook Security

Webhooks are secured using signature verification:

1. Svix signs each webhook with your API key
2. The receiver can verify this signature
3. This ensures webhooks are genuine and not tampered with

Example verification code (for webhook receivers):

```typescript
import crypto from 'crypto';

function verifySignature(payload, timestamp, signature) {
  const expectedSignature = crypto.createHmac('sha256', webhookSecret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');
  
  return signature === `v1,${expectedSignature}`;
}
```

## Best Practices

This POC demonstrates these webhook best practices:

1. **Event Types**: Using clear, consistent event type naming
2. **Payload Structure**: Standardized payload format
3. **Signature Verification**: Securing webhooks with cryptographic signatures
4. **Error Handling**: Proper handling of delivery failures
5. **Event Tracking**: Monitoring webhook delivery status

## Troubleshooting

Common issues and solutions:

1. **Connection Issues**: 
   - Verify your API key is correct
   - Check network connectivity
   - Ensure you're using the correct regional endpoint

2. **Webhook Delivery Failures**:
   - Verify the endpoint URL is publicly accessible
   - Check that the receiver returns a 200 status code
   - Ensure proper signature verification

3. **Module Errors**:
   - Check package compatibility (especially with ESM/CommonJS)
   - Make sure all dependencies are installed

## Production Considerations

For a production implementation, consider:

1. **Retries**: Implementing automatic retries with exponential backoff
2. **Circuit Breaking**: Adding circuit breakers to prevent overwhelming receivers
3. **Monitoring**: Setting up alerts for failed webhook deliveries
4. **Rate Limiting**: Implementing rate limits to prevent flooding endpoints
5. **Event Persistence**: Storing events for audit and replay purposes

## Resources

- [Svix Documentation](https://docs.svix.com/)
- [Webhook Best Practices](https://docs.svix.com/concepts/best-practices)
- [Svix API Reference](https://api.svix.com/docs)

## License

MIT
