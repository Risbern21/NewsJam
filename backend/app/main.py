from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import analysis, auth, posts, users

app = FastAPI()

# List of allowed origins (frontend URLs)
origins = [
    "http://localhost:3000",  # React app
    "http://127.0.0.1:3000",  # Alternative localhost
]

# Enable CORS middleware - MUST be added before routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
)

# Include routers after CORS middleware
app.include_router(users.router, prefix="/api/v1")
app.include_router(posts.router, prefix="/api/v1")
app.include_router(analysis.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "root endpoint works"}
