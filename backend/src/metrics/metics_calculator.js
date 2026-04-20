class IMetricsCalculator {}

class MetricsCalculator extends IMetricsCalculator {
  calculate(rawData, metric, operation) {
    switch (operation) {
      case 'avg':
        return this.calculateAvg(rawData);
      case 'max':
        return this.calculateMax(rawData);
      case 'min':
        return this.calculateMin(rawData);
      case 'std':
        return this.calculateStdDev(rawData);
      default:
        return rawData;
    }
  }

  calculateAvg(rawData) {
    const sum = rawData.reduce(
        (acc, item) => acc + parseFloat(item.parameter_value), 0);
    return sum / rawData.length;
  }

  calculateMax(rawData) {
    return Math.max(...rawData.map(item => parseFloat(item.parameter_value)));
  }

  calculateMin(rawData) {
    return Math.min(...rawData.map(item => parseFloat(item.parameter_value)));
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