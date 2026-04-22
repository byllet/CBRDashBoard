import requests
import json 
from types import SimpleNamespace
from typing import Dict, List
from config import cbr_api_url
from data_models import RequestedData
from datetime import datetime


class ApiClient:
    __url : str
    configs = {"Курс валют" : (33, 127, -1),
                "Ставки по кредитам" : (14, 25, 2), 
                "Статистика кредитования" : (20, 41, 22),
                "Денежные агрегаты" : (5, 7, -1), 
                "Ставки по депозитам" : (18, 37, 2)}
    
    def __init__(self, url: str = cbr_api_url ) -> List[Dict]:
        self.__url = url
    
    
    def fetch(self, requested_data : RequestedData) -> json:
        
        config = self.configs[requested_data.name]
        params = {"publicationId" : config[0],
                "datasetId" : config[1],
                "measureId" : config[2]}
        
        
        request_years = requests.get(
            ("%s/years" % self.__url), params=params
            ).json(object_hook=lambda d: SimpleNamespace(**d))[0] 
        
        if requested_data.time_from.year <  request_years.FromYear:
            #print(f"Год начала был принудительно установлен как {request_years.FromYear}")
            params['y1'] = request_years.FromYear
        else:
            params['y1'] = requested_data.time_from.year

        if requested_data.time_to.year > request_years.ToYear:
            #print(f"Год конца был принудительно установлен как {request_years.ToYear}")
            params['y2'] = request_years.ToYear
        else:
            params['y2'] = requested_data.time_to.year

        response_publication = requests.get(f"{self.__url}/data", params=params)
        headers = response_publication.json()['headerData']
        for header in headers:
            header['elname'] = requested_data.name + " " + header["elname"].lower()
        return response_publication.json()["RawData"], headers


def SaveJsonToFile(data, filename):
    with open(filename, 'w', encoding='utf8') as outfile:
        json.dump(data.json(), outfile, ensure_ascii=False, indent=4)

def main():
    example = ApiClient()

    currency_request = RequestedData
    currency_request.name = 'Ставки по кредитам'
    currency_request.time_from = datetime(1984, 1 , 1)
    currency_request.time_to = datetime(2100, 1, 1)
    currency_history = example.fetch(currency_request)
    '''incorrect fetch
    xx = example.fetch({ #incorrect
                "publicationId" : 228,
                "datasetId" : 56,
                "measureId" : 78
            })'''
    #SaveJsonToFile(currency_history, "currency_history.json")
    #SaveJsonToFile(deposit_history, "deposit_history.json")
    #SaveJsonToFile(percent_history, "percent_history.json")
if __name__ == '__main__':
    main()
