import asyncpg
import asyncio
from asyncpg.pool import Pool
from datetime import datetime
async def insert_many_basic(pool: Pool, data: list):
    async with pool.acquire() as conn:
        await conn.executemany("""
            INSERT INTO economic_data (id, parameter_id, region_id, record_date, parameter_value) 
            VALUES ($1, $2, $3, $4, $5)
        """, data)

# Использование
async def main():
    pool = await asyncpg.create_pool(
        host='localhost',
        database='economic_data',
        user='cbrf',
        password='123',
        min_size=2,
        max_size=10
    )
    
    data = [
        (1, 5, 1, datetime.strptime('2024-01-01', '%Y-%m-%d').date() , 123.45),
        (2, 5, 1, datetime.strptime('2024-01-01', '%Y-%m-%d').date() , 678.90),
        (3, 6, 1, datetime.strptime('2024-01-02', '%Y-%m-%d').date() , 456.78)
    ]
    
    await insert_many_basic(pool, data)
    await pool.close()

asyncio.run(main())