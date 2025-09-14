# Header.vue TypeScript警告修复

## 问题描述

在Header.vue组件中存在一个TypeScript警告：
```
已声明"props"，但从未读取其值。
```

## 问题分析

经过分析发现，问题的原因是在模板中直接使用了`isDarkMode`而不是`props.isDarkMode`。虽然在Vue 3的`<script setup>`中直接使用props属性是正确的做法，但TypeScript可能没有正确识别这种用法，导致误报警告。

## 修复详情

### 1. 明确使用props对象访问属性

**修复前**：
```vue
<button @click="handleToggleDarkMode" class="mode-toggle-btn">
  {{ isDarkMode ? '浅色模式' : '深色模式' }}
</button>
```

**修复后**：
```vue
<button @click="handleToggleDarkMode" class="mode-toggle-btn">
  {{ props.isDarkMode ? '浅色模式' : '深色模式' }}
</button>
```

## 验证

修复后重新编译项目，确认TypeScript警告已消失。