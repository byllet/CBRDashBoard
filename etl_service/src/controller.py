from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import logging
from datetime import datetime

from orchestrator import Orchestrator
from data_models import RequestedData

logger = logging.getLogger(__name__)

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime

class LoadDataRequest(BaseModel):
    name: str
    time_from: Optional[str]
    time_to: Optional[str]
    location: Optional[str]

class LoadDataResponse(BaseModel):
    status: str

def create_app(orchestrator: Orchestrator) -> FastAPI:
    app = FastAPI(title="ETL Service", version="1.0.0")
    
    @app.get("/health", response_model=HealthResponse)
    async def health_check():
        return HealthResponse(
            status="healthy",
            timestamp=datetime.now()
        )
    
    @app.post("/api/v1/", response_model=LoadDataResponse)
    async def get(request: LoadDataRequest):
        orchestrator.process_data_pipeline(RequestedData(request.name, request.time_from, request.time_to, request.location))
        return {"status" : "resp"}
        
                    
    return app