import { ref, watch, onMounted } from 'vue';
import type { DarkModeState } from '../types';

/**
 * 深色模式管理的组合式函数
 * 负责处理深色模式的切换和持久化
 */
export function useDarkMode(): DarkModeState {
  const isDarkMode = ref(false);

  /**
   * 应用深色模式样式
   */
  function applyDarkMode(): void {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  /**
   * 切换深色模式
   */
  function toggleDarkMode(): void {
    isDarkMode.value = !isDarkMode.value;
  }

  // 组件挂载时初始化深色模式
  onMounted(() => {
    // 检查本地存储中是否有深色模式设置
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      isDarkMode.value = savedDarkMode === 'true';
    } else {
      // 如果没有保存的设置，则根据系统偏好设置
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyDarkMode();
  });

  // 监听深色模式变化并保存到本地存储
  watch(isDarkMode, (newVal) => {
    localStorage.setItem('darkMode', newVal.toString());
    applyDarkMode();
  });

  return {
    isDarkMode,
    toggleDarkMode
  };
}