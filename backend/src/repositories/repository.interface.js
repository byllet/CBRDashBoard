class IDataRepository {
  async findData(filters) {
    throw new Error('Method not implemented');
  }

  async checkDataExists(filters) {
    throw new Error('Method not implemented');
  }
}

export default IDataRepository;