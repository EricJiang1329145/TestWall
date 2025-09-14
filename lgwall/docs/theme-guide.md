# 紫色主题设计指南

## 概述
本项目实现了完整的紫色主题系统，支持浅色和深色模式的自动切换，通过CSS变量系统统一管理颜色、阴影、圆角等样式属性。

## 主题色变量系统

### 基础颜色变量
```css
:root {
  /* 主色调 */
  --primary-color: #7c3aed;
  --primary-hover: #6d28d9;
  --primary-light: #a855f7;
  --primary-dark: #5b21b6;
  
  /* 辅助色调 */
  --secondary-color: #8b5cf6;
  --secondary-hover: #7c3aed;
  --accent-color: #c084fc;
  
  /* 背景色 */
  --background-color: #fafafa;
  --surface-color: #f3f4f6;
  --card-background: #ffffff;
  
  /* 文本色 */
  --text-primary: #1f2937;
  --text-secondary: #4b5563;
  --text-muted: #6b7280;
  
  /* 边框和阴影 */
  --border-color: #e5e7eb;
  --shadow-light: 0 1px 3px rgba(124, 58, 237, 0.1);
  --shadow-medium: 0 4px 6px rgba(124, 58, 237, 0.1);
  --shadow-heavy: 0 10px 15px rgba(124, 58, 237, 0.1);
  
  /* 渐变背景 */
  --gradient-primary: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  --gradient-secondary: linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%);
}
```

### 深色模式变量
```css
.dark:root {
  --primary-color: #8b5cf6;
  --primary-hover: #7c3aed;
  --primary-light: #a855f7;
  --primary-dark: #6d28d9;
  
  --secondary-color: #7c3aed;
  --secondary-hover: #6d28d9;
  --accent-color: #a855f7;
  
  --background-color: #0f172a;
  --surface-color: #1e293b;
  --card-background: #1e293b;
  
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  
  --border-color: #334155;
  --shadow-light: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-medium: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-heavy: 0 10px 15px rgba(0, 0, 0, 0.3);
  
  --gradient-primary: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  --gradient-secondary: linear-gradient(135deg, #7c3aed 0%, #c084fc 100%);
}
```

## 组件适配

### App.vue 主要修改
- 使用 `--surface-color` 作为主要内容背景
- 使用 `--text-muted` 作为提示文字颜色
- 使用 `--gradient-primary` 作为页脚渐变背景
- 按钮使用 `--primary-color` 和悬停效果

### Header.vue 主要修改
- 使用 `--card-background` 作为头部背景
- Logo 使用 `--gradient-primary` 渐变文字效果
- 按钮使用渐变背景和悬停动画

### PostCard.vue 主要修改
- 卡片使用 `--card-background` 和 `--shadow-light`
- 头像使用 `--gradient-primary` 渐变背景
- 按钮和交互元素统一使用紫色主题
- 模态框使用 `--card-background` 和 `--shadow-heavy`

### Pagination.vue 主要修改
- 按钮使用 `--card-background` 和 `--border-color`
- 激活状态使用 `--gradient-primary`
- 悬停效果包含动画和阴影变化

## 使用方法

### 在组件中使用主题变量
```css
.my-component {
  background-color: var(--card-background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-light);
}

.my-button {
  background: var(--gradient-primary);
  color: white;
  border: none;
  transition: all 0.3s ease;
}

.my-button:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}
```

### 深色模式适配
深色模式会自动应用 `.dark` 类下的变量，无需额外编写深色模式样式。

## 设计特点

1. **一致性**：所有组件使用相同的颜色变量，确保视觉统一
2. **可维护性**：通过修改变量即可全局调整主题色
3. **渐变效果**：使用渐变背景增强视觉层次
4. **动画过渡**：添加平滑的过渡效果提升用户体验
5. **深色模式**：完美支持深色模式，自动适配所有颜色
6. **布局优化**：评论区域名称和日期移至头像右侧，提升阅读体验

## 扩展建议

- 可以添加更多颜色变量支持更多场景
- 可以考虑添加主题切换动画
- 可以支持自定义主题色功能
- 评论区域布局可进一步定制间距和对齐方式