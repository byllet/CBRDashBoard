import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';

dotenv.config();

import {logger, pool} from './config/database.js';
import PostgresRepository from './repositories/postgres_repo.js';
import MetricsCalculator from './metrics/metics_calculator.js';
import DataService from './services/data_service.js';
import ETLClient from './clients/etl_client.js';
import DataController from './controllers/data_controller.js';

const app = express();
const PORT = process.env.PORT || 15654;

app.use(helmet());
app.use(cors());
app.use(express.json());

const repository = new PostgresRepository(pool, logger);
const calculator = new MetricsCalculator();
const etlClient = new ETLClient(logger);
const dataService = new DataService(repository, calculator, etlClient, logger);
const dataController = new DataController(dataService, logger);


app.get('/api/metrics', (req, res) => dataController.getMetrics(req, res));

app.get('/health', (req, res) => {
  res.status(200).json({status: 'OK', timestamp: new Date().toISOString()});
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({success: false, message: 'Internal server error'});
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server is listening on http://localhost:${PORT}`);
});