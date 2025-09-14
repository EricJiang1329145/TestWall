# PostCard.vue TypeScript警告修复

## 问题描述

在PostCard.vue组件中存在三个TypeScript警告：

1. "已声明'computed'，但从未读取其值"
2. "已声明'ChevronLeftIcon'，但从未读取其值"
3. "已声明'ChevronRightIcon'，但从未读取其值"

## 问题分析

经过分析发现，这些问题都是由于导入了但未使用的变量导致的：

1. `computed`在第2行从vue中导入，但在组件中从未使用
2. `ChevronLeftIcon`在第6行导入，但在组件中从未使用
3. `ChevronRightIcon`在第7行导入，但在组件中从未使用

## 修复详情

### 1. 移除未使用的导入

**修复前**：
```typescript
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
import type { Message } from '../types';
```

**修复后**：
```typescript
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
```

## 验证

修复后重新编译项目，确认TypeScript警告已消失。