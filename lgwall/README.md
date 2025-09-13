# 校园墙Vue应用

这是一个用于获取并显示校园墙帖子数据的Vue应用。

## 功能

- 通过访问 `https://www.rz101.com/api/get_messages` 获取帖子数据
- 直接显示返回的JSON内容
- 提供刷新数据功能
- 显示加载状态和错误处理

## 技术栈

- Vue 3 (TypeScript)
- Vite
- Tauri

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 构建

```bash
# 构建应用
npm run build
```

## 修改记录

### 2025-04-05
- 修改App.vue，实现从服务器获取帖子数据并显示JSON内容
- 添加了加载状态和错误处理
- 添加了刷新数据功能

### 2025-04-06
- 修改App.vue，实现评论功能，用户可以对帖子发表评论
- 添加了评论提交的API调用逻辑
- 修复评论提交后UI不更新的问题，确保评论能立即显示

### 2025-04-07
- 恢复帖子内容的完整显示，修复分页功能，添加关于帖子显示数量决定因素的文档说明
- 删除使用模拟数据按钮
- 添加深色模式功能以及深浅模式切换按钮

### 2025-09-13
- 将原有的emoji图标替换为Material Design Icons图标库

### 2025-01-15
- **代码结构优化**: 将App.vue拆分为多个组件和组合式函数
  - 创建 `src/components/Header.vue` - 头部导航组件
  - 创建 `src/components/PostCard.vue` - 帖子卡片组件
  - 创建 `src/components/Pagination.vue` - 分页组件
  - 创建 `src/composables/useMessages.ts` - 帖子数据管理组合式函数
  - 创建 `src/composables/useDarkMode.ts` - 深色模式管理组合式函数
  - 创建 `src/composables/useComments.ts` - 评论管理组合式函数
  - 创建 `src/types/index.ts` - TypeScript类型定义文件
- **TypeScript类型安全**: 添加完整的类型定义，包括Message、Comment等接口
- **组件化架构**: 重构App.vue使用组件化架构，提高代码可维护性和复用性
- **逻辑复用**: 使用Vue 3组合式API实现逻辑复用，分离关注点
- **修复分页问题**: 修复分页计算逻辑，解决只显示9月6日18:25前帖子的问题
- **评论分页功能**: 实现评论数量超过5条时自动启用分页显示，支持上一页/下一页导航和页码选择
- **响应式多列布局**: 实现屏幕宽度检测，自动切换布局模式：
  - 单列: < 700px
  - 两列: 700px ~ 1080px  
  - 三列: >= 1080px
    提高不同屏幕尺寸的设备利用率
