from api_client import ApiClient
from typing import List, Dict
from datetime import datetime

class DataHandler:

    def extract_data(self, data : List[Dict]) -> List[List]:
        clean_data = []
        for row in data:
            clean_data.append((
                row["element_id"],
                row["measure_id"],
                self.decrease_month(row["date"][0:10]),
                row["obs_val"]
                ))
        return clean_data
    
    def decrease_month(self, date):
        year, month, day = map(int, date.split('-'))
        if month == 1:
            month = 12
            year -= 1
        else:
            month -= 1
        strtime = f"{year}-{month}-{day}"
        return datetime.strptime(strtime, '%Y-%m-%d').date()
    
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
    clean_data = handler.extract_data(extractor.fetch(configs[0]))
    print(clean_data[0])
    
    
if __name__ == '__main__':
    main()