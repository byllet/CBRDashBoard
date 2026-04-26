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
    time_from: Optional[datetime] = None
    time_to: Optional[datetime] = None
    location: Optional[str] = None

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
        orchestrator = app.state.orchestrator
        if request.time_from is None:
            request.time_from = datetime(2000, 1, 1)
        if request.time_to is None:
            request.time_to = datetime.now()
        
        request_data = RequestedData(
            name=request.name,
            time_from=request.time_from,
            time_to=request.time_to,
            location=request.location
        )
        print(request_data)
    
        status = await orchestrator.process_data_pipeline(request_data)
        print(f"status = {status}")
        return {"status" : status.name}
        
    return app