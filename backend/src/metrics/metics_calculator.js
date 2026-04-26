class IMetricsCalculator {}

class MetricsCalculator extends IMetricsCalculator {
  calculate(rawData, metric, operation) {
    // Filter out null or undefined values first
    const validData = this.filterValidData(rawData);

    if (validData.length === 0) {
      console.warn('No valid data points available for calculation');
      return null;
    }

    console.log(`Calculating metric: ${metric} with operation: ${operation}`);
    switch (operation) {
      case 'avg':
        return this.calculateAvg(validData);
      case 'max':
        return this.calculateMax(validData);
      case 'min':
        return this.calculateMin(validData);
      case 'std':
        return this.calculateStdDev(validData);
      default:
        return validData;
    }
  }

  filterValidData(rawData) {
    return rawData.filter(
        item => item.parameter_value !== null &&
            item.parameter_value !== undefined &&
            !isNaN(parseFloat(item.parameter_value)));
  }

  calculateAvg(rawData) {
    const sum = rawData.reduce(
        (acc, item) => acc + parseFloat(item.parameter_value), 0);
    return sum / rawData.length;
  }

  calculateMax(rawData) {
    const values = rawData.map(item => parseFloat(item.parameter_value));
    return values.length > 0 ? Math.max(...values) : null;
  }

  calculateMin(rawData) {
    const values = rawData.map(item => parseFloat(item.parameter_value));
    return values.length > 0 ? Math.min(...values) : null;
  }

  calculateStdDev(rawData) {
    const avg = this.calculateAvg(rawData);
    const variance = rawData.reduce((acc, item) => {
      const diff = parseFloat(item.parameter_value) - avg;
      return acc + diff * diff;
    }, 0) / rawData.length;
    return Math.sqrt(variance);
  }
}

export default MetricsCalculator