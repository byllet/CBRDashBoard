from api_client import ApiClient
from typing import List, Dict

class DataHandler():
    
    def extract_data(self, data : List[Dict]) -> List[List]:
        clean_data = []
        for row in data:
            clean_data.append((
                row["colId"],
                self.decrease_month(row["date"][0:10]),
                row["obs_val"],
                row["measure_id"]
        ))
            return clean_data
    
    def decrease_month(self, datetime):
        year, month, day = map(int, datetime.split('-'))
        if month == 1:
            month = 12
            year -= 1
        else:
            month -= 1
        return f"{year}-{month}-{day}"

class Repository():
    def __init__(self, connection_pool):
        ...
    
    def load_data(data):
        ...

    def is_already_exists(data):
        ...




def main():
    configs = [{
                "publicationId" : 34,
                "datasetId" :  131,
                "measureId" : 148
            },
            {
                "publicationId" : 18,
                "datasetId" : 37,
                "measureId" : 2
            },
            {
                "publicationId" : 14,
                "datasetId" : 29,
                "measureId" : -1
            },
            {
                "publicationId" : 20,
                "datasetId" : 41,
                "measureId" : 29
            },]
    extractor = ApiClient()
    handler = DataHandler()
    clean_data = handler.extract_data(extractor.fetch(configs[2]))
    print(clean_data[0])
    
    
if __name__ == '__main__':
    main()