# 服务器端API接口文档

## 消息相关接口

### 获取消息列表

**接口地址**: `/api/get_messages`

**请求方法**: GET

**请求参数**:
- `s` (可选): 排序方式，可选值为 "newest"(最新)、"likes"(最多点赞)、"dislikes"(最多点踩)，默认为 "newest"
- `w` (可选): 搜索关键词
- `f` (可选): 过滤条件，可选值为 "files"(仅含文件的消息)、"all"(所有消息)，默认为 "all"
- `start` (可选): 起始位置，默认为 0
- `end` (可选): 结束位置，默认为 10

**响应格式**:
```json
{
  "data": [...],  // 消息列表
  "total": 100    // 总消息数
}
```

### 获取所有消息

**接口地址**: `/api/get_all_messages`

**请求方法**: GET

**响应格式**:
```json
[...]  // 所有消息列表
```

### 获取消息详情

**接口地址**: `/api/get_message_details/<message_id>`

**请求方法**: GET

**路径参数**:
- `message_id`: 消息ID

**响应格式**:
```json
{
  "id": 1234567,
  "timestamp": "2023-01-01 12:00:00",
  "text": "消息内容",
  "files": ["file1.jpg", "file2.mp4"],
  "likes": 10,
  "dislikes": 2,
  "comments": [...],
  "liked": 0,     // 当前用户是否已点赞 (0:未点赞, 1:已点赞)
  "disliked": 0   // 当前用户是否已点踩 (0:未点踩, 1:已点踩)
}
```

### 提交新消息

**接口地址**: `/wall/submit`

**请求方法**: POST

**请求参数** (form-data):
- `text`: 消息文本内容
- `filenames`: 文件名列表

**响应格式**:
```json
{
  "success": true
}
```

### 对消息点赞

**接口地址**: `/wall/like/<message_id>`

**请求方法**: POST

**路径参数**:
- `message_id`: 消息ID

**响应格式**:
```json
{
  "success": true,
  "likes": 11,
  "action": "like"  // 或 "cancel"
}
```

### 对消息点踩

**接口地址**: `/wall/dislike/<message_id>`

**请求方法**: POST

**路径参数**:
- `message_id`: 消息ID

**响应格式**:
```json
{
  "success": true,
  "action": "dislike"  // 或 "cancel"
}
```

### 评论消息

**接口地址**: `/wall/comment/<message_id>`

**请求方法**: POST

**路径参数**:
- `message_id`: 消息ID

**请求参数** (form-data):
- `text`: 评论内容
- `file`: 评论附件（可选）
- `refer`: 引用内容（可选）
- `refer_id`: 引用ID（可选）

**响应格式**:
```json
{
  "success": true,
  "comment": {
    "id": "abc123",
    "text": "评论内容",
    "timestamp": "2023-01-01 12:00:00",
    "likes": 0,
    "dislikes": 0,
    "files": []
  }
}
```

## 文件上传接口

### 分片上传

**接口地址**: `/api/chunked_upload`

**请求方法**: POST

**请求参数** (form-data):
- `chunk`: 文件分片
- `chunkIndex`: 分片索引
- `totalChunks`: 总分片数
- `fileKey`: 文件标识
- `originalName`: 原始文件名

**响应格式**:
```json
{
  "success": true
}
```

### 合并分片

**接口地址**: `/api/merge_chunks`

**请求方法**: POST

**请求参数** (JSON):
```json
{
  "fileKey": "文件标识"
}
```

**响应格式**:
```json
{
  "success": true,
  "filenames": ["文件名"]
}
```

### 直接上传

**接口地址**: `/api/direct_upload`

**请求方法**: POST

**请求参数** (form-data):
- `file`: 文件
- `originalName`: 原始文件名

**响应格式**:
```json
{
  "success": true,
  "filenames": ["文件名"]
}
```

## 其他接口

### 获取公告

**接口地址**: `/api/notice`

**请求方法**: POST

**响应格式**:
```json
{
  "success": true,
  "content": "公告内容"
}
```

### 获取分页大小

**接口地址**: `/api/get_page_size`

**请求方法**: GET

**响应格式**:
```json
{
  "page_size": 10
}
```