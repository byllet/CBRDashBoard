import os
import config
import asyncpg
import uvicorn
import asyncio

from fastapi import FastAPI
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from orchestrator import Orchestrator
from api_client import ApiClient
from data_handler import DataHandler
from repository import Repository
from controller import create_app

load_dotenv()

async def create_pool_with_retry():
    for i in range(10):
        try:
            return await asyncpg.create_pool(
                host=os.getenv("DB_HOST"),
                port=int(os.getenv("DB_PORT")),
                database=os.getenv("POSTGRES_DB"),
                user=os.getenv("POSTGRES_USER"),
                password=os.getenv("POSTGRES_PASSWORD"),
                min_size=2,
                max_size=10
            )
        except Exception as e:
            print(f"DB not ready, retry {i+1}/10: {e}")
            await asyncio.sleep(2)
    raise RuntimeError("Could not connect to DB")

@asynccontextmanager
async def lifespan(app : FastAPI):
    pool = await create_pool_with_retry()
    
    api_client = ApiClient(config.cbr_api_url)
    handler = DataHandler()
    repository = Repository(pool)
    orchestrator = Orchestrator(api_client, handler, repository)
    
    app.state.orchestrator = orchestrator
    
    yield
    
    await pool.close()

def main():

    app = create_app(None)
    app.router.lifespan_context = lifespan

    uvicorn.run(
        app,
        host="0.0.0.0",  
        port=int(os.getenv("ETL_PORT")),
        reload=False
    )

if __name__ == "__main__":
    main()