from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from omr_logic import process_omr
import os

app = FastAPI()

class OMRRequest(BaseModel):
    image: str
    question_count: int = 10

@app.get("/")
def read_root():
    return {"status": "OMR Service Ready", "opencv_version": "active"}

@app.post("/scan")
async def scan_optical_form(request: OMRRequest):
    try:
        if not request.image:
            raise HTTPException(status_code=400, detail="Image data is required")
            
        result = process_omr(request.image, request.question_count)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error", "Unknown error processing image"))
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
