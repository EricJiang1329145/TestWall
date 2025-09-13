# 数据存储设计

## 存储方式

系统采用文件系统存储所有数据，不依赖数据库。每条消息以独立目录形式存储，目录名为消息ID，目录内包含`message.json`文件存储消息的所有信息。

## 消息存储结构

### 目录结构
```
messages/
├── 1000001/           # 消息ID作为目录名
│   └── message.json   # 消息数据文件
├── 1000002/
│   └── message.json
└── ...
```

### message.json文件格式
```json
{
  "id": 1234567,
  "timestamp": "2023-01-01 12:00:00",
  "text": "消息内容",
  "files": ["file1.jpg", "file2.mp4"],
  "likes": 10,
  "dislikes": 2,
  "comments": [
    {
      "id": "abc123",
      "text": "评论内容",
      "timestamp": "2023-01-01 12:05:00",
      "likes": 5,
      "dislikes": 0,
      "files": ["comment_file.jpg"]
    }
  ]
}
```

## 文件存储

### 上传文件
所有上传的文件存储在`static/uploads/`目录下，文件名采用UUID生成唯一名称，避免冲突。

### 缩略图文件
图片和视频文件会自动生成缩略图，存储在`static/tiny_files/`目录下。

### 已删除消息
删除的消息会被移动到`deleted_messages/`目录下，而不是直接删除，以便恢复。

## 其他数据文件

### managers.json
存储管理员账户信息：
```json
[
  {
    "name": "admin",
    "password": "hashed_password"
  }
]
```

### help/help.json
存储用户帮助请求：
```json
[
  {
    "id": "uuid",
    "title": "帮助标题",
    "email": "user@example.com",
    "text": "帮助内容",
    "timestamp": "2023-01-01 12:00:00"
  }
]
```

### help/report.json
存储用户举报信息：
```json
{
  "message_id": [
    {
      "id": "report_uuid",
      "text": "举报内容",
      "email": "user@example.com",
      "category": "垃圾信息",
      "timestamp": "2023-01-01 12:00:00"
    }
  ]
}
```

## 日志文件

### logs/
存储应用运行日志，按日期分割：
- `error.log`: 错误日志
- `admin.log`: 管理员操作日志
- `access.log`: 访问日志

## 数据加载与刷新

### 初始化加载
应用启动时，MessageManager会遍历`messages/`目录，加载所有消息数据到内存中。

### 自动刷新
使用多线程机制定期刷新消息列表：
- 主消息列表每0.2秒刷新一次
- 热门消息每60秒刷新一次

### 实时保存
每次对消息的修改都会立即保存到对应的`message.json`文件中，确保数据持久化。