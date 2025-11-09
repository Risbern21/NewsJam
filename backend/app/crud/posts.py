from app.schemas.posts import PostBase, PostRead
from sqlalchemy.orm import Session, joinedload
from app.models.posts import Post
from app.core.verification import check_news_authenticity
from fastapi import HTTPException,status,Response
from typing import List
from uuid import UUID, uuid4
from app.models.users import User
from app.core.image import extractTextFromImage
import time
from pathlib import Path
from fastapi import UploadFile
from app.schemas.posts import PostBase

# Local storage directory
DEST_DIR = Path("dest")

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
        
async def upload_image(file:UploadFile, post_id: UUID = None):
    try:
        # Read the file content
        file_bytes = await file.read()

        # Get file extension from original filename
        file_extension = Path(file.filename).suffix if file.filename else ".jpg"
        
        # Create file name using post_id if provided, otherwise use UUID
        if post_id:
            file_name = f"{post_id}{file_extension}"
        else:
            # Use UUID as temporary name, will be renamed when post is created
            file_name = f"{uuid4()}{file_extension}"

        # Ensure dest directory exists
        DEST_DIR.mkdir(parents=True, exist_ok=True)

        # Save file locally
        file_path = DEST_DIR / file_name
        with open(file_path, "wb") as f:
            f.write(file_bytes)

        # Return relative path that can be used to serve the file
        # In production, you might want to serve this via a static file endpoint
        public_url = f"/dest/{file_name}"

        return {
            "message": "Upload successful",
            "file_name": file_name,
            "file_path": str(file_path),
            "public_url": public_url,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def rename_image_to_post_id(old_url: str, post_id: UUID, db: Session = None):
    """
    Rename an uploaded image file to use the post ID as the filename.
    This is called after post creation to ensure files are named with their post ID.
    """
    try:
        # Extract filename from URL (e.g., "/dest/uuid.jpg" -> "uuid.jpg")
        if not old_url.startswith("/dest/"):
            return  # Not a local file, skip renaming
        
        old_filename = old_url.replace("/dest/", "")
        old_file_path = DEST_DIR / old_filename
        
        # Check if file exists
        if not old_file_path.exists():
            return  # File doesn't exist, skip renaming
        
        # Get file extension
        file_extension = Path(old_filename).suffix
        
        # Create new filename with post ID
        new_filename = f"{post_id}{file_extension}"
        new_file_path = DEST_DIR / new_filename
        
        # Rename the file
        old_file_path.rename(new_file_path)
        
        # Update post URL in database if db session is provided
        if db:
            new_url = f"/dest/{new_filename}"
            db.query(Post).filter(Post.id == post_id).update({Post.url: new_url})
            db.commit()
        
        return new_file_path
        
    except Exception as e:
        # Log error but don't fail the post creation
        print(f"Error renaming image file: {e}")
        return None

async def upload_image_and_create_post(
    file: UploadFile,
    user_id: UUID,
    title: str,
    db: Session
) -> Post:
    """
    Upload an image, extract text from it, and create a post with the extracted text.
    The post URL will be set to the post ID.
    """
    try:
        # Step 1: Upload and save the image locally with UUID
        file_bytes = await file.read()
        file_extension = Path(file.filename).suffix if file.filename else ".jpg"
        temp_file_name = f"{uuid4()}{file_extension}"
        
        # Ensure dest directory exists
        DEST_DIR.mkdir(parents=True, exist_ok=True)
        
        # Save file locally
        temp_file_path = DEST_DIR / temp_file_name
        with open(temp_file_path, "wb") as f:
            f.write(file_bytes)
        
        # Step 2: Extract text from the image
        extracted_text = extractTextFromImage(str(temp_file_path))
        
        # Step 3: Create post with extracted text
        # The URL will be set to the post ID after creation
        post_data = PostBase(
            user_id=user_id,
            title=title,
            content=extracted_text,
            url=f"/dest/{temp_file_name}",  # Temporary URL, will be updated
            likes=0,
            dislikes=0
        )
        
        # Step 4: Create the post
        created_post = create_post(post=post_data, db=db)
        
        # Step 5: Rename image file to use post ID
        file_extension = Path(temp_file_name).suffix
        new_file_name = f"{created_post.id}{file_extension}"
        new_file_path = DEST_DIR / new_file_name
        temp_file_path.rename(new_file_path)
        
        # Step 6: Update post URL to use post ID
        new_url = f"/dest/{created_post.id}{file_extension}"
        db.query(Post).filter(Post.id == created_post.id).update({Post.url: new_url})
        db.commit()
        db.refresh(created_post)
        
        # Ensure the URL is set correctly in the returned object
        created_post.url = new_url
        
        return created_post
        
    except Exception as e:
        db.rollback()
        # Clean up temp file if it exists
        if 'temp_file_path' in locals() and temp_file_path.exists():
            try:
                temp_file_path.unlink()
            except:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading image and creating post: {str(e)}"
        )