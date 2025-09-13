<script setup lang="ts">
import { ref, computed } from 'vue';
import ThumbUpIcon from 'vue-material-design-icons/ThumbUp.vue';
import CommentIcon from 'vue-material-design-icons/Comment.vue';
import ShareIcon from 'vue-material-design-icons/Share.vue';
import ChevronLeftIcon from 'vue-material-design-icons/ChevronLeft.vue';
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue';
import ImageIcon from 'vue-material-design-icons/Image.vue';
import VideoIcon from 'vue-material-design-icons/Video.vue';
import FileDocumentIcon from 'vue-material-design-icons/FileDocument.vue';
import DownloadIcon from 'vue-material-design-icons/Download.vue';
import PlayIcon from 'vue-material-design-icons/Play.vue';
import type { Message, Comment } from '../types';

// 定义组件属性
const props = defineProps<{
  message: Message;
}>();

// 定义组件事件
const emit = defineEmits(['toggleComment', 'submitComment']);

const showCommentInput = ref(false);

// 评论分页相关状态
const commentsPerPage = 5; // 每页显示5条评论
const currentCommentPage = ref<{[key: number]: number}>({});

// 图片预览相关状态
const showImagePreview = ref(false);
const previewImageUrl = ref('');

// 视频播放相关状态
const showVideoPlayer = ref(false);
const playingVideoUrl = ref('');

/**
 * 获取当前帖子的评论分页数据
 */
const paginatedComments = computed(() => {
  if (!props.message.comments || props.message.comments.length === 0) {
    return [];
  }
  
  const page = currentCommentPage.value[props.message.id] || 1;
  const startIndex = (page - 1) * commentsPerPage;
  const endIndex = startIndex + commentsPerPage;
  
  return props.message.comments.slice(startIndex, endIndex);
});

/**
 * 获取总页数
 */
const totalCommentPages = computed(() => {
  if (!props.message.comments || props.message.comments.length === 0) {
    return 0;
  }
  
  return Math.ceil(props.message.comments.length / commentsPerPage);
});

/**
 * 检查是否需要显示评论分页
 */
const shouldShowCommentPagination = computed(() => {
  return props.message.comments && props.message.comments.length > commentsPerPage;
});

/**
 * 切换到上一页评论
 */
function prevCommentPage(): void {
  const messageId = props.message.id;
  const currentPage = currentCommentPage.value[messageId] || 1;
  
  if (currentPage > 1) {
    currentCommentPage.value[messageId] = currentPage - 1;
  }
}

/**
 * 切换到下一页评论
 */
function nextCommentPage(): void {
  const messageId = props.message.id;
  const currentPage = currentCommentPage.value[messageId] || 1;
  
  if (currentPage < totalCommentPages.value) {
    currentCommentPage.value[messageId] = currentPage + 1;
  }
}

/**
 * 跳转到指定页码
 */
function goToCommentPage(page: number): void {
  const messageId = props.message.id;
  if (page >= 1 && page <= totalCommentPages.value) {
    currentCommentPage.value[messageId] = page;
  }
}

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
 * 获取文件类型图标
 * @param filename 文件名
 */
function getFileIcon(filename: string): string {
  if (isImageFile(filename)) return 'image';
  if (isVideoFile(filename)) return 'video';
  return 'document';
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
              @error="(e) => e.target.src = getFileUrl(file)"
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
              @error="(e) => e.target.src = getFileUrl(file)"
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
        <!-- 分页显示的评论 -->
        <div v-for="(comment, index) in paginatedComments" :key="index" class="comment-item">
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

        <!-- 评论分页控件 -->
        <div v-if="shouldShowCommentPagination" class="comment-pagination">
          <div class="pagination-controls">
            <button 
              class="pagination-btn" 
              :disabled="(currentCommentPage[message.id] || 1) === 1"
              @click="prevCommentPage"
            >
              <ChevronLeftIcon :size="16" />
            </button>
            
            <span class="pagination-info">
              第 {{ currentCommentPage[message.id] || 1 }} 页 / 共 {{ totalCommentPages }} 页
              ({{ message.comments.length }} 条评论)
            </span>
            
            <button 
              class="pagination-btn" 
              :disabled="(currentCommentPage[message.id] || 1) === totalCommentPages"
              @click="nextCommentPage"
            >
              <ChevronRightIcon :size="16" />
            </button>
          </div>
          
          <!-- 页码选择器 -->
          <div v-if="totalCommentPages > 2" class="page-selector">
            <span>跳转到: </span>
            <select 
              :value="currentCommentPage[message.id] || 1" 
              @change="goToCommentPage(Number($event.target.value))"
              class="page-select"
            >
              <option v-for="page in totalCommentPages" :key="page" :value="page">
                第 {{ page }} 页
              </option>
            </select>
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

.attachment {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.attachment:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.attachment-image {
  max-width: 300px;
  max-height: 300px;
}

.attachment-video {
  max-width: 300px;
  max-height: 200px;
}

.attachment-file {
  max-width: 200px;
  padding: 1rem;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}

.image-container,
.video-container {
  position: relative;
  width: 100%;
  height: 100%;
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 6px;
}

.image-container:hover .attachment-overlay,
.video-container:hover .attachment-overlay {
  opacity: 1;
}

.overlay-icon {
  color: white;
  margin-bottom: 0.5rem;
}

.overlay-text {
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
}

.video-icon {
  color: white;
}

.file-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.file-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-type-icon {
  color: #6c757d;
}

.download-icon {
  position: absolute;
  bottom: -4px;
  right: -4px;
  color: #28a745;
  background: white;
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.file-name {
  font-size: 0.8rem;
  color: #495057;
  font-weight: 500;
  word-break: break-all;
  max-width: 100%;
}

.download-text {
  font-size: 0.75rem;
  color: #28a745;
  font-weight: 500;
}

/* 模态框样式 */
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
  background: white;
  border-radius: 12px;
  overflow: hidden;
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.9);
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.video-player {
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  background: black;
}

.modal-actions {
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: center;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: #007bff;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.download-btn:hover {
  background: #0056b3;
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

/* 评论分页控件 */
.comment-pagination {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pagination-btn {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
  border-color: #ccc;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.85rem;
  color: #666;
  min-width: 180px;
  text-align: center;
}

.page-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}

.page-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  font-size: 0.85rem;
}

.page-select:focus {
  outline: none;
  border-color: #1976d2;
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

/* 深色模式下的分页控件样式 */
.dark .comment-pagination {
  border-color: #444;
}

.dark .pagination-btn {
  background-color: #3a3a3a;
  border-color: #555;
  color: #f6f6f6;
}

.dark .pagination-btn:hover:not(:disabled) {
  background-color: #4a4a4a;
  border-color: #666;
}

.dark .pagination-info {
  color: #ccc;
}

.dark .page-selector {
  color: #ccc;
}

.dark .page-select {
  background-color: #3a3a3a;
  border-color: #555;
  color: #f6f6f6;
}

.dark .page-select:focus {
  border-color: #1976d2;
}
</style>