from fastapi import FastAPI
import uvicorn
import models
from database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from routes import (
    auth_routes, 
    admin_routes, 
    cv_routes, 
    connection_routes, 
    chat_routes, 
    google_scholar_routes, 
    post_routes, 
    projet_routes,
    scopus_routes  
)

app = FastAPI(
    title="Academic Platform API",
    description="API for Academic Platform with JWT authentication, 2FA support, and Scopus integration",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

app.include_router(auth_routes.router)
app.include_router(admin_routes.router)
app.include_router(cv_routes.router)
app.include_router(connection_routes.router)
app.include_router(chat_routes.router)
app.include_router(google_scholar_routes.router)
app.include_router(post_routes.router)
app.include_router(projet_routes.router)
app.include_router(scopus_routes.router)  

@app.get("/")
def root():
    return {
        "message": "Welcome to Academic Platform API",
        "docs": "/docs",
        "authentication": "JWT with 2FA support",
        "features": ["CV Management", "Google Scholar", "Scopus Integration", "Connections", "Chat", "Posts", "Projects"]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)