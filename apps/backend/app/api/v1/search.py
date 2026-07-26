from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def search():
    return []

@router.get("/suggestions")
async def search_suggestions():
    return []
