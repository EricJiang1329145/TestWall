<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import ThumbUpIcon from 'vue-material-design-icons/ThumbUp.vue'
import CommentIcon from 'vue-material-design-icons/Comment.vue'
import ShareIcon from 'vue-material-design-icons/Share.vue'

// 定义响应式数据
const messages = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showCommentInput = ref<{[key: number]: boolean}>({});
const currentPage = ref(1);
const pageSize = ref(15);
const totalMessages = ref(0);
const isDarkMode = ref(false);

// 获取帖子数据的函数
async function fetchMessages(page = 1) {
  try {
    loading.value = true;
    error.value = null;
    
    // 首先获取分页大小
    const pageSizeResponse = await fetch("/api/get_page_size");
    if (pageSizeResponse.ok) {
      const pageSizeData = await pageSizeResponse.json();
      pageSize.value = pageSizeData.page_size || 10;
    }
    
    // 调用服务器API获取帖子数据（通过代理解决CORS问题）
    const start = page * pageSize.value;
    const end = start + pageSize.value;
    const response = await fetch(`/api/get_messages?start=${start}&end=${end}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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

// 组件挂载时获取数据
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
  fetchMessages();
});

// 监听深色模式变化
watch(isDarkMode, (newVal) => {
  localStorage.setItem('darkMode', newVal.toString());
  applyDarkMode();
});

// 应用深色模式
function applyDarkMode() {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// 切换深色模式
function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
}

// 格式化时间显示
function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleString('zh-CN');
}

// 切换评论输入框显示状态
function toggleCommentInput(messageId: number) {
  showCommentInput.value[messageId] = !showCommentInput.value[messageId];
}

// 提交评论
async function submitComment(messageId: number) {
  // 获取评论输入框的值
  const inputElement = document.querySelector(`.post-card[data-message-id="${messageId}"] .comment-input`) as HTMLInputElement;
  const commentText = inputElement?.value;
  
  if (!commentText) {
    console.log("评论内容不能为空");
    return;
  }
  
  try {
    // 构造请求数据
    const formData = new FormData();
    formData.append('text', commentText);
    
    // 发送评论到服务器
    const response = await fetch(`/wall/comment/${messageId}`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`评论提交成功:`, result.comment);
      // 清空输入框
      if (inputElement) {
        inputElement.value = '';
      }
      
      // 更新UI显示新评论
      const messageIndex = messages.value.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        // 如果帖子还没有评论数组，创建一个空数组
        if (!messages.value[messageIndex].comments) {
          messages.value[messageIndex].comments = [];
        }
        // 将新评论添加到帖子的评论数组中
        // 转换后端返回的评论数据结构以匹配前端期望的结构
        const newComment = {
          id: result.comment.id,
          text: result.comment.text,
          timestamp: result.comment.timestamp,
          user: "匿名用户"  // 后端不返回用户信息，我们使用默认值
        };
        messages.value[messageIndex].comments.push(newComment);
      }
    } else {
      console.error(`评论提交失败:`, result.error);
    }
  } catch (error) {
    console.error(`提交评论到帖子 ${messageId} 失败:`, error);
  } finally {
    // 提交后隐藏输入框
    showCommentInput.value[messageId] = false;
  }
}
</script>

<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="container">
        <h1 class="logo">校园墙</h1>
        <nav class="nav">
          <button @click="fetchMessages" class="refresh-btn">刷新</button>
          <button @click="toggleDarkMode" class="mock-btn">
            {{ isDarkMode ? '浅色模式' : '深色模式' }}
          </button>
        </nav>
      </div>
    </header>

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
          
          <div v-else class="posts-container">
            <div 
              v-for="message in messages" 
              :key="message.id" 
              class="post-card"
              :data-message-id="message.id"
            >
              <div class="post-header">
                <div class="user-info">
                  <div class="avatar">匿</div>
                  <div class="user-details">
                    <span class="username">匿名用户</span>
                    <span class="post-time">{{ formatTime(message.timestamp) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="post-content">
                <p class="post-text">{{ message.text }}</p>
                
                <!-- 文件附件 -->
                <div v-if="message.files && message.files.length > 0" class="post-attachments">
                  <div 
                    v-for="(file, index) in message.files" 
                    :key="index" 
                    class="attachment"
                  >
                    <img 
                      v-if="file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')" 
                      :src="'/uploads/' + file" 
                      :alt="file"
                      class="attachment-image"
                    >
                    <div v-else class="attachment-file">
                      <span class="file-icon">📄</span>
                      <span class="file-name">{{ file }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="post-footer">
                <button class="action-btn like-btn">
                  <ThumbUpIcon class="icon" :size="20" />
                  <span class="count">{{ message.likes || 0 }}</span>
                </button>
                <button class="action-btn comment-btn" @click="toggleCommentInput(message.id)">
                  <CommentIcon class="icon" :size="20" />
                  <span class="count">{{ (message.comments && message.comments.length) || 0 }}</span>
                </button>
                <button class="action-btn share-btn">
                  <ShareIcon class="icon" :size="20" />
                  <span>分享</span>
                </button>
              </div>
              
              <!-- 评论区域 -->
              <div class="comments-section" v-if="message.comments && message.comments.length > 0">
                <div 
                  v-for="comment in message.comments" 
                  :key="comment.id" 
                  class="comment-item"
                >
                  <div class="comment-header">
                    <div class="comment-user-info">
                      <div class="comment-avatar">匿</div>
                      <div class="comment-user-details">
                        <span class="comment-username">{{ comment.user || '匿名用户' }}</span>
                        <span class="comment-time">{{ formatTime(comment.timestamp) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="comment-content">
                    <p class="comment-text">{{ comment.text }}</p>
                  </div>
                </div>
              </div>
              
              <!-- 添加评论输入框（只在点击评论按钮时显示） -->
              <div class="add-comment-section" v-if="showCommentInput[message.id]">
                <div class="comment-input-container">
                  <div class="comment-avatar">匿</div>
                  <input 
                    type="text" 
                    placeholder="添加评论..." 
                    class="comment-input"
                  >
                  <button class="submit-comment-btn" @click="submitComment(message.id)">发送</button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页控件 -->
          <div class="pagination" v-if="totalMessages > pageSize">
            <button 
              @click="fetchMessages(currentPage - 1)" 
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              上一页
            </button>
            <span class="page-info">
              第 {{ currentPage }} 页，共 {{ Math.ceil(totalMessages / pageSize) }} 页
            </span>
            <button 
              @click="fetchMessages(currentPage + 1)" 
              :disabled="currentPage * pageSize >= totalMessages"
              class="pagination-btn"
            >
              下一页
            </button>
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

/* 头部样式 */
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

.refresh-btn, .mock-btn {
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

.mock-btn {
  background-color: #4caf50;
  color: white;
}

.mock-btn:hover {
  background-color: #388e3c;
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

/* 帖子卡片 */
.post-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.post-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #1976d2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  color: #333;
}

.post-time {
  font-size: 0.8rem;
  color: #777;
}

.post-content {
  padding: 1rem;
}

.post-text {
  line-height: 1.6;
  color: #333;
  margin: 0 0 1rem 0;
  white-space: pre-wrap;
}

.post-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.attachment {
  max-width: 100%;
}

.attachment-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  object-fit: cover;
}

.attachment-file {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.file-icon {
  font-size: 1.2rem;
}

.file-name {
  font-size: 0.9rem;
  color: #333;
}

.post-footer {
  display: flex;
  padding: 1rem;
  border-top: 1px solid #eee;
  background-color: #fafafa;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #e0e0e0;
}

.like-btn {
  margin-right: auto;
}

.like-btn:hover {
  color: #e91e63;
}

.comment-btn:hover {
  color: #1976d2;
}

.share-btn:hover {
  color: #4caf50;
}

.icon {
  font-size: 1.1rem;
  vertical-align: middle;
}

/* 调整图标按钮的对齐方式 */
.action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.count {
  font-weight: 500;
}

/* 评论区域 */
.comments-section {
  border-top: 1px solid #eee;
  padding: 1rem;
  background-color: #fafafa;
}

.comment-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.comment-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #9c27b0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.comment-user-details {
  display: flex;
  flex-direction: column;
}

.comment-username {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.comment-time {
  font-size: 0.75rem;
  color: #777;
}

.comment-content {
  margin-left: 2.5rem;
}

.comment-text {
  line-height: 1.5;
  color: #444;
  margin: 0;
  font-size: 0.95rem;
}

/* 添加评论区域 */
.add-comment-section {
  border-top: 1px solid #eee;
  padding: 1rem;
  background-color: #fff;
}

.comment-input-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.comment-input-container .comment-avatar {
  flex-shrink: 0;
}

.comment-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.comment-input:focus {
  border-color: #1976d2;
}

.submit-comment-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #1976d2;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.submit-comment-btn:hover {
  background-color: #1565c0;
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
  .header .container {
    padding: 1rem;
  }
  
  .logo {
    font-size: 1.25rem;
  }
  
  .nav {
    gap: 0.5rem;
  }
  
  .refresh-btn, .mock-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .main-content {
    padding: 1rem 0;
  }
  
  .post-card {
    margin: 0 1rem;
  }
  
  .post-header, .post-content, .post-footer {
    padding: 0.75rem;
  }
  
  .user-info {
    gap: 0.5rem;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  
  .username {
    font-size: 0.9rem;
  }
  
  .post-time {
    font-size: 0.75rem;
  }
  
  .post-text {
    font-size: 0.95rem;
  }
  
  .action-btn {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }
  
  .comments-section, .add-comment-section {
    padding: 0.75rem;
  }
  
  .comment-content {
    margin-left: 2rem;
  }
  
  .comment-input-container {
    gap: 0.5rem;
  }
  
  .comment-avatar {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
  
  .comment-input {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  
  .submit-comment-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
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

/* 深色模式样式 */
.dark {
  color: #f6f6f6;
  background-color: #2f2f2f;
}

.dark .header {
  background-color: #1e1e1e;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.dark .post-card {
  background-color: #2a2a2a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark .post-header, 
.dark .post-footer, 
.dark .comments-section, 
.dark .add-comment-section {
  border-color: #444;
}

.dark .post-footer, 
.dark .comments-section {
  background-color: #252525;
}

.dark .add-comment-section {
  background-color: #2a2a2a;
}

.dark .username, 
.dark .comment-username {
  color: #f6f6f6;
}

.dark .post-text, 
.dark .comment-text {
  color: #e0e0e0;
}

.dark .attachment-file {
  background-color: #3a3a3a;
}

.dark .file-name {
  color: #e0e0e0;
}

.dark .error {
  background-color: #331a1a;
  color: #ff6b6b;
}

.dark .comment-input {
  background-color: #3a3a3a;
  border-color: #555;
  color: #f6f6f6;
}

.dark .main-content {
  background-color: #2a2a2a;
}

.dark .data-source {
  color: #ccc;
}

.dark .no-data {
  color: #ccc;
}

.dark .footer {
  background-color: #1e1e1e;
}
</style>