import { ref } from 'vue';
import type { Message, MessagesState } from '../types';

/**
 * 帖子数据管理的组合式函数
 * 负责获取、管理和处理帖子数据
 */
export function useMessages(): MessagesState {
  const messages = ref<Message[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const pageSize = ref(15);
  const totalMessages = ref(0);

  /**
   * 获取帖子数据
   * @param page 页码，默认为1
   */
  async function fetchMessages(page = 1): Promise<void> {
    try {
      loading.value = true;
      error.value = null;
      
      // 首先获取分页大小
      const pageSizeResponse = await fetch("/api/get_page_size");
      if (pageSizeResponse.ok) {
        const pageSizeData = await pageSizeResponse.json();
        pageSize.value = pageSizeData.page_size || 10;
      }
      
      // 调用服务器API获取帖子数据
      const start = page * pageSize.value;
      const end = start + pageSize.value;
      const response = await fetch(`/api/get_messages?start=${start}&end=${end}`);
      
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态码: ${response.status}`);
      }
      
      const data = await response.json();
      messages.value = data.data || data; // 根据API返回格式处理数据
      totalMessages.value = data.total || 0;
      currentPage.value = page;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取数据失败";
      console.error("获取帖子数据失败:", err);
    } finally {
      loading.value = false;
    }
  }

  return {
    messages,
    loading,
    error,
    currentPage,
    pageSize,
    totalMessages,
    fetchMessages
  };
}