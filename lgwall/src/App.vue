<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import Header from './components/Header.vue';
import PostCard from './components/PostCard.vue';
import { useMessages } from './composables/useMessages';
import { useDarkMode } from './composables/useDarkMode';
import { useComments } from './composables/useComments';
import type { Message, Comment } from './types';

// 使用组合式函数管理状态
const { messages, loading, error, currentPage, pageSize, totalMessages, hasMore, fetchMessages, loadMore, resetAndLoad } = useMessages();
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
 * 将帖子列表按时间顺序进行类似小红书的排列
 * 实现从左到右、从上到下的时间顺序排列，同一行或相邻行时间尽可能接近
 * 同时采用智能高度平衡算法，确保各列高度均匀分布
 */
const messagesInColumns = computed(() => {
  const totalMessages = messages.value.length;
  
  if (layoutMode.value === 'single-column' || totalMessages <= 1) {
    return [messages.value]; // 单列布局直接返回
  }
  
  // 按时间倒序排列（最新的在前面）
  const sortedMessages = [...messages.value].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  const columnCount = layoutMode.value === 'two-columns' ? 2 : 3;
  const columns: Message[][] = Array.from({ length: columnCount }, () => []);
  
  // 智能高度平衡算法：将帖子分配到当前高度最小的列
  // 使用虚拟高度估算（基于内容长度、图片数量、评论数量等）
  const columnHeights = Array(columnCount).fill(0);
  
  sortedMessages.forEach((message) => {
    // 估算帖子高度（单位：虚拟高度单位）
    const estimatedHeight = estimatePostHeight(message);
    
    // 找到当前高度最小的列
    const minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights));
    
    // 将帖子分配到该列并更新列高度
    columns[minHeightIndex].push(message);
    columnHeights[minHeightIndex] += estimatedHeight;
  });
  
  return columns;
});

/**
 * 估算帖子高度（基于内容长度、附件数量、评论数量等）
 * 返回虚拟高度单位，用于平衡各列高度
 */
function estimatePostHeight(message: Message): number {
  let height = 0;
  
  // 基础高度（卡片边框、内边距等）
  height += 20;
  
  // 文本内容高度估算（每50个字符增加1单位高度）
  if (message.text) {
    height += Math.ceil(message.text.length / 50);
  }
  
  // 图片附件高度（每张图片增加15-25单位高度）
  if (message.files && message.files.length > 0) {
    const imageCount = message.files.filter(file => 
      /.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file)
    ).length;
    height += imageCount * 20;
  }
  
  // 视频附件高度（每个视频增加25单位高度）
  if (message.files && message.files.length > 0) {
    const videoCount = message.files.filter(file => 
      /.(mp4|avi|mov|wmv|flv|webm)$/i.test(file)
    ).length;
    height += videoCount * 25;
  }
  
  // 评论数量影响高度（每5条评论增加1单位高度）
  if (message.comments && message.comments.length > 0) {
    height += Math.ceil(message.comments.length / 5);
  }
  
  // 确保最小高度
  return Math.max(height, 30);
}

// 组件挂载时获取数据
onMounted(() => {
  resetAndLoad();
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', updateScreenWidth);
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll);
});

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth);
  window.removeEventListener('scroll', handleScroll);
  
  // 清除定时器
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
});

/**
 * 处理滚动事件，实现无限滚动加载
 * 添加防抖机制避免频繁触发
 */
let scrollTimeout: number | null = null;

function handleScroll(): void {
  // 使用防抖避免频繁触发
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  
  scrollTimeout = window.setTimeout(() => {
    // 检查是否滚动到底部附近
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    
    // 确保有足够的内容才触发加载，避免初始状态就触发
    const hasEnoughContent = scrollHeight > clientHeight + 200;
    
    // 当滚动到底部100px范围内且有足够内容时触发加载
    if (scrollTop + clientHeight >= scrollHeight - 100 && hasEnoughContent) {
      loadMore();
    }
  }, 200); // 200ms防抖延迟
}

/**
 * 处理评论提交
 * @param messageId 帖子ID
 * @param commentText 评论内容
 */
async function handleSubmitComment(messageId: number, commentText: string): Promise<void> {
  const newComment = await submitComment(messageId, commentText);
  
  if (newComment) {
    // 更新UI显示新评论
    const messageIndex = messages.value.findIndex((msg: Message) => msg.id === messageId);
    if (messageIndex !== -1) {
      // 如果帖子还没有评论数组，创建一个空数组
      if (!messages.value[messageIndex].comments) {
        messages.value[messageIndex].comments = [];
      }
      // 将新评论添加到帖子的评论数组中
      messages.value[messageIndex].comments!.push(newComment);
    }
  }
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
          
          <!-- 加载更多提示 -->
          <div v-if="loading && messages.length > 0" class="load-more">
            <div class="loading-spinner">
              <div class="spinner"></div>
              <p>正在加载更多...</p>
            </div>
          </div>
          
          <!-- 加载更多按钮（当有更多数据但未触发滚动时） -->
          <div v-if="hasMore && !loading && messages.length > 0" class="load-more">
            <button @click="loadMore" class="load-more-btn">
              加载更多
            </button>
          </div>
          
          <!-- 已加载全部提示 -->
          <div v-if="!hasMore && messages.length > 0" class="all-loaded">
            <p>已加载全部内容</p>
          </div>
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

/* 无限滚动加载样式 */
.load-more {
  text-align: center;
  padding: 2rem 0;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner .spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.load-more-btn {
  padding: 0.75rem 1.5rem;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.load-more-btn:hover {
  background-color: #1565c0;
}

.load-more-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.all-loaded {
  text-align: center;
  padding: 2rem 0;
  color: #666;
  font-size: 0.9rem;
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

/* 全局样式重置，去除默认边距和滚动条 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden; /* 隐藏水平滚动条 */
  background-color: #f5f5f5; /* 设置与内容区域相同的背景色 */
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5; /* 确保应用容器背景色一致 */
}

/* 去除body元素的默认滚动条 */
body::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

body {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>