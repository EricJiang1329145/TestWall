// 帖子数据类型定义
export interface Message {
  id: number;
  text: string;
  timestamp: string;
  likes?: number;
  comments?: Comment[];
  files?: string[];
}

// 评论数据类型定义
export interface Comment {
  id: number;
  text: string;
  timestamp: string;
  user?: string;
}

// API响应数据类型定义
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}

// 分页参数类型定义
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 深色模式状态类型定义
export interface DarkModeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// 帖子列表状态类型定义
export interface MessagesState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalMessages: number;
  hasMore: boolean; // 是否还有更多数据
  fetchMessages: (page?: number, append?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  resetAndLoad: () => Promise<void>;
}