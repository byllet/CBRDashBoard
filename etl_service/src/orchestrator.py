from data_handler import DataHandler
from repository import Repository
from api_client import ApiClient
from enum import Enum
from data_models import RequestedData

class Status(Enum):
    LOADED = 1
    ERROR = 2
    EXIST = 3

    def SetError(self, msg : str):
        self.__msg = msg
    
    def GetMsg(self):
        if not hasattr(self, '__msg') or self.__msg is None:
            self.__msg = ""
        return self.__msg


class Orchestrator:
    def __init__(self, client : ApiClient, d_handler : DataHandler, repo: Repository):
        self.__client = client
        self.__handler = d_handler
        self.__repository = repo

    async def process_data_pipeline(self, request_data: RequestedData) -> Status:
        try:
            if await self.__repository.is_already_exist(request_data):
                return Status.EXIST
            
            if request_data.name not in ApiClient.configs:
                error = Status.ERROR
                error.SetError(f"{request_data.name} not in ApiClient.configs")
                print(error.GetMsg())
                return error 

            print("Fetching data from API...")
            cli_res = await self.__client.fetch(request_data)
            print("After fetch")
            handled_data = self.__handler.extract_data(cli_res)
            print("Data extracted successfully")
            await self.__repository.load_data(handled_data)
            print("Data loaded successfully")
        except Exception as e:
            error = Status.ERROR
            error.SetError(str(e))
            print(e)
            return error 
        
        return Status.LOADED