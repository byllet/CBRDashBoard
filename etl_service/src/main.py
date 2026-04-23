import os
import config
import asyncpg
import uvicorn

from fastapi import FastAPI
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from orchestrator import Orchestrator
from api_client import ApiClient
from data_handler import DataHandler
from repository import Repository
from controller import create_app

load_dotenv()


@asynccontextmanager
async def lifespan(app : FastAPI):

    pool = await asyncpg.create_pool(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
        min_size=2,
        max_size=10
    )
    
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
        host="127.0.0.1",  
        port=int(os.getenv("ETL_PORT")),
        reload=False
    )

if __name__ == "__main__":
    main()