from api_client import ApiClient
from data_handler import DataHandler
from repository import Repository
import os
import config
import asyncpg
import uvicorn
import asyncio

from fastapi import FastAPI
from contextlib import asynccontextmanager
from dotenv import load_dotenv

async def etl():
    configs = [{
                "publicationId" : 18,
                "datasetId" :  37,
                "measureId" : 2
            }]
    extractor = ApiClient()
    dirty_data = extractor.fetch(configs[0])
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
