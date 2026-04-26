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
        'money_aggregates_total', 'money_aggregates_m1',
        'money_aggregates_financial_orgs', 'money_aggregates_nonfinancial_orgs',
        'money_aggregates_households', 'credits_stats_short_term',
        'credits_stats_1_to_3_years', 'credits_stats_over_3_years',
        'deposit_rates_on_demand', 'deposit_rates_short_term',
        'deposit_rates_1_to_3_years', 'deposit_rates_over_3_years',
        'loan_rates_total', 'loan_rates_rubles', 'loan_ratest_other_currencies',
        'currency_rates_dollar', 'currency_rates_euro', 'currency_rates_yuan'
      ];

      if (!allowedMetrics.includes(metric)) {
        return res.status(400).json({
          success: false,
          message:
              `Invalid metric. Allowed values: ${allowedMetrics.join(', ')}`
        });
      }

      const {success, metrics} = await this.dataService.getMetrics({
        full_metric: metric,
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
