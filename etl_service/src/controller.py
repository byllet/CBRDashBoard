from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import logging
from datetime import datetime

from orchestrator import Orchestrator

logger = logging.getLogger(__name__)

class LoadDataRequest(BaseModel):
    endpoint: str
    source: str
    force: bool = False  

class LoadDataResponse(BaseModel):
    task_id: Optional[str]
    status: str
    message: str
    timestamp: datetime

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime

def create_app(orchestrator: Orchestrator) -> FastAPI:
    app = FastAPI(title="ETL Service", version="1.0.0")
    
    @app.get("/health", response_model=HealthResponse)
    async def health_check():
        return HealthResponse(
            status="healthy",
            timestamp=datetime.now()
        )
    
    @app.post("/api/v1/", response_model=LoadDataResponse)
    async def start_pipeline(request: LoadDataRequest):
        pass
        
                    
    return app