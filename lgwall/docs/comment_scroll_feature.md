# 评论区滚动显示功能

## 功能描述

将原本的评论分页功能改为滚动显示，用户可以通过滚动浏览所有评论，而无需点击分页按钮。

## 实现细节

### 1. 移除分页相关逻辑

- 删除了 `commentsPerPage` 常量
- 删除了 `currentCommentPage` 状态变量
- 删除了以下计算属性：
  - `paginatedComments`
  - `totalCommentPages`
  - `shouldShowCommentPagination`
- 删除了以下分页控制方法：
  - `prevCommentPage`
  - `nextCommentPage`
  - `goToCommentPage`

### 2. 修改评论渲染方式

- 将模板中的 `v-for` 循环数据源从 `paginatedComments` 改为 `message.comments`
- 移除了分页控件相关的 HTML 元素

### 3. 添加滚动样式

- 为评论容器添加了最大高度限制 (`max-height: 300px`)
- 启用垂直滚动 (`overflow-y: auto`)
- 自定义滚动条样式以提升用户体验

### 4. 深色模式适配

- 为深色模式下的滚动条添加了相应的样式

## 样式说明

```css
.comments-container {
  max-height: 300px; /* 限制最大高度 */
  overflow-y: auto; /* 允许垂直滚动 */
  padding: 0.5rem 0;
}

/* 滚动条样式 */
.comments-container::-webkit-scrollbar {
  width: 6px;
}

.comments-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.comments-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.comments-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
```

## 深色模式样式

```css
.dark .comments-container::-webkit-scrollbar-track {
  background: #3a3a3a;
}

.dark .comments-container::-webkit-scrollbar-thumb {
  background: #555;
}

.dark .comments-container::-webkit-scrollbar-thumb:hover {
  background: #666;
}
```