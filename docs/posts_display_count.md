# 帖子显示数量的决定因素

## 概述

在TestWall项目中，帖子显示数量由多个因素共同决定，包括后端配置、API参数和前端实现。

## 后端决定因素

### 1. 默认分页大小配置
在后端 `campusWall/app.py` 文件中，定义了默认的分页大小：
```python
MESSAGE_PAGE_SIZE = 15
```

### 2. API接口参数
`/api/get_messages` 接口支持通过URL参数控制返回的帖子数量：
- `start`: 起始位置（默认为0）
- `end`: 结束位置（默认为10）

### 3. 分页实现逻辑
后端通过以下方式实现分页：
```python
start_range = request.args.get('start', 0, type=int)
end_range = request.args.get('end', 10, type=int)
paginated_messages = messages[start_range:end_range]
```

### 4. 页面大小API
提供 `/api/get_page_size` 接口返回默认页面大小：
```python
@app.route('/api/get_page_size', methods=['GET'])
def api_get_page_size():
    return jsonify({"page_size": MESSAGE_PAGE_SIZE})
```

## 前端决定因素

### 1. 分页状态管理
前端通过以下响应式变量管理分页状态：
- `currentPage`: 当前页码
- `pageSize`: 每页显示数量
- `totalMessages`: 总消息数

### 2. 数据获取逻辑
前端通过以下步骤获取分页数据：
1. 首先调用 `/api/get_page_size` 获取默认页面大小
2. 根据当前页码计算 `start` 和 `end` 参数
3. 调用 `/api/get_messages?start=${start}&end=${end}` 获取指定范围的数据

### 3. 分页控件显示
分页控件仅在以下条件下显示：
- 不使用模拟数据 (`!useMockData`)
- 总消息数大于每页显示数量 (`totalMessages > pageSize`)

## 总结

帖子显示数量主要由后端的 `MESSAGE_PAGE_SIZE` 常量决定，但可以通过API参数进行动态调整。前端通过分页控件和API调用实现按需加载，提高性能和用户体验。