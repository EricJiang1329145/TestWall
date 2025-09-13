# 评论功能实现文档

## 问题描述
之前前端Vue应用中的评论功能没有正确实现，用户提交评论时无法发送到服务器。

## 问题分析
通过代码分析发现：
1. `App.vue`中的`submitComment`函数只包含打印日志和隐藏输入框的代码
2. 没有实际的API调用逻辑向服务器发送评论数据
3. 后端API接口`/wall/comment/<message_id>`已经正确实现

## 解决方案
修改前端代码，实现完整的评论提交功能：

### 1. 修改submitComment函数
在`App.vue`文件中，更新`submitComment`函数实现：

```javascript
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
      // 可以在这里添加评论成功后的处理逻辑，比如更新UI显示新评论
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
```

### 2. 修改模板代码
为每个帖子卡片添加data-message-id属性，以便函数能够正确获取到对应的输入框：

```html
<div 
  v-for="message in messages" 
  :key="message.id" 
  class="post-card"
  :data-message-id="message.id"
>
```

## 测试验证
修改完成后，重新启动前端应用并测试评论功能：
1. 点击帖子下方的评论按钮
2. 输入评论内容
3. 点击发送按钮
4. 检查浏览器控制台输出和网络请求，确认评论已成功发送到服务器

## 注意事项
1. 确保后端API服务正常运行
2. 确保网络连接正常
3. 如果出现CORS问题，检查Vite代理配置是否正确