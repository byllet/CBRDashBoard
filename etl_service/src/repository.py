import asyncpg

class Repository:
    def __init__(self, pool : asyncpg.Pool):
        self.__pool = pool