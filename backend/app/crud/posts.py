from app.schemas.posts import PostBase, PostRead
from sqlalchemy.orm import Session, joinedload
from app.models.posts import Post
from app.core.verification import check_news_authenticity
from fastapi import HTTPException,status,Response
from typing import List
from uuid import UUID
from app.models.users import User
from app.core.image import extractTextFromImage

def create_post(post:PostBase,db:Session)->Post:
    try:
        # Prepare text for verification (use content or URL)
        text_to_verify = post.content if post.content else (post.url if post.url else post.title)
        
        # Verify the content using Gemini AI
        verification_result = check_news_authenticity(text_to_verify)
        print(verification_result)
        print(text_to_verify)
        
        # Extract verification results
        is_real = verification_result.get("real", True)
        credibility_score = verification_result.get("credibility_score", 0.5)
        
        db_post = Post(
            user_id = post.user_id,
            likes = post.likes,
            dislikes = post.dislikes,
            title= post.title,
            content = post.content,
            url=post.url,
            real=str(is_real).lower(),  # Store as string 'true' or 'false'
            credibility_score=str(credibility_score)  # Store as string to preserve precision
        )
        
        db.add(db_post)
        db.commit()
        db.refresh(db_post)
        return db_post
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"internal server error {e}"
        )
        
def get_post(p_id:UUID,db:Session)->List[Post]:
    try:
        db_post = db.query(Post).filter(Post.id == p_id).first()
        if db_post is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="posts not found",
            )

        return db_post
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def get_posts(db: Session, page: int = 1, limit: int = 20) -> List[Post]:
    try:
        # Calculate offset based on page number
        offset = (page - 1) * limit

        # Query posts with pagination and eagerly load user relationship
        db_posts = (
            db.query(Post)
            .options(joinedload(Post.user))
            .offset(offset)
            .limit(limit)
            .all()
        )

        if not db_posts:
            # Return empty list instead of raising error for better UX
            return []

        return db_posts

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

def get_posts_by_user(user_id: UUID, db: Session) -> List[Post]:
    """Get all posts created by a specific user"""
    try:
        db_posts = (
            db.query(Post)
            .options(joinedload(Post.user))
            .filter(Post.user_id == user_id)
            .order_by(Post.created_at.desc())  # Most recent first
            .all()
        )
        return db_posts
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
           
def update_post(post_id:UUID,post:PostBase,db:Session):
    try:
        db_user = db.query(User).filter(User.id == post.user_id)
        if db_user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="user not found",
            )

        db.query(Post).filter(Post.id == post_id).update(
            {
                Post.title:post.title,
                Post.content:post.content,
            }
        )
        db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def delete_post(post_id:UUID,db:Session):
    try:
        db_post = db.query(Post).filter(Post.id == post_id).first()

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