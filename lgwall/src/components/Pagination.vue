<script setup lang="ts">
import { computed } from 'vue';

// 定义组件属性
const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    required: true
  },
  totalMessages: {
    type: Number,
    required: true
  }
});

// 定义组件事件
const emit = defineEmits(['pageChange']);

/**
 * 计算总页数
 */
const totalPages = computed(() => {
  return Math.ceil(props.totalMessages / props.pageSize);
});

/**
 * 处理页码变化
 * @param page 目标页码
 */
function handlePageChange(page: number): void {
  if (page < 1 || page > totalPages.value) {
    return;
  }
  emit('pageChange', page);
}

/**
 * 生成页码数组
 */
const pageNumbers = computed(() => {
  const pages: number[] = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, props.currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return pages;
});
</script>

<template>
  <div class="pagination" v-if="totalPages > 1">
    <!-- 上一页按钮 -->
    <button 
      @click="handlePageChange(currentPage - 1)" 
      :disabled="currentPage === 1"
      class="pagination-btn pagination-prev"
      aria-label="上一页"
    >
      &laquo; 上一页
    </button>
    
    <!-- 第一页 -->
    <button 
      v-if="pageNumbers[0] > 1"
      @click="handlePageChange(1)"
      class="pagination-btn"
      :class="{ active: currentPage === 1 }"
      aria-label="第1页"
    >
      1
    </button>
    
    <!-- 省略号 -->
    <span v-if="pageNumbers[0] > 2" class="pagination-ellipsis">...</span>
    
    <!-- 页码按钮 -->
    <button 
      v-for="page in pageNumbers" 
      :key="page"
      @click="handlePageChange(page)"
      class="pagination-btn"
      :class="{ active: currentPage === page }"
      :aria-label="`第${page}页`"
      :aria-current="currentPage === page ? 'page' : undefined"
    >
      {{ page }}
    </button>
    
    <!-- 省略号 -->
    <span v-if="pageNumbers[pageNumbers.length - 1] < totalPages - 1" class="pagination-ellipsis">...</span>
    
    <!-- 最后一页 -->
    <button 
      v-if="pageNumbers[pageNumbers.length - 1] < totalPages"
      @click="handlePageChange(totalPages)"
      class="pagination-btn"
      :class="{ active: currentPage === totalPages }"
      aria-label="最后一页"
    >
      {{ totalPages }}
    </button>
    
    <!-- 下一页按钮 -->
    <button 
      @click="handlePageChange(currentPage + 1)" 
      :disabled="currentPage === totalPages"
      class="pagination-btn pagination-next"
      aria-label="下一页"
    >
      下一页 &raquo;
    </button>
    
    <!-- 页面信息 -->
    <span class="page-info">
      第 {{ currentPage }} 页，共 {{ totalPages }} 页
    </span>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  min-width: 44px;
  text-align: center;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #1976d2;
  color: white;
  border-color: #1976d2;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.active {
  background-color: #1976d2;
  color: white;
  border-color: #1976d2;
  font-weight: 600;
}

.pagination-prev,
.pagination-next {
  min-width: 80px;
}

.pagination-ellipsis {
  padding: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.page-info {
  margin-left: 1rem;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pagination {
    gap: 0.25rem;
    margin: 1.5rem 0;
  }
  
  .pagination-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    min-width: 36px;
  }
  
  .pagination-prev,
  .pagination-next {
    min-width: 70px;
  }
  
  .page-info {
    margin-left: 0.5rem;
    font-size: 0.8rem;
  }
}

/* 深色模式样式 */
.dark .pagination-btn {
  background-color: #2a2a2a;
  border-color: #444;
  color: #f6f6f6;
}

.dark .pagination-btn:hover:not(:disabled) {
  background-color: #1976d2;
  color: white;
  border-color: #1976d2;
}

.dark .pagination-btn.active {
  background-color: #1976d2;
  color: white;
  border-color: #1976d2;
}

.dark .pagination-ellipsis {
  color: #ccc;
}

.dark .page-info {
  color: #ccc;
}
</style>