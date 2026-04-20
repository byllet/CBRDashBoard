from api_client import ApiClient
from data_handler import DataHandler
from repository import Repository
from data_models import RequestedData
from datetime import datetime
import asyncpg
import asyncio


async def etl():
    currency_request = RequestedData
    currency_request.name = 'Курс валют'
    currency_request.time_from = datetime(1984, 1 , 1)
    currency_request.time_to = datetime(2100, 1, 1)
    extractor = ApiClient()
    dirty_data = extractor.fetch(currency_request)
    handler = DataHandler()
    clean_data = handler.extract_data(dirty_data)
    pool = await asyncpg.create_pool(
        host="localhost",     
        port=5432,           
        user="cbrf",
        password="123",
        database="economic_data",
        min_size=2,
        max_size=10
    )
    repository = Repository(pool)
    await repository.load_data(clean_data)
    await pool.close()

async def main():
    await etl()

asyncio.run(main()) 
