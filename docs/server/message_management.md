# 消息管理模块

## Message类

Message类代表单条消息，负责处理消息的存储和操作。

### 数据结构

每条消息包含以下字段：
- `id`: 消息ID（7位数字）
- `timestamp`: 创建时间戳
- `text`: 消息文本内容
- `files`: 附件文件列表
- `likes`: 点赞数
- `dislikes`: 点踩数
- `comments`: 评论列表

每条评论包含以下字段：
- `id`: 评论ID（UUID）
- `text`: 评论文本内容
- `timestamp`: 创建时间戳
- `likes`: 点赞数
- `dislikes`: 点踩数
- `files`: 附件文件列表
- `refer`: 引用内容（可选）
- `refer_id`: 引用ID（可选）

### 方法

#### comment(text, files=[], refer='', refer_id='')
添加评论到消息中。

**参数**:
- `text`: 评论文本内容
- `files`: 附件文件列表（可选）
- `refer`: 引用内容（可选）
- `refer_id`: 引用ID（可选）

**返回值**: 新创建的评论对象

#### like()
增加消息的点赞数。

#### like_cancel()
减少消息的点赞数。

#### dislike()
增加消息的点踩数。

#### dislike_cancel()
减少消息的点踩数。

#### delete_comment(id)
删除指定ID的评论。

#### save()
将消息数据保存到文件系统。

#### destroy()
删除消息，将其移动到已删除消息目录。

## MessageManager类

MessageManager类负责管理所有消息，提供消息的CRUD操作和查询功能。

### 初始化

MessageManager在初始化时会：
1. 加载所有消息数据到内存
2. 启动自动刷新线程，定期更新消息列表
3. 计算热门消息

### 核心方法

#### get_message(id, like_list=[], dislike_list=[])
获取指定ID的消息详情。

**参数**:
- `id`: 消息ID
- `like_list`: 当前用户点赞的消息ID列表
- `dislike_list`: 当前用户点踩的消息ID列表

**返回值**: 消息详情对象，包含用户点赞状态

#### get_all_messages_dict()
获取所有消息的字典形式，键为消息ID，值为Message对象。

#### get_all_messages_list()
获取所有消息的列表形式。

#### post_message(text, files=[])
创建新消息。

**参数**:
- `text`: 消息文本内容
- `files`: 附件文件列表（可选）

#### comment_message(id, text, files=[], refer='', refer_id='')
为指定消息添加评论。

**参数**:
- `id`: 消息ID
- `text`: 评论文本内容
- `files`: 附件文件列表（可选）
- `refer`: 引用内容（可选）
- `refer_id`: 引用ID（可选）

**返回值**: 包含操作结果和新评论的对象

#### like_message(id, like_list)
为指定消息点赞。

**参数**:
- `id`: 消息ID
- `like_list`: 当前用户点赞的消息ID列表

**返回值**: 包含操作结果、点赞数和操作类型（like/cancel）的对象

#### dislike_message(id, dislike_list)
为指定消息点踩。

**参数**:
- `id`: 消息ID
- `dislike_list`: 当前用户点踩的消息ID列表

**返回值**: 包含操作结果和操作类型（dislike/cancel）的对象

#### get_messages(like_list, dislike_list, sort='newest', word='', filter='')
获取消息列表，支持排序、搜索和过滤。

**参数**:
- `like_list`: 当前用户点赞的消息ID列表
- `dislike_list`: 当前用户点踩的消息ID列表
- `sort`: 排序方式（newest, likes, dislikes）
- `word`: 搜索关键词
- `filter`: 过滤条件（files, all）

**返回值**: 符合条件的消息列表

#### delete_message(id)
删除指定ID的消息。

#### delete_comment(message_id, comment_id)
删除指定消息中的指定评论。

#### create_id()
生成唯一的7位数字消息ID。

### 辅助方法

#### search_messages(messages, word)
根据关键词搜索消息。

#### filter_messages(messages, filter_critical)
根据过滤条件筛选消息。

#### sort_messages(messages, sort)
对消息进行排序。

#### deal_with_messages(messages, like_list, dislike_list)
处理消息列表，添加用户点赞状态信息。

#### refresh_hot_messages()
重新计算热门消息。

#### get_hot_messages(like_list=[], dislike_list=[])
获取热门消息列表。