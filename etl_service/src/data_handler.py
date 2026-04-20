from api_client import ApiClient
from typing import List, Dict
from data_models import RequestedData
from datetime import datetime

class DataHandler:

    def extract_data(self, data : List[Dict]) -> List[List]:
        raw_data, headers = data
        clean_data = []
        for i, header in enumerate(headers):
            h_data = {'id' : header['id'], 'name' : header['elname'], 'data' : []}
            for j in range(i, len(raw_data), len(headers)):
                row = raw_data[j]
                h_data['data'].append((
                    header['id'],
                    row["element_id"],
                    self.decrease_month(row["date"][0:10]),
                    row["obs_val"]
                    ))
            clean_data.append(h_data)
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
    currency_request = RequestedData
    currency_request.name = 'Курс валют'
    currency_request.time_from = datetime(1984, 1 , 1)
    currency_request.time_to = datetime(2100, 1, 1)
    extractor = ApiClient()
    handler = DataHandler()
    clean_data = handler.extract_data(extractor.fetch(currency_request))
    print(clean_data[0]['data'][0])
    
    
if __name__ == '__main__':
    main()