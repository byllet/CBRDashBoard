import IDataService from './service.interface.js';

function getUntilSecondUnderscore(str) {
  const parts = str.split('_');
  return parts.slice(0, 2).join('_');
}

class DataService extends IDataService {
  constructor(repository, calculator, etl_client, logger) {
    super();
    this.repository = repository;
    this.calculator = calculator;
    this.etl_client = etl_client;
    this.logger = logger;
  }

  async getMetrics(req) {
    try {
      const {full_metric, operation, region, from, to} = req;

      let metric = getUntilSecondUnderscore(full_metric)
      let availability = await this.checkDataAvailability(
          {metric: full_metric, from, to, region});

      if (!availability) {
        this.logger.info(`No data found for metric: ${metric}, triggering ETL`);

        const etlParams = {metric, region, from, to};
        const etlResult = await this.etl_client.getMetrics(etlParams);

        if (etlResult.success) {
          this.logger.info(`ETL completed with status: ${
              etlResult.status}, waiting for data to be available`);

          const maxRetries = 3;
          const retryDelay = 500;  // 1/2 секунды

          for (let i = 0; i < maxRetries; i++) {
            await this.sleep(retryDelay);
            availability = await this.checkDataAvailability(
                {metric: full_metric, from, to, region});

            if (availability) {
              this.logger.info(`Data became available after ${i + 1} retries`);
              break;
            }

            this.logger.info(
                `Waiting for data, attempt ${i + 1}/${maxRetries}`);
          }

          if (!availability) {
            this.logger.warn(
                `Data still not available after ${maxRetries} retries`);
            return {
              success: false,
              metrics: null,
              message: 'Data loading timeout'
            };
          }
        } else {
          this.logger.error(`ETL failed with status: ${etlResult.status}`);
          return {success: false, metrics: null, message: etlResult.message};
        }
      }

      const rawData =
          await this.repository.findData(full_metric, from, to, region);

      // console.log('Raw data retrieved:', rawData);

      if (!rawData || rawData.length === 0) {
        this.logger.warn(`No data found for filters: ${JSON.stringify(req)}`);
        return {success: false, metrics: null};
      }

      const calculatedMetrics =
          this.calculator.calculate(rawData, metric, operation);

      return {success: true, metrics: calculatedMetrics};

    } catch (error) {
      this.logger.error('Error in getMetrics:', error);
      throw new Error(`Failed to get metrics: ${error.message}`);
    }
  }


  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkDataAvailability(req) {
    return await this.repository.checkDataExists(
        req.metric, req.from, req.to, req.region);
  }
}

export default DataService;