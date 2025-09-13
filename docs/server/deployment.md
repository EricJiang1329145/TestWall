# 应用部署和运行

## 环境要求

### Python版本
- Python 3.7 或更高版本

### 依赖包
查看`requirements.txt`文件获取完整依赖列表，主要包含：
- Flask: Web框架
- Pillow: 图片处理
- 其他必要的Python库

## 安装步骤

### 1. 克隆代码库
```bash
git clone <repository_url>
cd campusWall
```

### 2. 创建虚拟环境
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate     # Windows
```

### 3. 安装依赖
```bash
pip install -r requirements.txt
```

### 4. 创建必要目录
```bash
mkdir -p static/uploads
mkdir -p static/tiny_files
mkdir -p static/chunks
mkdir -p messages
mkdir -p deleted_messages
mkdir -p logs
mkdir -p help
```

### 5. 配置管理员账户
编辑`managers.json`文件，添加管理员账户信息：
```json
[
  {
    "name": "admin",
    "password": "your_hashed_password"
  }
]
```

## 运行应用

### 开发环境运行
```bash
python app.py
```

应用默认运行在`http://localhost:5000`

### 生产环境部署

#### 使用Gunicorn
1. 安装Gunicorn：
```bash
pip install gunicorn
```

2. 运行应用：
```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

#### 使用uWSGI
1. 安装uWSGI：
```bash
pip install uwsgi
```

2. 创建uWSGI配置文件`uwsgi.ini`：
```ini
[uwsgi]
module = app:app
master = true
processes = 4
socket = /tmp/uwsgi.sock
chmod-socket = 666
vacuum = true
die-on-term = true
```

3. 运行应用：
```bash
uwsgi --ini uwsgi.ini
```

## 配置说明

### 应用配置
在`app.py`中可以配置以下参数：
- `UPLOAD_FOLDER`: 上传文件存储目录
- `TINY_FILE_FOLDER`: 缩略图存储目录
- `CHUNK_FOLDER`: 分片文件临时存储目录
- `MESSAGE_PAGE_SIZE`: 消息分页大小
- `MAX_CONTENT_LENGTH`: 最大上传文件大小限制

### 目录配置
确保以下目录存在且有写入权限：
- `messages/`: 消息数据存储目录
- `static/uploads/`: 上传文件存储目录
- `static/tiny_files/`: 缩略图存储目录
- `static/chunks/`: 分片文件临时存储目录
- `deleted_messages/`: 已删除消息存储目录
- `logs/`: 日志文件存储目录
- `help/`: 帮助和举报信息存储目录

## 日志管理

### 日志文件
- `logs/error.log`: 错误日志
- `logs/admin.log`: 管理员操作日志
- `logs/access.log`: 访问日志

### 日志轮转
建议配置日志轮转以避免日志文件过大：
```bash
# 使用logrotate配置
/path/to/campusWall/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

## 性能优化

### 多进程部署
在生产环境中建议使用多进程部署以提高性能：
```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### 静态文件服务
在生产环境中，建议使用Nginx等专业Web服务器提供静态文件服务：
```nginx
location /static/ {
    alias /path/to/campusWall/static/;
}
```

### 缓存策略
- 消息数据在内存中缓存，定期刷新
- 静态文件可配置浏览器缓存
- 缩略图生成后缓存复用

## 安全考虑

### HTTPS
在生产环境中务必启用HTTPS以保护数据传输安全。

### 文件上传安全
- 严格验证文件类型
- 生成安全的文件名
- 限制文件大小
- 定期清理临时文件

### 访问控制
- 管理员功能需要身份验证
- 敏感操作需要权限验证
- 防止SQL注入和其他常见攻击

## 故障排除

### 常见问题

1. **应用无法启动**
   - 检查Python版本是否符合要求
   - 检查依赖包是否完整安装
   - 检查必要目录是否存在

2. **文件上传失败**
   - 检查上传目录权限
   - 检查文件大小限制
   - 检查磁盘空间

3. **图片/视频无法显示**
   - 检查缩略图是否生成
   - 检查文件路径配置
   - 检查静态文件服务配置

### 监控和维护

1. **定期检查日志文件**
2. **监控磁盘空间使用情况**
3. **定期备份重要数据**
4. **更新依赖包以修复安全漏洞**