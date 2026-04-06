from asyncio.windows_events import NULL
import requests
import json 
from types import SimpleNamespace
from typing import Dict, List
from config import cbr_api_url

class ApiClient:
    __url : str
    def __init__(self, url: str = cbr_api_url ) -> List[Dict]:
        self.__url = url
    
    
    def fetch(self, requested_data : List[str]) -> json:
        '''формат запрашиваемых данных: 
        {
            "publicationId" : Id публикации
            "datasetId" : Id экономического показателя, 
            "measureId" : Id разреза экономического показателя, 
            "y1" : Год начала отсчета, 
            "y2" : Год конца отсчета 
        }'''

        request_publication =  requests.get(
            "%s/datasets?publicationId=%d" % (self.__url, requested_data["publicationId"])
            ).json(object_hook=lambda d: SimpleNamespace(**d))
 
        if request_publication == []:
            raise RuntimeError("Выполнен запрос к несуществующей или неактивной публикации")
        
        dataset_item = next((e for e in request_publication if e.id == requested_data["datasetId"]), None)
        if dataset_item is None:
            raise RuntimeError("Выполнен запрос к публикации несуществующего показателя")

        request_measure = requests.get(
            "%s/measures?datasetId=%d" % (self.__url, requested_data["datasetId"])
            ).json(object_hook=lambda d: SimpleNamespace(**d)).measure

        if requested_data["measureId"] != -1 and request_measure == []:
            raise RuntimeError("Выполнен запрос к публикации по несуществующему разрезу")
        
        request_years = requests.get(
            ("%s/years" % self.__url), params={"measureId" : requested_data["measureId"], "datasetId" : requested_data["datasetId"]}
            ).json(object_hook=lambda d: SimpleNamespace(**d))[0] 
        
        '''Вариант с выбросом ошибки в случае несовпадения годов
        if requested_data["y1"] < request_years.FromYear:
            raise RuntimeError("Запрашиваемый год начала отсчета меньше существующего года начала отсчета")

        if requested_data["y2"] > request_years.ToYear:
            raise RuntimeError("Запрашиваемый год конца отсчета больше существующего года конца отсчета")'''
        
        #вариант с исправлением в случае несовпадения годов
        if 'y1' not in requested_data or requested_data["y1"] < requested_data['y1']:
            #print(f"Год начала был принудительно установлен как {request_years.FromYear}")
            requested_data['y1'] = request_years.FromYear

        if 'y2' not in requested_data or requested_data["y2"] > request_years.ToYear:
            #print(f"Год конца был принудительно установлен как {request_years.ToYear}")
            requested_data['y2'] = request_years.ToYear

        response_publication = requests.get(f"{self.__url}/data", params=requested_data)
        return response_publication.json()["RawData"]


def SaveJsonToFile(data, filename):
    with open(filename, 'w', encoding='utf8') as outfile:
        json.dump(data.json(), outfile, ensure_ascii=False, indent=4)

def main():
    example = ApiClient()

    currency_history = example.fetch({
                "publicationId" : 34,
                "datasetId" :  131,
                "measureId" : 148
            })
    deposit_history = example.fetch({
                "publicationId" : 18,
                "datasetId" : 37,
                "measureId" : 2
            })
    percent_history = example.fetch({
                "publicationId" : 14,
                "datasetId" : 29,
                "measureId" : -1
            })
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