from data_handler import DataHandler
from repository import Repository
from api_client import ApiClient
from enum import Enum
from data_models import RequestedData

class Status(Enum):
    LOADED = 1
    ERROR = 2
    EXIST = 3

    def __init__(self):
        self.__msg = ""

    def SetError(self, msg : str):
        self.__msg = msg
    
    def GetMsg(self):
        return self.__msg


class Orchestrator:

    def __init__(self, client : ApiClient, d_handler : DataHandler, repo: Repository):
        self.__client = client
        self.__handler = d_handler
        self.__repository = repo

    def process_data_pipeline(self, request_data: RequestedData) -> Status:
        if (self.__repository.is_already_exist(request_data)):
            return Status.EXIST
        
        cli_res = self.__client.fetch(request_data)
        handled_data = self.__handler.handle(cli_res)
        res = self.__repository.load_data(handled_data)

        if (not res):
            error = Status.ERROR
            error.SetError("msg")
            return error 
        
        return Status.LOADED