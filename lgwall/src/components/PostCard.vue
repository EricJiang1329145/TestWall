<script setup lang="ts">
import { ref } from 'vue';
import ThumbUpIcon from 'vue-material-design-icons/ThumbUp.vue';
import CommentIcon from 'vue-material-design-icons/Comment.vue';
import ShareIcon from 'vue-material-design-icons/Share.vue';
import ImageIcon from 'vue-material-design-icons/Image.vue';
import VideoIcon from 'vue-material-design-icons/Video.vue';
import FileDocumentIcon from 'vue-material-design-icons/FileDocument.vue';
import DownloadIcon from 'vue-material-design-icons/Download.vue';
import PlayIcon from 'vue-material-design-icons/Play.vue';
import type { Message } from '../types';

// 定义组件属性
const props = defineProps<{
  message: Message;
}>();

// 定义组件事件
const emit = defineEmits(['toggleComment', 'submitComment']);

const showCommentInput = ref(false);

// 图片预览相关状态
const showImagePreview = ref(false);
const previewImageUrl = ref('');

// 视频播放相关状态
const showVideoPlayer = ref(false);
const playingVideoUrl = ref('');

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
  const inputElement = document.querySelector(`.post-card[data-message-id="${props.message.id}"] .comment-input`) as HTMLInputElement | null;
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

/**
 * 获取文件完整URL
 * @param filename 文件名
 */
function getFileUrl(filename: string): string {
  return `https://www.rz101.com/static/uploads/${filename}`;
}

/**
 * 获取缩略图URL（仅支持png和mp4文件）
 * @param filename 文件名
 */
function getThumbnailUrl(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'png' || ext === 'mp4') {
    return `https://www.rz101.com/static/tiny_files/${filename}`;
  }
  return getFileUrl(filename);
}

/**
 * 判断文件是否为图片
 * @param filename 文件名
 */
function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

/**
 * 判断文件是否为视频
 * @param filename 文件名
 */
function isVideoFile(filename: string): boolean {
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];
  return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

/**
 * 预览图片
 * @param filename 文件名
 */
function previewImage(filename: string): void {
  previewImageUrl.value = getFileUrl(filename);
  showImagePreview.value = true;
}

/**
 * 播放视频
 * @param filename 文件名
 */
function playVideo(filename: string): void {
  playingVideoUrl.value = getFileUrl(filename);
  showVideoPlayer.value = true;
}

/**
 * 下载文件
 * @param filename 文件名
 */
