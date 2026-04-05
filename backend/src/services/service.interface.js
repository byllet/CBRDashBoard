class IDataService {
  async getMetrics(filters) {
    throw new Error('Method not implemented');
  }

  async saveMetricData(data) {
    throw new Error('Method not implemented');
  }

  async checkDataAvailability(filters) {
    throw new Error('Method not implemented');
  }
}

export default IDataService;