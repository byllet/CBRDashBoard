from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class RequestedData:
    name : str
    time_from: datetime
    time_to: datetime
    location : Optional[str] = None
