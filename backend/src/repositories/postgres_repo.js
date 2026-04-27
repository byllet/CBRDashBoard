import {logger, pool} from '../config/database.js';

import IDataRepository from './repository.interface.js';

class PostgresRepository extends IDataRepository {
  constructor(pool, logger) {
    super();
    this.pool = pool;
    this.logger = logger;
  }

  async findData(metric, from, to, region) {
    try {
      let query = `
          SELECT
              rd.region_name,
              ed.record_date,
              ed.parameter_value
          FROM economic_data ed
          JOIN economic_parameters ep ON ed.parameter_id = ep.parameter_id
          JOIN regions rd ON ed.region_id = rd.region_id
          WHERE ep.parameter_name = $1
      `;

      const params = [metric];
      let paramCounter = 2;

      if (region) {
        query += ` AND rd.region_name = $${paramCounter}`;
        params.push(region);
        paramCounter++;
      }

      if (from) {
        query += ` AND ed.record_date >= $${paramCounter}`;
        params.push(from);
        paramCounter++;
      }

      if (to) {
        query += ` AND ed.record_date <= $${paramCounter}`;
        params.push(to);
        paramCounter++;
      }

      query += ` ORDER BY ed.record_date`;

      this.logger.info(
          `Executing query with params: ${JSON.stringify(params)}`);

      const result = await this.pool.query(query, params);
      return result.rows;

    } catch (error) {
      this.logger.error('Error in findData:', error);
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }

  async checkDataExists(metric, from, to, region) {
    try {
      const conditions = [];
      const params = [];
      let paramCounter = 1;

      conditions.push(`ep.parameter_name = $${paramCounter}`);
      params.push(metric);
      paramCounter++;

      if (region) {
        conditions.push(`rd.region_name = $${paramCounter}`);
        params.push(region);
        paramCounter++;
      }

      if (from) {
        conditions.push(`ed.record_date >= $${paramCounter}`);
        params.push(from);
        paramCounter++;
      }

      if (to) {
        conditions.push(`ed.record_date <= $${paramCounter}`);
        params.push(to);
        paramCounter++;
      }

      const query = `
          SELECT EXISTS(
              SELECT 1
              FROM economic_data ed
              JOIN economic_parameters ep ON ed.parameter_id = ep.parameter_id
              JOIN regions rd ON ed.region_id = rd.region_id
              WHERE ${conditions.join(' AND ')}
              LIMIT 1
          ) as exists
      `;

      const result = await this.pool.query(query, params);
      const exists = result.rows[0]?.exists === true;

      this.logger.debug(`Data exists check for ${metric}: ${exists}`);
      return exists;

    } catch (error) {
      this.logger.error('Error in checkDataExists:', error);
      throw new Error(`Failed to check data existence: ${error.message}`);
    }
  }
}

export default PostgresRepository;