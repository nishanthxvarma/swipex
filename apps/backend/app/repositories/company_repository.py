from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from app.models.job import CompanyModel, JobModel
import uuid
from typing import Optional, List

class CompanyRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_companies(
        self,
        query: Optional[str] = None,
        industry: Optional[str] = None,
        location: Optional[str] = None,
        page: int = 1,
        per_page: int = 20
    ) -> List[CompanyModel]:
        stmt = select(CompanyModel).options(selectinload(CompanyModel.jobs))
        
        if query:
            stmt = stmt.where(
                or_(
                    CompanyModel.name.ilike(f"%{query}%"),
                    CompanyModel.description.ilike(f"%{query}%"),
                    CompanyModel.industry.ilike(f"%{query}%")
                )
            )
        if industry and industry.upper() != "ALL":
            stmt = stmt.where(CompanyModel.industry.ilike(f"%{industry}%"))
        if location:
            stmt = stmt.where(CompanyModel.headquarters.ilike(f"%{location}%"))

        stmt = stmt.order_by(CompanyModel.name.asc()).limit(per_page).offset((page - 1) * per_page)
        res = await self.db.execute(stmt)
        return res.scalars().all()

    async def get_by_id(self, company_id: uuid.UUID) -> Optional[CompanyModel]:
        if isinstance(company_id, str):
            company_id = uuid.UUID(company_id)
        stmt = select(CompanyModel).options(selectinload(CompanyModel.jobs)).where(CompanyModel.id == company_id)
        res = await self.db.execute(stmt)
        return res.scalars().first()

    async def create(self, company: CompanyModel) -> CompanyModel:
        self.db.add(company)
        await self.db.commit()
        await self.db.refresh(company)
        return company

    async def update(self, company: CompanyModel) -> CompanyModel:
        self.db.add(company)
        await self.db.commit()
        await self.db.refresh(company)
        return company
