<script setup lang="ts">
import { ref } from 'vue';
import ThumbUpIcon from 'vue-material-design-icons/ThumbUp.vue';
import CommentIcon from 'vue-material-design-icons/Comment.vue';
import ShareIcon from 'vue-material-design-icons/Share.vue';
import type { Message, Comment } from '../types';

// 定义组件属性
const props = defineProps<{
  message: Message;
}>();

// 定义组件事件
const emit = defineEmits(['toggleComment', 'submitComment']);

const showCommentInput = ref(false);

/**
 * 格式化时间显示
 * @param timestamp 时间戳字符串
 */
function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('zh-CN');
}

/**
 * 切换评论输入框显示状态
 */
function handleToggleComment(): void {
  showCommentInput.value = !showCommentInput.value;
  emit('toggleComment', props.message.id);
}

/**
 * 提交评论
 */
function handleSubmitComment(): void {
  const inputElement = document.querySelector(`.post-card[data-message-id="${props.message.id}"] .comment-input`) as HTMLInputElement;
  const commentText = inputElement?.value;
  
  if (!commentText) {
    console.log("评论内容不能为空");
    return;
  }
  
  emit('submitComment', props.message.id, commentText);
  
  // 清空输入框
  if (inputElement) {
    inputElement.value = '';
  }
  
  // 提交后隐藏输入框
  showCommentInput.value = false;
}
</script>

<template>
  <div class="post-card" :data-message-id="message.id">
    <!-- 帖子头部 -->
    <div class="post-header">
      <div class="user-info">
        <div class="avatar">匿</div>
        <div class="user-details">
          <span class="username">匿名用户</span>
          <span class="post-time">{{ formatTime(message.timestamp) }}</span>
        </div>
      </div>
    </div>
    
    <!-- 帖子内容 -->
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
            loading="lazy"
          >
          <div v-else class="attachment-file">
            <span class="file-icon">📄</span>
            <span class="file-name">{{ file }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 帖子底部操作按钮 -->
    <div class="post-footer">
      <button class="action-btn like-btn">
        <ThumbUpIcon class="icon" :size="20" />
        <span class="count">{{ message.likes || 0 }}</span>
      </button>
      <button class="action-btn comment-btn" @click="handleToggleComment">
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
    
    <!-- 添加评论输入框 -->
    <div class="add-comment-section" v-if="showCommentInput">
      <div class="comment-input-container">
        <div class="comment-avatar">匿</div>
        <input 
          type="text" 
          placeholder="添加评论..." 
          class="comment-input"
        >
        <button class="submit-comment-btn" @click="handleSubmitComment">发送</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

/* 响应式设计 */
@media (max-width: 768px) {
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

/* 深色模式样式 */
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

.dark .comment-input {
  background-color: #3a3a3a;
  border-color: #555;
  color: #f6f6f6;
}
</style>