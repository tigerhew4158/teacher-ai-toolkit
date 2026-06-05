# Vercel 部署说明：阿虎老师 AI 工具包平台

## 重要说明

这个版本已经整理成 Vercel 可部署的静态前端网站。

前端功能可以直接线上测试：

- 注册 / 登入
- 工具包订购
- 上传付款收据预览
- 后台管理
- 课堂游戏生成
- PDF 题库生成测试
- 去背景工具界面
- 前端模拟去背景

但是「真实 rembg 去背景 API」不能直接放在 Vercel 静态前端里，因为 rembg 需要 Python、onnxruntime、模型文件和较长执行时间。建议：

- 前端：Vercel
- 去背景后端：Render / Railway / AITPC / VPS / 自己服务器

---

## 方法一：Vercel 网页上传

1. 打开 Vercel
2. New Project
3. 选择 Import 或 Upload
4. 上传这个资料夹：`teacher_ai_toolkit_mvp`
5. Deploy

部署完成后，你会得到类似：

```text
https://teacher-ai-toolkit.vercel.app
```

---

## 方法二：用 Vercel CLI

先安装：

```bash
npm i -g vercel
```

进入项目：

```bash
cd teacher_ai_toolkit_mvp
vercel
```

正式部署：

```bash
vercel --prod
```

---

## 去背景真实 API 设置

真实去背景后端仍在：

```text
backend/remove_bg_service
```

你可以把它部署到 Render / Railway / AITPC / VPS。

部署完成后会得到类似：

```text
https://your-remove-bg-api.onrender.com/api/remove-bg
```

然后在网站：

1. 后台登入 `admin123`
2. 工具包管理
3. AI去背景工具包
4. 直接测试
5. 在「去背景API网址」输入你的后端 API
6. 点击「真实AI去背景/API」

---

## 本地测试

```bash
cd teacher_ai_toolkit_mvp
python3 -m http.server 3000
```

打开：

```text
http://localhost:3000
```
