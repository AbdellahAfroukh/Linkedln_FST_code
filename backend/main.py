from fastapi import FastAPI
import uvicorn
import models
from database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from routes import auth_routes, admin_routes, cv_routes


app = FastAPI(
    title="Academic Platform API",
    description="API with JWT authentication and 2FA",
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

@app.get("/")
def root():
    return {
        "message": "Welcome to Academic Platform API",
        "docs": "/docs",
        "authentication": "JWT with 2FA support"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)