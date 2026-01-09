from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, field_validator
import uvicorn
import os
import traceback
from omr_logic import process_omr

app = FastAPI()

class OMRRequest(BaseModel):
    image: str
    question_count: int = 10
    
    @field_validator('image')
    def validate_image(cls, v):
        if not v:
            raise ValueError('Image data cannot be empty')
        # Remove header if present
        if ',' in v:
            return v.split(',')[1]
        return v

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Python OMR"}

@app.post("/scan")
async def scan_optical_form(request: OMRRequest):
    print(f"📥 Received Scan Request. Question Count: {request.question_count}")
    try:
        if not request.image:
            print("❌ Error: Image data is empty")
            return {"success": False, "error": "Image data is required"}
            
        # Process asynchronously or directly
        print("🔍 Processing Image...")
        result = process_omr(request.image, request.question_count)
        
        if not result["success"]:
            print(f"❌ Processing Code Failed: {result.get('error')}")
            # Do NOT raise HTTPException, return JSON for graceful handling
            return result
            
        print(f"✅ Success! Detected Count: {result.get('detected_count')}")
        return result

    except Exception as e:
        error_msg = str(e)
        stack_trace = traceback.format_exc()
        print(f"🔥 CRITICAL SERVER ERROR: {error_msg}\n{stack_trace}")
        # Return 200 OK with success=false so Node.js can handle it without crashing
        return {
            "success": False, 
            "error": f"Critical Python Error: {error_msg}",
            "trace": stack_trace
        }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting Server on Port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
