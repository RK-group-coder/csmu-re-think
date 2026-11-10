export type CategoryId =
  | 'all'
  | 'textbook'
  | 'general_book'
  | '3c_appliance'
  | 'daily_dorm'
  | 'entertainment'
  | 'food'
  | 'charity';

export type ItemCondition =
  | '全新未拆'
  | '九成新'
  | '八成新'
  | '有使用痕跡/畫記';

export type ListingStatus =
  | '上架中'
  | '保留中'
  | '已售出'
  | '已下架';

export type MeetupLocation =
  | '正心樓一樓郵局前'
  | '誠愛樓一樓大廳'
  | '張啟華紀念圖書館前'
  | '杏樓(學餐/宿舍門口)'
  | '大慶捷運站1號出口'
  | '附設醫院汝川大樓連通道'
  | '實驗大樓門口';

export type ReportReason =
  | '黃牛票券'
  | '違禁品 (藥品 / 煙酒)'
  | '假貨 / 盜版影印書'
  | '過期食品 / 保養品'
  | '放鳥 / 未到 / 詐騙行為'
  | '描述不符 / 臨時惡意殺價'
  | '違規商業廣告';

export interface QAItem {
  id: string;
  userId: string;
  userNickname: string;
  userDepartment: string;
  question: string;
  askedAt: string;
  reply?: string;
  repliedAt?: string;
}

export interface ReviewItem {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerDept: string;
  role: '買家評價賣家' | '賣家評價買家';
  productId: string;
  productTitle: string;
  rating: number; // 1 ~ 5
  comment: string;
  tags: string[]; // e.g. ['準時守信', '書況如實', '正心樓面交順利']
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  email: string;
  department: string;
  grade: string;
  studentIdMasked: string;
  avatar: string;
  isGoogleVerified: boolean;
  isAdmin?: boolean;
  badges: string[];
  ratingAvg: number; // 0 means 未評分
  ratingCount: number;
  reviews: ReviewItem[];
  accountStatus: '正常' | '警告中' | '已停權';
  warningNote?: string;
  preferredLocations: MeetupLocation[];
  joinedAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  images: string[]; // Up to 5-8 images, index 0 is cover image (首圖)
  originalPrice?: number;
  price: number;
  negotiable: boolean;
  condition: ItemCondition;
  quantity: number;
  category: Exclude<CategoryId, 'all'>;
  subCategory: string;
  status: ListingStatus;
  reservedForUserId?: string;
  soldToUserId?: string;
  meetupLocations: MeetupLocation[];
  isUrgent?: boolean;
  urgentReason?: string;
  createdAt: string;
  likes: number;
  likedByMe?: boolean;
  qaList: QAItem[];

  // Structured textbook fields
  college?: string;
  department?: string;
  courseName?: string;
  publishYearEdition?: string;
  isbn?: string;
  author?: string;

  // General book special feature
  isBookCrossing?: boolean; // 免費贈與 / 漂書專區

  // Expiry date (Mandatory for 'food' and '彩妝 / 保養品')
  expiryDate?: string; // YYYY-MM-DD
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  timestamp: string;
  hasExternalLinkWarning?: boolean;
  isSystemNotice?: boolean;
}

export interface ChatThread {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  updatedAt: string;
  unreadCount: number;
  messages: ChatMessage[];
  buyerReviewed?: boolean;
  sellerReviewed?: boolean;
}

export interface WantedPost {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterDept: string;
  title: string;
  category: Exclude<CategoryId, 'all'>;
  subCategory: string;
  courseOrSpec?: string;
  budgetText: string;
  preferredCondition: string;
  preferredLocation: MeetupLocation;
  description: string;
  createdAt: string;
  expiresAt: string;
  emailNotify: boolean;
  status: '徵求中' | '已徵得' | '已過期';
  responsesCount: number;
}

export interface KeywordSubscription {
  id: string;
  keyword: string;
  categoryFilter: string;
  email: string;
  createdAt: string;
  matchedProductIds: string[];
}

export interface EmailNotificationLog {
  id: string;
  toEmail: string;
  subject: string;
  keyword: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  sentAt: string;
  read: boolean;
}

export interface ReportCase {
  id: string;
  targetType: '商品檢舉' | '私訊檢舉' | '面交放鳥/未完成交易爭議';
  productId?: string;
  productTitle: string;
  reportedUserId: string;
  reportedUserName: string;
  reporterName: string;
  reason: ReportReason;
  description: string;
  createdAt: string;
  status: '待審核' | '已強制下架商品' | '已記警告/停權' | '已結案';
}

export interface AnnouncementBanner {
  id: string;
  tag: '校園活動' | '公益二手書募集' | '平台防詐提醒' | '全站廣播';
  title: string;
  summary: string;
  metaInfo: string;
  ctaLabel: string;
  actionType: 'filter_charity' | 'filter_bookcrossing' | 'open_safety_modal' | 'filter_urgent';
  theme: 'forest' | 'amber' | 'charcoal';
}

export interface IsbnBookRecord {
  isbn: string;
  title: string;
  author: string;
  publishYearEdition: string;
  originalPrice: number;
  college: string;
  department: string;
  courseName: string;
  coverImage: string;
  defaultDesc: string;
}

