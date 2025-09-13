# 后端API接口文档

## 获取帖子数据

### 请求地址
```
GET /api/get_messages
```

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| s | string | 否 | 搜索关键词 |
| w | string | 否 | 筛选条件 |
| f | string | 否 | 文件类型筛选 |
| start | integer | 否 | 起始位置 |
| end | integer | 否 | 结束位置 |

### 响应格式
```json
{
  "data": [
    {
      "id": "帖子ID",
      "text": "帖子内容",
      "timestamp": "时间戳",
      "files": ["文件链接列表"],
      "likes": "点赞数"
    }
  ]
}
```

### 示例请求
```
/api/get_messages?s=校园&w=all&f=all&start=0&end=10
```

### 示例响应
```json
{
  "data": [
    {
      "id": "1",
      "text": "这是第一条帖子内容",
      "timestamp": "2025-04-05 14:13:00",
      "files": [],
      "likes": 10
    }
  ]
}
```

## CORS问题和解决方案

### 问题描述
在开发环境中，前端Vue应用可能会遇到CORS（跨域资源共享）限制，导致无法从浏览器直接访问后端API。

### 解决方案

1. **服务器端解决方案**（推荐）
   在Flask后端应用中启用CORS支持：
   ```python
   from flask_cors import CORS
   
   app = Flask(__name__)
   CORS(app)  # 允许所有域名的请求
   ```

2. **开发环境解决方案**
   使用Vite代理功能，在`vite.config.ts`中配置代理：
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

   然后在前端代码中使用相对路径访问API：
   ```javascript
   // 使用代理前
   fetch("https://www.rz101.com/api/get_messages")
   
   // 使用代理后
   fetch("/api/get_messages")
   ```

通过以上配置，前端应用可以通过`http://localhost:1420/api/get_messages`访问后端API，而不会遇到CORS限制。