from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session

from app.schemas.analysis import AnalysisBase

from uuid import UUID
from app.crud import posts

# from app.api.v1.auth import get_current_user
from app.db.session import get_db

from app.crud import analysis as analysisCrud

from app.crud import analysis

router = APIRouter(prefix="/analysis",tags=["analysis"])

@router.post("/")
def create_analysis(analysis:AnalysisBase,
                # current_user: User = Depends(get_current_user),
                db:Session = Depends(get_db)):
    return analysisCrud.create_analysis(analysis=analysis,db=db)

@router.get("/{a_id}")
def get_post(
    a_id:UUID,
    db: Session = Depends(get_db),
):
    return posts.get_posts(a_id=a_id,db=db)


@router.delete("/{a_id}")
def delete_post(
    a_id:UUID,
    db:Session=Depends(get_db)
):
    return analysis.delete_analysis(a_id=a_id,db=db)