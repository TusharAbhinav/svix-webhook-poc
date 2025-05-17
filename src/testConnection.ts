import axios from 'axios';
import { config, logger } from './config';

async function testSvixConnection() {
  try {
    logger.info('Testing connection to Svix API...');
    
    const apiKey = config.svix.apiKey;
    const response = await axios.get(`${config.svix.apiUrl}/api/v1/health`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    logger.info('Response status:', response.status);
    logger.info('Response data:', response.data);
    
    logger.info('✅ Connection successful!');
    
    const appsResponse = await axios.get(`${config.svix.apiUrl}/api/v1/app/`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    logger.info(`Found ${appsResponse.data.data.length} applications`);
    logger.info('First application:', appsResponse.data.data[0]);
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(`Test failed: ${error.message}`);
      if (error.response) {
        logger.error('Response status:', error.response.status);
        logger.error('Response data:', error.response.data);
      } else if (error.request) {
        logger.error('No response received. Request made but no response.');
      }
    } else {
      logger.error(`Test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

testSvixConnection();