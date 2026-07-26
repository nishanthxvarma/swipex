import redis.asyncio as redis
from app.core.config import settings

class RedisClient:
    def __init__(self):
        self.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)

    async def get(self, key: str):
        return await self.redis.get(key)

    async def set(self, key: str, value: str, ex: int = None):
        await self.redis.set(key, value, ex=ex)

    async def delete(self, key: str):
        await self.redis.delete(key)

    async def exists(self, key: str):
        return await self.redis.exists(key)

redis_client = RedisClient()

async def get_redis():
    return redis_client
