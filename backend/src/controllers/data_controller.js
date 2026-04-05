class IDataController {}

class DataController extends IDataController {
  constructor(dataService, logger) {
    super();
    this.dataService = dataService;
    this.logger = logger;
  }

  async getMetrics(req, res) {
    try {
      const {metric, operation, region, from, to} = req.query;
      if (!metric) {
        return res.status(400).json(
            {success: false, message: 'metric is required'});
      }

      const allowedMetrics = [
        'currency_rates', 'credits_stats', 'money_aggregates', 'deposit_rates',
        'loan_rates', 'rub'
      ];

      if (!allowedMetrics.includes(metric)) {
        return res.status(400).json({
          success: false,
          message:
              `Invalid metric. Allowed values: ${allowedMetrics.join(', ')}`
        });
      }

      const {success, metrics} = await this.dataService.getMetrics({
        metric: metric,
        operation: operation || null,
        region: region || null,
        from: from || null,
        to: to || null
      });

      res.status(200).json({success: success, data: metrics});

    } catch (error) {
      this.logger.error('Error in getMetrics:', error);
      res.status(500).json(
          {success: false, message: 'Failed to retrieve metrics'});
    }
  }
}

export default DataController;
