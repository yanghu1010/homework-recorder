# 学习机英语作业录制网站

这是一个可部署的 Next.js 前端项目骨架，适合你的场景：

- 学习机打开网页
- 先看老师示范视频
- 再准备物品
- 每一句自动英文播报
- 孩子说完后点击“下一句”
- 调用摄像头和麦克风录制
- 后续接云端上传接口

## 启动方式

```bash
npm install
npm run dev
```

## 你需要替换/接入的内容

1. `public/teacher-demo.mp4`
   - 替换成你的老师示范视频

2. 上传接口
   - `POST /api/kid/submissions`
   - `POST /api/kid/submissions/:id/upload-sign`
   - `POST /api/kid/submissions/:id/complete`

3. 家长端查看页
   - 当前项目先聚焦孩子端录制流程

## 部署建议

- Vercel
- Netlify
- Cloudflare Pages
- 自有服务器 + Node.js

## 新增页面

- 孩子端主页：`/`
- 家长端查看下载页：`/parent`

你部署后，可以把：
- 学习机打开 `你的域名/`
- 你的手机打开 `你的域名/parent`
