from api_client import ApiClient
from data_handler import DataHandler
from repository import Repository
from data_models import RequestedData
from config import cbr_api_url
from orchestrator import Orchestrator
from datetime import datetime
import asyncpg
import asyncio
import os

async def etl():
    currency_request = RequestedData
    currency_request.name = 'currency_rates'
    currency_request.time_from = datetime(1984, 1 , 1)
    currency_request.time_to = datetime(2100, 1, 1)
    pool = await asyncpg.create_pool(
        host="localhost",
        port=5432,
        database="cbr_db",
        user="postgres",
        password="password",
        min_size=2,
        max_size=10
    )
    
    api_client = ApiClient(cbr_api_url)
    handler = DataHandler()
    repository = Repository(pool)
    orchestrator = Orchestrator(api_client, handler, repository)

    currency_rates = RequestedData('currency_rates', datetime(1984, 1 , 1), datetime(2100, 1 , 1))
    credits_stats = RequestedData('credits_stats', datetime(1984, 1 , 1), datetime(2100, 1 , 1))
    loan_rates = RequestedData('loan_rates', datetime(1984, 1 , 1), datetime(2100, 1 , 1))
    money_aggregates = RequestedData('money_aggregates', datetime(1984, 1 , 1), datetime(2100, 1 , 1))
    deposit_rates = RequestedData('deposit_rates', datetime(1984, 1 , 1), datetime(2100, 1 , 1))

    status = await orchestrator.process_data_pipeline(currency_rates)
    print(status)

    status = await orchestrator.process_data_pipeline(credits_stats)
    print(status)

    status = await orchestrator.process_data_pipeline(loan_rates)
    print(status)

    status = await orchestrator.process_data_pipeline(money_aggregates)
    print(status)

    status = await orchestrator.process_data_pipeline(deposit_rates)
    print(status)
    
    await pool.close()

async def main():
    await etl()

asyncio.run(main()) 