function downloadFile(filename: string): void {
  const fileUrl = getFileUrl(filename);
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
          :class="{ 'attachment-image': isImageFile(file), 'attachment-video': isVideoFile(file), 'attachment-file': !isImageFile(file) && !isVideoFile(file) }"
        >
          <!-- 图片文件 -->
          <div v-if="isImageFile(file)" class="image-container" @click="previewImage(file)">
            <img 
              :src="getThumbnailUrl(file)" 
              :alt="file"
              class="attachment-thumbnail"
              loading="lazy"
              @error="(e) => { const target = e.target as HTMLImageElement; if (target) target.src = getFileUrl(file); }"
            />
            <div class="attachment-overlay">
              <ImageIcon :size="24" class="overlay-icon" />
              <span class="overlay-text">点击查看原图</span>
            </div>
          </div>
          
          <!-- 视频文件 -->
          <div v-else-if="isVideoFile(file)" class="video-container" @click="playVideo(file)">
            <img 
              v-if="file.endsWith('.mp4') || file.endsWith('.png')"
              :src="getThumbnailUrl(file)" 
              :alt="file"
              class="attachment-thumbnail"
              loading="lazy"
              @error="(e) => { const target = e.target as HTMLImageElement; if (target) target.src = getFileUrl(file); }"
            />
            <div v-else class="video-placeholder">
              <VideoIcon :size="32" class="video-icon" />
            </div>
            <div class="attachment-overlay">
              <PlayIcon :size="24" class="overlay-icon" />
              <span class="overlay-text">点击播放视频</span>
            </div>
          </div>
          
          <!-- 其他文件 -->
          <div v-else class="file-container" @click="downloadFile(file)">
            <div class="file-icon-container">
              <FileDocumentIcon :size="32" class="file-type-icon" />
              <DownloadIcon :size="16" class="download-icon" />
            </div>
            <span class="file-name">{{ file }}</span>
            <span class="download-text">点击下载</span>
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
    
    <!-- 评论列表 -->
      <div v-if="message.comments && message.comments.length > 0" class="comments-section">
        <!-- 滚动显示的评论 -->
        <div class="comments-container">
          <div v-for="(comment, index) in message.comments" :key="index" class="comment-item">
            <div class="comment-header">
              <div class="comment-user-info">
                <div class="comment-avatar">
                  {{ comment.user ? comment.user.charAt(0).toUpperCase() : '?' }}
                </div>
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

    <!-- 图片预览模态框 -->
    <div v-if="showImagePreview" class="modal-overlay" @click.self="showImagePreview = false">
      <div class="image-modal">
        <button class="modal-close" @click="showImagePreview = false">×</button>
        <img :src="previewImageUrl" class="preview-image" alt="预览图片" />
        <div class="modal-actions">
          <button class="download-btn" @click="downloadFile(previewImageUrl.split('/').pop() || '')">
            <DownloadIcon :size="16" />
            下载原图
          </button>
        </div>
      </div>
    </div>

    <!-- 视频播放模态框 -->
    <div v-if="showVideoPlayer" class="modal-overlay" @click.self="showVideoPlayer = false">
      <div class="video-modal">
        <button class="modal-close" @click="showVideoPlayer = false">×</button>
        <video :src="playingVideoUrl" controls class="video-player" autoplay>
          您的浏览器不支持视频播放
        </video>
        <div class="modal-actions">
          <button class="download-btn" @click="downloadFile(playingVideoUrl.split('/').pop() || '')">
            <DownloadIcon :size="16" />
            下载视频
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-card {
  background-color: var(--card-background);
  border-radius: 12px;
  box-shadow: var(--shadow-light);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.post-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
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
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: var(--shadow-light);
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  color: var(--text-primary);
}

.post-time {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.post-content {
  padding: 1rem;
}

.post-text {
  line-height: 1.6;
  color: var(--text-primary);
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
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid var(--border-color);
}

.attachment:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.attachment-file {
  max-width: 200px;
  padding: 1rem;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.attachment-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.attachment-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(124, 58, 237, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 6px;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: 6px;
}

.file-type-icon {
  color: var(--primary-color);
}

.download-icon {
  position: absolute;
  bottom: -4px;
  right: -4px;
  color: var(--primary-color);
  background: var(--card-background);
  border-radius: 50%;
  padding: 2px;
  box-shadow: var(--shadow-light);
}

.file-name {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
  word-break: break-all;
  max-width: 100%;
}

.download-text {
  font-size: 0.75rem;
  color: var(--primary-color);
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.image-modal,
.video-modal {
  position: relative;
  background: var(--card-background);
  border-radius: 12px;
  overflow: hidden;
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: var(--shadow-heavy);
  border: 1px solid var(--border-color);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: var(--primary-hover);
  transform: scale(1.1);
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: var(--gradient-primary);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-light);
}

.download-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.post-footer {
  display: flex;
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--surface-color);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.action-btn:hover {
  background-color: var(--surface-color);
  color: var(--primary-color);
}

.like-btn:hover {
  color: var(--primary-color);
}

.comment-btn:hover {
  color: var(--primary-color);
}

.share-btn:hover {
  color: var(--primary-color);
}

.icon {
  font-size: 1.1rem;
  vertical-align: middle;
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.count {
  font-weight: 500;
  color: var(--text-secondary);
}

.comments-section {
  border-top: 1px solid var(--border-color);
  padding: 1rem;
  background-color: var(--surface-color);
}

.comment-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gradient-secondary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: var(--shadow-light);
}

.comment-username {
  font-weight: 500;
  color: var(--text-primary);
}

.comment-text {
  line-height: 1.5;
  color: var(--text-primary);
  margin: 0;
  font-size: 0.95rem;
}

.comments-container {
  max-height: 300px; /* 设置最大高度 */
  overflow-y: auto; /* 启用垂直滚动 */
  scroll-behavior: smooth; /* 平滑滚动效果 */
}

/* 确保滚动条通用宽度在普通模式中也已定义 */
.comments-container::-webkit-scrollbar {
  width: 6px;
}

.comments-container::-webkit-scrollbar-track {
  background: var(--surface-color);
  border-radius: 3px;
}

.comments-container::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 3px;
  opacity: 0.7;
}

.comments-container::-webkit-scrollbar-thumb:hover {
  background: var(--primary-hover);
  opacity: 1;
}

.add-comment-section {
  border-top: 1px solid var(--border-color);
  padding: 1rem;
  background-color: var(--card-background);
}

.comment-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;
  background-color: var(--surface-color);
  color: var(--text-primary);
}

.comment-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.submit-comment-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: var(--gradient-primary);
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: var(--shadow-light);
}

