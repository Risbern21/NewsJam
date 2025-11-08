from sqlalchemy.orm import Session
from app.models.analysis import Analysis
from fastapi import HTTPException,status,Response
from uuid import UUID
from app.schemas.analysis import AnalysisBase

def create_analysis(analysis:AnalysisBase,db:Session)->Analysis:
    try:
        db_analysis = Analysis(
            user_id = analysis.user_id,
            post_id= analysis.post_id,
            credibility_score = analysis.credibility_score
        )
        db.add(db_analysis)
        db.commit()
        db.refresh(db_analysis)
        
        return db_analysis
    
    except HTTPException:
        raise
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"internal server error {e}"
        )
        
def get_analysis(a_id:UUID,db:Session)->Analysis:
    try:
        db_post = db.query(Analysis).filter(Analysis.id == a_id).first()
        if db_post is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="posts not found",
            )

        return db_post
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
def delete_analysis(a_id:UUID,db:Session):
    try:
        db_post = db.query(Analysis).filter(Analysis.id == a_id).first()

        if db_post is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )

        db.delete(db_post)
        db.commit()

        return Response(status_code=status.HTTP_204_NO_CONTENT)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )