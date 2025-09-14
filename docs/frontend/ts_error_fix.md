# TypeScript 错误修复文档

## 问题描述

在 PostCard.vue 组件中存在以下 TypeScript 错误：

1. `e.target` 可能为 `null` 的类型错误
2. `EventTarget` 类型上不存在 `src` 和 `value` 属性的错误
3. 未使用的 `Comment` 类型导入
4. 未使用的 `getFileIcon` 函数

## 修复方案

### 1. 修复 e.target 可能为 null 的问题

**原代码：**
```vue
@error="(e) => e.target.src = getFileUrl(file)"
```

**修复后：**
```vue
@error="(e) => { const target = e.target as HTMLImageElement; if (target) target.src = getFileUrl(file); }"
```

### 2. 修复 EventTarget 类型问题

**原代码：**
```vue
@change="goToCommentPage(Number($event.target.value))"
```

**修复后：**
```vue
@change="(e) => { const target = e.target as HTMLSelectElement; if (target) goToCommentPage(Number(target.value)); }"
```

### 3. 删除未使用的导入和函数

- 删除未使用的 `Comment` 类型导入
- 删除未使用的 `getFileIcon` 函数

### 4. 增强 querySelector 的类型安全性

**原代码：**
```typescript
const inputElement = document.querySelector(`.post-card[data-message-id="${props.message.id}"] .comment-input`) as HTMLInputElement;
```

**修复后：**
```typescript
const inputElement = document.querySelector(`.post-card[data-message-id="${props.message.id}"] .comment-input`) as HTMLInputElement | null;
```

## 修改影响

这些修改提高了代码的类型安全性，避免了潜在的运行时错误，同时清理了未使用的代码，使项目更加整洁。

## 验证方法

1. 确保项目能够正常编译，无 TypeScript 错误
2. 测试图片加载失败时的错误处理功能
3. 测试评论分页功能中的页码选择器
4. 测试评论提交功能
