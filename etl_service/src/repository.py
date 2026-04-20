import asyncpg
from typing import List

class Repository:
    pool : asyncpg.Pool
    def __init__(self, connection_pool: asyncpg.Pool):
        self.pool = connection_pool
    
    async def load_data(self, data : List[List]):
        async with self.pool.acquire() as conn:
            for header in data:
                await conn.executemany("""INSERT INTO economic_data ( parameter_id, region_id, record_date, parameter_value) 
                    VALUES ($1, $2, $3, $4)
                    """, header['data'])
    
    def is_already_exist(self):
        ...