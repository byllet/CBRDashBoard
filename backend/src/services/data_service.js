import IDataService from './service.interface.js';


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
      const {metric, operation, region, from, to} = req;
      const availability = await this.checkDataAvailability(req);

      if (!availability) {
        this.logger.info(`No data found for metric: ${metric}, triggering
        ETL`);

        const etlParams = {metric, region, from, to};

        // await this.etl_client.getMetrics(etlParams);
      }

      const rawData = await this.repository.findData(metric, from, to, region);

      console.log('Raw data retrieved:', rawData);

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

  async checkDataAvailability(req) {
    return await this.repository.checkDataExists(
        req.metric, req.from, req.to, req.region);
  }
}

export default DataService;