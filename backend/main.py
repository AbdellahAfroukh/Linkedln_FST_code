from fastapi import FastAPI
import uvicorn
import models
from database import engine
from fastapi.middleware.cors import CORSMiddleware
import routes


app = FastAPI()


models.Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)