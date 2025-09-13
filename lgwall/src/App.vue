<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import Header from './components/Header.vue';
import PostCard from './components/PostCard.vue';
import Pagination from './components/Pagination.vue';
import { useMessages } from './composables/useMessages';
import { useDarkMode } from './composables/useDarkMode';
import { useComments } from './composables/useComments';
import type { Message, Comment } from './types';

// 使用组合式函数管理状态
const { messages, loading, error, currentPage, pageSize, totalMessages, fetchMessages } = useMessages();
const { isDarkMode, toggleDarkMode } = useDarkMode();
const { showCommentInput, toggleCommentInput, submitComment } = useComments();

// 响应式布局状态
const screenWidth = ref(window.innerWidth);

/**
 * 检测屏幕宽度并更新状态
 */
function updateScreenWidth(): void {
  screenWidth.value = window.innerWidth;
}

/**
 * 判断布局模式
 * - 单列: < 700px
 * - 两列: 700px ~ 1080px
 * - 三列: >= 1080px
 */
const layoutMode = computed(() => {
  if (screenWidth.value >= 1080) {
    return 'three-columns'; // 三列布局
  } else if (screenWidth.value >= 700) {
    return 'two-columns';   // 两列布局
  } else {
    return 'single-column';  // 单列布局
  }
});

/**
 * 将帖子列表分成相应列数
 */
const messagesInColumns = computed(() => {
  const totalMessages = messages.value.length;
  
  if (layoutMode.value === 'single-column' || totalMessages <= 1) {
    return [messages.value]; // 单列布局
  }
  
  if (layoutMode.value === 'two-columns') {
    const midIndex = Math.ceil(totalMessages / 2);
    return [
      messages.value.slice(0, midIndex),
      messages.value.slice(midIndex)
    ];
  }
  
  // 三列布局
  const colSize = Math.ceil(totalMessages / 3);
  return [
    messages.value.slice(0, colSize),
    messages.value.slice(colSize, colSize * 2),
    messages.value.slice(colSize * 2)
  ];
});

// 组件挂载时获取数据
onMounted(() => {
  fetchMessages();
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', updateScreenWidth);
});

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth);
});

/**
 * 处理评论提交
 * @param messageId 帖子ID
 * @param commentText 评论内容
 */
async function handleSubmitComment(messageId: number, commentText: string): Promise<void> {
  const newComment = await submitComment(messageId, commentText);
  
  if (newComment) {
    // 更新UI显示新评论
    const messageIndex = messages.value.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1) {
      // 如果帖子还没有评论数组，创建一个空数组
      if (!messages.value[messageIndex].comments) {
        messages.value[messageIndex].comments = [];
      }
      // 将新评论添加到帖子的评论数组中
      messages.value[messageIndex].comments.push(newComment);
    }
  }
}

/**
 * 处理页码变化
 * @param page 目标页码
 */
function handlePageChange(page: number): void {
  fetchMessages(page);
}
</script>

<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <Header 
      :is-dark-mode="isDarkMode"
      @refresh="fetchMessages"
      @toggle-dark-mode="toggleDarkMode"
    />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">
        <!-- 数据来源信息 -->
        <div class="data-source">
          数据来源: 真实服务器
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>正在加载数据...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error">
          <p>错误: {{ error }}</p>
          <div class="error-actions">
            <button @click="fetchMessages">重新加载</button>
          </div>
        </div>

        <!-- 帖子列表 -->
        <div v-else class="messages-list">
          <div v-if="messages.length === 0" class="no-data">
            <p>暂无帖子数据</p>
          </div>
          
          <div v-else class="posts-container" :class="layoutMode">
            <!-- 单列布局 -->
            <template v-if="layoutMode === 'single-column'">
              <PostCard 
                v-for="message in messages" 
                :key="message.id" 
                :message="message"
                @toggle-comment="toggleCommentInput"
                @submit-comment="handleSubmitComment"
              />
            </template>
            
            <!-- 多列布局 -->
            <template v-else>
              <div 
                v-for="(columnMessages, index) in messagesInColumns" 
                :key="index" 
                class="column"
              >
                <PostCard 
                  v-for="message in columnMessages" 
                  :key="message.id" 
                  :message="message"
                  @toggle-comment="toggleCommentInput"
                  @submit-comment="handleSubmitComment"
                />
              </div>
            </template>
          </div>
          
          <!-- 分页控件 -->
          <Pagination 
            :current-page="currentPage"
            :page-size="pageSize"
            :total-messages="totalMessages"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </main>

    <!-- 底部 -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 校园墙. 保留所有权利.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  background-color: #f5f5f5;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.data-source {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #666;
  font-size: 0.9rem;
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error {
  background-color: #ffebee;
  color: #c62828;
  padding: 1.5rem;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 1.5rem;
}

.error-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.error-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #c62828;
  color: white;
}

/* 帖子列表 */
.no-data {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.posts-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 多列布局样式 */
.posts-container.two-columns,
.posts-container.three-columns {
  flex-direction: row;
  gap: 2rem;
  align-items: flex-start;
}

.posts-container.two-columns .column,
.posts-container.three-columns .column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0; /* 防止flex项目溢出 */
}

/* 三列布局时调整间距 */
.posts-container.three-columns {
  gap: 1.5rem;
}

.posts-container.three-columns .column {
  max-width: calc(33.333% - 1rem);
}

/* 底部 */
.footer {
  background-color: #333;
  color: #fff;
  padding: 1.5rem 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem 0;
  }
}

/* 深色模式样式 */
.dark .main-content {
  background-color: #2a2a2a;
}

.dark .data-source {
  color: #ccc;
}

.dark .error {
  background-color: #331a1a;
  color: #ff6b6b;
}
</style>

<style>
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #0f0f0f;
  background-color: #ffffff;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}
</style>