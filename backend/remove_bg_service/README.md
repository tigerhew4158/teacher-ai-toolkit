# Remove Background API - rembg 真实去背景服务

这是给「阿虎老师AI工具包」使用的真实去背景后端。

## 功能

- 接收图片上传
- 使用 rembg / U²-Net / IS-Net 去背景
- 输出透明 PNG
- 支持白底、蓝底、粉底、自选颜色背景
- 前端调用地址：`http://127.0.0.1:8000/api/remove-bg`

## Windows / Mac / Ubuntu 安装

```bash
cd backend/remove_bg_service
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

### Mac / Ubuntu

```bash
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

第一次运行会自动下载模型，需要联网。下载后可离线使用。

## 测试

浏览器打开：

```text
http://127.0.0.1:8000/health
```

如果看到：

```json
{"status":"ok"}
```

代表服务已启动。

## 模型选择

默认模型：

```text
isnet-general-use
```

也可以改用：

```bash
REMBG_MODEL=u2net python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

## 前端使用

1. 打开 `index.html`
2. 进入后台 `admin123`
3. 工具包管理
4. AI去背景工具包
5. 直接测试
6. 上传图片
7. 点击「真实AI去背景/API」