.submit-comment-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
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

/* 深色模式样式 - 使用变量自动适配 */
.dark .post-card {
  background-color: var(--card-background);
  box-shadow: var(--shadow-medium);
  border-color: var(--border-color);
}

.dark .post-header, 
.dark .post-footer, 
.dark .comments-section, 
.dark .add-comment-section {
  border-color: var(--border-color);
}

.dark .post-footer, 
.dark .comments-section {
  background-color: var(--surface-color);
}

.dark .add-comment-section {
  background-color: var(--card-background);
}

.dark .username, 
.dark .comment-username {
  color: var(--text-primary);
}

.dark .post-text, 
.dark .comment-text {
  color: var(--text-primary);
}

.dark .attachment-file {
  background-color: var(--surface-color);
  border-color: var(--border-color);
}

.dark .file-name {
  color: var(--text-secondary);
}

.dark .comment-input {
  background-color: var(--surface-color);
  border-color: var(--border-color);
  color: var(--text-primary);
}

/* 深色模式下的评论容器样式 */
.dark .comments-container {
  max-height: 300px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.dark .comments-container::-webkit-scrollbar-track {
  background: var(--surface-color);
  border-radius: 3px;
}

.dark .comments-container::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 3px;
  opacity: 0.7;
}

.dark .comments-container::-webkit-scrollbar-thumb:hover {
  background: var(--primary-hover);
  opacity: 1;
}

/* 评论区域样式优化 - 确保名称和日期显示在头像右侧 */
.comment-header {
  margin-bottom: 0.5rem !important;
}

.comment-user-info {
  display: flex !important;
  align-items: flex-start !important;
  gap: 0.75rem !important;
}

.comment-user-details {
  display: flex !important;
  flex-direction: column !important;
  gap: 0.25rem !important;
}

.comment-username {
  font-weight: 500 !important;
  color: var(--text-primary) !important;
  font-size: 0.9rem !important;
}

.comment-time {
  font-size: 0.75rem !important;
  color: var(--text-muted) !important;
}

.comment-content {
  margin-left: calc(32px + 0.75rem) !important; /* 头像宽度 + 间距 */
  margin-top: 0 !important;
}

/* 确保没有其他样式干扰 */
.comment-item {
  position: relative !important;
}

.comment-item .comment-header + .comment-content {
  margin-left: calc(32px + 0.75rem) !important;
}

/* 响应式设计调整 */
@media (max-width: 768px) {
  .comment-content {
    margin-left: calc(28px + 0.5rem) !important;
  }
  
  .comment-user-info {
    gap: 0.5rem !important;
  }
  
  .comment-item .comment-header + .comment-content {
    margin-left: calc(28px + 0.5rem) !important;
  }
}
</style>