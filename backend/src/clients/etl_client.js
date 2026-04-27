import IETLClient from './client.interface.js';

class ETLClient extends IETLClient {
  constructor(logger) {
    super();
    this.logger = logger;
    this.baseURL = process.env.ETL_SERVICE_URL || 'http://localhost:15333';
  }

  async getMetrics(params) {
    const {metric, region, from, to} = params;

    try {
      this.logger.info(`ETL request started for metric: ${metric}, region: ${
          region}, from: ${from}, to: ${to}`);

      const requestBody = {
        name: metric,
        time_from: from || null,
        time_to: to || null,
        location: region || null
      };

      this.logger.info(`ETL request body: ${JSON.stringify(requestBody)}`);

      const response = await fetch(`${this.baseURL}/api/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
            `ETL service responded with status: ${response.status}`);
      }

      const result = await response.json();

      this.logger.info(`ETL response received: ${JSON.stringify(result)}`);

      switch (result.status) {
        case 'LOADED':
          this.logger.info(`Data successfully loaded for metric: ${metric}`);
          return {
            success: true,
            status: 'LOADED',
            message: 'Data loaded successfully'
          };

        case 'ERROR':
          this.logger.error(`ETL error for metric: ${metric}`);
          return {
            success: false,
            status: 'ERROR',
            message: 'ETL processing error'
          };

        case 'EXIST':
          this.logger.info(`Data already exists for metric: ${metric}`);
          return {
            success: true,
            status: 'EXIST',
            message: 'Data already exists'
          };

        default:
          this.logger.warn(`Unknown ETL status: ${result.status}`);
          return {
            success: false,
            status: 'UNKNOWN',
            message: `Unknown status: ${result.status}`
          };
      }

    } catch (error) {
      this.logger.error(`ETL client error for metric ${metric}:`, error);
      throw new Error(`ETL request failed: ${error.message}`);
    }
  }
}

export default ETLClient;