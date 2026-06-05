# AI去背景工具包：真实 rembg API 安装说明

## 你现在有两个部分

1. 前端网站：`index.html`
2. 真实去背景服务：`backend/remove_bg_service`

前端会呼叫：

```text
http://127.0.0.1:8000/api/remove-bg
```

## 最快测试方式 Windows

进入：

```text
backend/remove_bg_service
```

双击：

```text
start_windows.bat
```

等待安装完成后，打开：

```text
http://127.0.0.1:8000/health
```

看到 `status: ok` 就可以回到网站测试。

## Ubuntu / AITPC

```bash
cd backend/remove_bg_service
chmod +x start_ubuntu.sh
./start_ubuntu.sh
```

## Docker

```bash
cd backend/remove_bg_service
docker compose up --build
```

## 前端测试

1. 打开 `index.html`
2. 后台密码：`admin123`
3. 工具包管理
4. AI去背景工具包
5. 直接测试
6. 上传图片
7. 点击「真实AI去背景/API」

## 注意

第一次运行 rembg 会下载模型，需要联网。下载后模型会缓存，之后可较稳定使用。
