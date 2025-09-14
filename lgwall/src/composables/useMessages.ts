import { ref } from 'vue';
import type { Message, MessagesState } from '../types';

/**
 * 帖子数据管理的组合式函数
 * 支持无限滚动加载模式
 * 负责获取、管理和处理帖子数据
 */
export function useMessages(): MessagesState {
  const messages = ref<Message[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const pageSize = ref(15);
  const totalMessages = ref(0);
  const hasMore = ref(true); // 是否还有更多数据

  /**
   * 获取帖子数据（支持追加模式）
   * @param page 页码，默认为1
   * @param append 是否为追加模式，默认为false
   */
  async function fetchMessages(page = 1, append = false): Promise<void> {
    try {
      if (!append) {
        loading.value = true;
      }
      error.value = null;
      
      // 首先获取分页大小
      const pageSizeResponse = await fetch("/api/get_page_size");
      if (pageSizeResponse.ok) {
        const pageSizeData = await pageSizeResponse.json();
        pageSize.value = pageSizeData.page_size || 10;
      }
      
      // 调用服务器API获取帖子数据
      const start = (page * pageSize.value) - pageSize.value; // 从0开始
      const end = page * pageSize.value; // 到pageSize结束
      const response = await fetch(`/api/get_messages?start=${start}&end=${end}`);
      
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态码: ${response.status}`);
      }
      
      const data = await response.json();
      const newMessages = data.data || data; // 根据API返回格式处理数据
      
      if (append) {
        // 追加模式：将新数据添加到现有数据后面
        messages.value.push(...newMessages);
      } else {
        // 重置模式：替换现有数据
        messages.value = newMessages;
      }
      
      totalMessages.value = data.total || 0;
      currentPage.value = page;
      
      // 检查是否还有更多数据
      hasMore.value = messages.value.length < totalMessages.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取数据失败";
      console.error("获取帖子数据失败:", err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 加载更多数据（用于无限滚动）
   */
  async function loadMore(): Promise<void> {
    if (loading.value || !hasMore.value) return;
    
    const nextPage = currentPage.value + 1;
    await fetchMessages(nextPage, true);
  }

  /**
   * 重置数据并重新加载
   */
  async function resetAndLoad(): Promise<void> {
    messages.value = [];
    currentPage.value = 1;
    hasMore.value = true;
    await fetchMessages(1, false);
  }

  return {
    messages,
    loading,
    error,
    currentPage,
    pageSize,
    totalMessages,
    hasMore,
    fetchMessages,
    loadMore,
    resetAndLoad
  };
}