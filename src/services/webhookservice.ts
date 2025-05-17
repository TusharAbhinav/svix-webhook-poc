import { Svix } from 'svix';
import { config, logger } from '../config';

export interface Merchant {
  id: string;
  name: string;
}

export interface WebhookEndpoint {
  url: string;
  description?: string;
  version?: number;
}

export interface EventPayload {
  eventType: string;
  payload: Record<string, any>;
}

export class WebhookService {
  private svix: Svix;

  constructor() {
    this.svix = new Svix(config.svix.apiKey, { 
      serverUrl: config.svix.apiUrl 
    });
  }

  async registerMerchant(merchant: Merchant): Promise<string> {
    try {
      logger.info(`Registering merchant: ${merchant.id} - ${merchant.name}`);
      const apiKey = config.svix.apiKey;      
      const app = await this.svix.application.create({
        name: merchant.name,
        uid: merchant.id
      });
      
      logger.info(`Merchant registered successfully: ${app.id}`);
      return app.id;
    } catch (error) {
        console.log(error);
      logger.error(`Failed to register merchant: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async registerEndpoint(merchantId: string, endpoint: WebhookEndpoint): Promise<string> {
    try {
      logger.info(`Registering endpoint for merchant ${merchantId}: ${endpoint.url}`);
      
      const endpointResult = await this.svix.endpoint.create(merchantId, {
        url: endpoint.url,
        description: endpoint.description || 'Order status webhook',
        version: endpoint.version || 1,
        disabled: false
      });
      
      logger.info(`Endpoint registered successfully: ${endpointResult.id}`);
      return endpointResult.id;
    } catch (error) {
      logger.error(`Failed to register endpoint: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async sendEvent(merchantId: string, event: EventPayload): Promise<string> {
    try {
      logger.info(`Sending event ${event.eventType} to merchant ${merchantId}`);
      
      const messageResult = await this.svix.message.create(merchantId, {
        eventType: event.eventType,
        payload: event.payload
      });
      
      logger.info(`Event sent successfully: ${messageResult.id}`);
      return messageResult.id;
    } catch (error) {
      logger.error(`Failed to send event: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async getMessageStatus(merchantId: string, messageId: string): Promise<any> {
    try {
      logger.info(`Getting status for message ${messageId}`);
      
      const status = await this.svix.message.get(merchantId, messageId);
      
      return status;
    } catch (error) {
      logger.error(`Failed to get message status: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}