# 校园墙项目

此项目包含校园墙的后端服务和前端应用。

## 项目结构

- `campusWall/` - Flask后端服务
- `lgwall/` - Vue前端应用
- `docs/` - 项目文档
  - `server/` - 服务器端文档
    - `architecture.md` - 系统架构
    - `api.md` - API接口文档
    - `message_management.md` - 消息管理
    - `data_storage.md` - 数据存储
    - `file_upload.md` - 文件上传处理
    - `deployment.md` - 部署和运行
  - `frontend/` - 前端文档
    - `ui_design.md` - 界面设计

## 最近修改记录

### 2025- **2025-04-05**:
  - 重写 Vue 主页，仿照 rz101.com 风格，以帖子形式显示 JSON 内容
  - 修改了Vue应用 (`lgwall/src/App.vue`)，实现从服务器获取帖子数据并显示JSON内容
  - 添加了加载状态和错误处理
  - 添加了刷新数据功能
  - 添加了模拟数据功能和真实/模拟数据切换功能
  - 改进了错误处理和用户界面
  - 解决了CORS跨域问题
  - 创建了API文档 (`docs/api.md`)
  - 创建了Vue应用文档 (`docs/vue_app.md`)
  - 更新了Vue应用的README文件
  - 创建了服务器端详细文档 (`docs/server/`)
  - 修改评论区显示方式，将评论内容直接显示在帖子下方而不是隐藏在按钮里
  - 优化评论框显示，只在用户点击评论按钮时显示评论输入框，节省页面空间

## 后端服务 (campusWall)

Flask应用，提供以下API接口：
- `/api/get_messages` - 获取帖子数据

## 前端应用 (lgwall)

Vue应用，用于显示帖子数据：
- 通过访问 `/api/get_messages` 获取帖子数据（通过代理解决CORS问题）
- 直接显示返回的JSON内容
- 提供错误处理和模拟数据功能
- 实现评论提交功能，用户可以对帖子发表评论

### 功能说明
1. 帖子列表显示：从后端API获取并显示帖子列表
2. 数据刷新：支持手动刷新帖子数据
3. 评论功能：用户可以对帖子发表评论并提交到服务器

### 最新更新 (2025-04-07)

1. 恢复帖子内容的完整显示
2. 修复分页功能
3. 修复评论提交后UI不更新的问题
4. 更新了lgwall前端项目的文档
5. 优化了评论功能的用户体验
6. 添加了关于帖子显示数量决定因素的文档说明
7. 删除了使用模拟数据按钮
8. 添加了深色模式功能以及深浅模式切换按钮
9. 将原有的emoji图标替换为Material Design Icons图标库

### CORS问题和解决方案

在开发环境中，前端Vue应用通过Vite的代理功能解决CORS问题：

1. 在`vite.config.ts`中配置代理：
   ```javascript
   server: {
     proxy: {
       '/api': {
         target: 'https://www.rz101.com',
         changeOrigin: true,
         rewrite: (path) => path.replace(/^\/api/, '/api')
       }
     }
   }
   ```

2. 在前端代码中使用相对路径访问API：
   ```javascript
   fetch("/api/get_messages")
   ```

通过以上配置，前端应用可以通过`http://localhost:1420/api/get_messages`访问后端API，而不会遇到CORS限制。

### 常见问题和解决方案

#### 1. 网络错误 (net::ERR_FAILED)
当出现 `net::ERR_FAILED https://www.rz101.com/api/get_messages` 错误时，可能是以下原因：
- 服务器暂时不可用
- 网络连接问题
- CORS（跨域资源共享）限制

解决方案：
- 检查网络连接
- 稍后重试

#### 2. CORS 错误
如果在浏览器控制台看到 CORS 相关错误，说明存在跨域访问限制。

解决方案：
- 联系服务器管理员配置 CORS 策略
