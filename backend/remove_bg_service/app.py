from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from rembg import remove, new_session
from PIL import Image
from io import BytesIO
import os

app = FastAPI(title="Teacher AI Toolkit - Remove Background API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 默认使用通用模型。第一次运行会自动下载模型，需联网。
# 常用模型：u2net, u2netp, isnet-general-use
MODEL_NAME = os.getenv("REMBG_MODEL", "isnet-general-use")
session = None

def get_session():
    global session
    if session is None:
        session = new_session(MODEL_NAME)
    return session

def apply_background(png_bytes: bytes, output_bg: str, custom_color: str) -> bytes:
    if output_bg == "transparent":
        return png_bytes

    img = Image.open(BytesIO(png_bytes)).convert("RGBA")

    color_map = {
        "white": "#ffffff",
        "blue": "#dbeafe",
        "pink": "#fce7f3",
        "custom": custom_color or "#ffffff",
    }
    bg_color = color_map.get(output_bg, "#ffffff")

    bg = Image.new("RGBA", img.size, bg_color)
    bg.alpha_composite(img)
    out = BytesIO()
    bg.convert("RGB").save(out, format="PNG")
    return out.getvalue()

@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME}

@app.post("/api/remove-bg")
async def remove_background(
    image: UploadFile = File(...),
    output_bg: str = Form("transparent"),
    custom_color: str = Form("#ffffff"),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="请上传图片档案")

    raw = await image.read()
    if not raw:
        raise HTTPException(status_code=400, detail="图片为空")

    try:
        # rembg 输出透明 PNG
        result = remove(raw, session=get_session())
        result = apply_background(result, output_bg, custom_color)
        return Response(content=result, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"去背景失败：{e}")

@app.get("/")
def root():
    return JSONResponse({
        "service": "Teacher AI Toolkit Remove Background API",
        "health": "/health",
        "endpoint": "POST /api/remove-bg",
        "model": MODEL_NAME
    })
