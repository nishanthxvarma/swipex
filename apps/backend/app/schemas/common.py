from pydantic import BaseModel
from typing import Generic, TypeVar, List, Optional

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    per_page: int
    pages: int

class ErrorResponse(BaseModel):
    detail: str

class SuccessResponse(BaseModel):
    message: str

class SearchQuery(BaseModel):
    query: str
    filters: Optional[dict] = None
    page: int = 1
    per_page: int = 20
    sort_by: Optional[str] = None
    sort_order: Optional[str] = None
