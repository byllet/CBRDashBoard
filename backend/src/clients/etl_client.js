import IETLClient from './client.interface.js';

class ETLClient extends IETLClient {
  constructor(logger) {
    super();
    this.logger = logger;
  }
}

export default ETLClient;