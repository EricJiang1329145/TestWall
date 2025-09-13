import { ref } from 'vue';
import type { Comment } from '../types';

/**
 * 评论管理的组合式函数
 * 负责处理评论的提交和状态管理
 */
export function useComments() {
  const showCommentInput = ref<{[key: number]: boolean}>({});

  /**
   * 切换评论输入框显示状态
   * @param messageId 帖子ID
   */
  function toggleCommentInput(messageId: number): void {
    showCommentInput.value[messageId] = !showCommentInput.value[messageId];
  }

  /**
   * 提交评论到服务器
   * @param messageId 帖子ID
   * @param commentText 评论内容
   * @returns 新评论数据
   */
  async function submitComment(messageId: number, commentText: string): Promise<Comment | null> {
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
        throw new Error(`HTTP错误! 状态码: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`评论提交成功:`, result.comment);
        
        // 转换后端返回的评论数据结构以匹配前端期望的结构
        const newComment: Comment = {
          id: result.comment.id,
          text: result.comment.text,
          timestamp: result.comment.timestamp,
          user: "匿名用户"  // 后端不返回用户信息，我们使用默认值
        };
        
        return newComment;
      } else {
        console.error(`评论提交失败:`, result.error);
        return null;
      }
    } catch (error) {
      console.error(`提交评论到帖子 ${messageId} 失败:`, error);
      return null;
    }
  }

  return {
    showCommentInput,
    toggleCommentInput,
    submitComment
  };
}