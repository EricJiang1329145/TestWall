<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

// 定义组件属性
const props = defineProps({
  isDarkMode: {
    type: Boolean,
    required: true
  }
});

// 定义组件事件
const emit = defineEmits(['refresh', 'toggleDarkMode']);

/**
 * 触发刷新事件
 */
function handleRefresh(): void {
  emit('refresh');
}

/**
 * 触发切换深色模式事件
 */
function handleToggleDarkMode(): void {
  emit('toggleDarkMode');
}
</script>

<template>
  <header class="header">
    <div class="container">
      <h1 class="logo">校园墙</h1>
      <nav class="nav">
        <button @click="handleRefresh" class="refresh-btn">刷新</button>
        <button @click="handleToggleDarkMode" class="mode-toggle-btn">
          {{ isDarkMode ? '浅色模式' : '深色模式' }}
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1976d2;
  margin: 0;
}

.nav {
  display: flex;
  gap: 1rem;
}

.refresh-btn, .mode-toggle-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.refresh-btn {
  background-color: #1976d2;
  color: white;
}

.refresh-btn:hover {
  background-color: #1565c0;
}

.mode-toggle-btn {
  background-color: #4caf50;
  color: white;
}

.mode-toggle-btn:hover {
  background-color: #388e3c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header .container {
    padding: 1rem;
  }
  
  .logo {
    font-size: 1.25rem;
  }
  
  .nav {
    gap: 0.5rem;
  }
  
  .refresh-btn, .mode-toggle-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}

/* 深色模式样式 */
.dark .header {
  background-color: #1e1e1e;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>