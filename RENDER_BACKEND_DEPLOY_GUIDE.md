# Render 部署 rembg 去背景后端建议

Vercel 适合放前端，不适合跑 rembg 模型。真实去背景后端建议放 Render / Railway / VPS / AITPC。

## Render 部署步骤

1. 把 `backend/remove_bg_service` 放到 GitHub repo
2. Render → New Web Service
3. Runtime 选择 Docker
4. Build Command 留空
5. Start Command 使用 Dockerfile 默认
6. 部署完成后，测试：

```text
https://你的服务.onrender.com/health
```

看到 `status: ok` 即可。

## 前端填入 API

```text
https://你的服务.onrender.com/api/remove-bg
```

## 注意

免费 Render 可能会休眠，第一次调用会比较慢。
rembg 第一次启动会下载模型，需联网。
