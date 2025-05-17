import { logger } from './config';
import { WebhookService } from './services/webhookservice';

async function runDemo() {
  try {
    const webhookService = new WebhookService();
    
    logger.info('==== Registering a merchant ====');
    const merchantId = 'merchant123';
    await webhookService.registerMerchant({
      id: merchantId,
      name: 'Test Merchant Inc.'
    });
    
    logger.info('==== Registering a webhook endpoint ====');
    const endpointId = await webhookService.registerEndpoint(merchantId, {
      url: 'https://webhook.site/be20bfbd-8f78-4692-aae7-48bb6ef9a00c', // Use webhook.site for testing
      description: 'Order status updates'
    });
    
    logger.info('==== Sending a test event ====');
    const messageId = await webhookService.sendEvent(merchantId, {
      eventType: 'order.status_update',
      payload: {
        order_id: 'order_12345',
        status: 'shipped',
        updated_at: new Date().toISOString()
      }
    });
    
    logger.info('==== Checking message status ====');
    setTimeout(async () => {
      const messageStatus = await webhookService.getMessageStatus(merchantId, messageId);
      logger.info('Message status:', messageStatus);
    }, 5000); 
    
  } catch (error) {
    logger.error(`Demo failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

runDemo();