<script setup lang="ts">
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
          {{ props.isDarkMode ? '浅色模式' : '深色模式' }}
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  background-color: var(--card-background);
  box-shadow: var(--shadow-light);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
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
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.nav {
  display: flex;
  gap: 1rem;
}

.refresh-btn, .mode-toggle-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: var(--shadow-light);
}

.refresh-btn {
  background: var(--gradient-primary);
  color: white;
}

.refresh-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.mode-toggle-btn {
  background: var(--gradient-secondary);
  color: white;
}

.mode-toggle-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
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
  background-color: var(--card-background);
  box-shadow: var(--shadow-medium);
}
</style>