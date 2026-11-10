import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  MessageSquare,
  Bell,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  Flame,
  Sparkles,
  BookOpen,
  Laptop,
  Home,
  Ticket,
  Utensils,
  HeartHandshake,
  HelpCircle,
  User,
  LogOut,
  CheckCircle2,
  MapPin,
  Filter,
  RotateCcw,
  Barcode,
  Mail,
  Settings,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import {
  AnnouncementBanner,
  CategoryId,
  ChatThread,
  EmailNotificationLog,
  ItemCondition,
  KeywordSubscription,
  ListingStatus,
  MeetupLocation,
  Product,
  ReportCase,
  ReportReason,
  UserProfile,
  WantedPost,
} from './types';
import {
  CATEGORY_CONFIGS,
  CSMU_MEETUP_LOCATIONS,
  HOT_KEYWORDS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CHATS,
  INITIAL_EMAIL_LOGS,
  INITIAL_PRODUCTS,
  INITIAL_REPORTS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_USERS,
  INITIAL_WANTED_POSTS,
} from './data/csmuData';
import { detectExternalLinkOrRisk, getExpiryStatus } from './utils/helpers';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ListingFormModal } from './components/ListingFormModal';
import { ChatDrawerModal } from './components/ChatDrawerModal';
import {
  MutualReviewModal,
  ReportModal,
  SafetyGuideModal,
} from './components/ReviewAndReportModals';
import { UserProfileModal } from './components/UserProfileModal';
import { WantedBoardView } from './components/WantedBoardView';
import { PersonalCenterView } from './components/PersonalCenterView';
import { AdminDashboardView } from './components/AdminDashboardView';

type MainView = 'home' | 'browse' | 'wanted' | 'personal' | 'admin';
type SortOption = 'latest' | 'price_asc' | 'price_desc' | 'most_liked';

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function App() {
  // Core Data States (with localStorage persistence across page reloads)
  const [users, setUsers] = useState<UserProfile[]>(() =>
    loadStored('csmu_v2_users', INITIAL_USERS)
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(() =>
    loadStored('csmu_v2_currentUserId', 'u-me')
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadStored('csmu_v2_products', INITIAL_PRODUCTS)
  );
  const [chats, setChats] = useState<ChatThread[]>(() =>
    loadStored('csmu_v2_chats', INITIAL_CHATS)
  );
  const [wantedPosts, setWantedPosts] = useState<WantedPost[]>(() =>
    loadStored('csmu_v2_wanted', INITIAL_WANTED_POSTS)
  );
  const [subscriptions, setSubscriptions] = useState<KeywordSubscription[]>(
    () => loadStored('csmu_v2_subs', INITIAL_SUBSCRIPTIONS)
  );
  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>(() =>
    loadStored('csmu_v2_emails', INITIAL_EMAIL_LOGS)
  );
  const [reports, setReports] = useState<ReportCase[]>(() =>
    loadStored('csmu_v2_reports', INITIAL_REPORTS)
  );
  const [announcements, setAnnouncements] = useState<AnnouncementBanner[]>(() =>
    loadStored('csmu_v2_announcements', INITIAL_ANNOUNCEMENTS)
  );

  useEffect(() => {
    try {
      localStorage.setItem('csmu_v2_users', JSON.stringify(users));
      localStorage.setItem('csmu_v2_currentUserId', JSON.stringify(currentUserId));
      localStorage.setItem('csmu_v2_products', JSON.stringify(products));
      localStorage.setItem('csmu_v2_chats', JSON.stringify(chats));
      localStorage.setItem('csmu_v2_wanted', JSON.stringify(wantedPosts));
      localStorage.setItem('csmu_v2_subs', JSON.stringify(subscriptions));
      localStorage.setItem('csmu_v2_emails', JSON.stringify(emailLogs));
      localStorage.setItem('csmu_v2_reports', JSON.stringify(reports));
      localStorage.setItem('csmu_v2_announcements', JSON.stringify(announcements));
    } catch {
      // ignore storage quota errors
    }
  }, [
    users,
    currentUserId,
    products,
    chats,
    wantedPosts,
    subscriptions,
    emailLogs,
    reports,
    announcements,
  ]);

  // Navigation & View States
  const [activeView, setActiveView] = useState<MainView>('home');
  const [personalTab, setPersonalTab] = useState<
    'listings' | 'favorites' | 'subscriptions' | 'settings'
  >('listings');
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Carousel Banner Index
  const [bannerIdx, setBannerIdx] = useState(0);

  // Multi-Filter & Sort States (分類瀏覽頁多重篩選器 & 排序功能)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('全部');
  const [selectedCondition, setSelectedCondition] = useState<'全部' | ItemCondition>('全部');
  const [selectedLocation, setSelectedLocation] = useState<'全部' | MeetupLocation>('全部');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [onlyActiveStatus, setOnlyActiveStatus] = useState<boolean>(false);
  const [onlyNegotiable, setOnlyNegotiable] = useState<boolean>(false);
  const [onlyBookCrossingOrFree, setOnlyBookCrossingOrFree] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  // Modals States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showListingModal, setShowListingModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>('chat-1');
  const [inspectedUserId, setInspectedUserId] = useState<string | null>(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState(false);

  // Review & Report Modal States
  const [reviewModalState, setReviewModalState] = useState<{
    product: Product;
    targetUser: UserProfile;
    threadId?: string;
  } | null>(null);

  const [reportModalState, setReportModalState] = useState<{
    targetType: '商品檢舉' | '私訊檢舉' | '面交放鳥/未完成交易爭議';
    product?: Product;
    reportedUser?: UserProfile;
  } | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || null,
    [users, currentUserId]
  );

  // Auto-advance announcement carousel every 7s
  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setBannerIdx((prev) => (prev + 1) % announcements.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  // Keep selectedProduct synced when products update
  const liveSelectedProduct = useMemo(
    () =>
      selectedProduct
        ? products.find((p) => p.id === selectedProduct.id) || null
        : null,
    [products, selectedProduct]
  );

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (onlyActiveStatus && p.status !== '上架中') return false;
        if (onlyNegotiable && !p.negotiable) return false;
        if (onlyBookCrossingOrFree && p.price !== 0 && !p.isBookCrossing) return false;

        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }
        if (
          selectedSubCategory !== '全部' &&
          p.subCategory !== selectedSubCategory
        ) {
          return false;
        }
        if (selectedCondition !== '全部' && p.condition !== selectedCondition) {
          return false;
        }
        if (
          selectedLocation !== '全部' &&
          !p.meetupLocations.includes(selectedLocation)
        ) {
          return false;
        }
        if (minPrice !== '' && p.price < Number(minPrice)) {
          return false;
        }
        if (maxPrice !== '' && p.price > Number(maxPrice)) {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const haystack = [
            p.title,
            p.description,
            p.subCategory,
            p.department || '',
            p.courseName || '',
            p.isbn || '',
            p.author || '',
          ]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'most_liked') return b.likes - a.likes;
        // 'latest'
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [
    products,
    onlyActiveStatus,
    onlyNegotiable,
    onlyBookCrossingOrFree,
    selectedCategory,
    selectedSubCategory,
    selectedCondition,
    selectedLocation,
    minPrice,
    maxPrice,
    searchQuery,
    sortBy,
  ]);

  const urgentProducts = useMemo(
    () => products.filter((p) => p.isUrgent && p.status === '上架中'),
    [products]
  );

  const unreadChatCount = useMemo(
    () => chats.reduce((acc, t) => acc + t.unreadCount, 0),
    [chats]
  );

  // Handlers
  const handleToggleLike = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      setShowGoogleAuthModal(true);
      return;
    }
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const nextLiked = !p.likedByMe;
        return {
          ...p,
          likedByMe: nextLiked,
          likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
        };
      })
    );
  };

  const handleAddQuestion = (productId: string, questionText: string) => {
    if (!currentUser) {
      setShowGoogleAuthModal(true);
      return;
    }
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          qaList: [
            ...p.qaList,
            {
              id: `qa-${Date.now()}`,
              userId: currentUser.id,
              userNickname: currentUser.name,
              userDepartment: currentUser.department,
              question: questionText,
              askedAt: '剛剛',
            },
          ],
        };
      })
    );
    showToast('✓ 已發布公開提問，賣家將收到通知！');
  };

  const handleReplyQuestion = (
    productId: string,
    qaId: string,
    replyText: string
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          qaList: p.qaList.map((qa) =>
            qa.id === qaId
              ? { ...qa, reply: replyText, repliedAt: '剛剛' }
              : qa
          ),
        };
      })
    );
    showToast('✓ 已回覆買家提問！');
  };

  const handleChangeProductStatus = (
    productId: string,
    newStatus: ListingStatus,
    soldToBuyerId?: string
  ) => {
    const targetProduct = products.find((p) => p.id === productId);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              status: newStatus,
              reservedForUserId:
                newStatus === '保留中'
                  ? soldToBuyerId || p.reservedForUserId || 'u-2'
                  : p.reservedForUserId,
              soldToUserId:
                newStatus === '已售出' ? soldToBuyerId || 'u-2' : p.soldToUserId,
            }
          : p
      )
    );

    if (newStatus === '已售出' && targetProduct) {
      const buyer =
        users.find((u) => u.id === (soldToBuyerId || 'u-2')) || users[1];
      setReviewModalState({
        product: { ...targetProduct, status: '已售出' },
        targetUser: buyer,
      });
      showToast('🎉 商品已標記為「已售出」！請對本次交易進行互評。');
    } else {
      showToast(`✓ 商品狀態已更新為「${newStatus}」`);
    }
  };

  const handleSaveProduct = (
    productData: Omit<
      Product,
      'id' | 'sellerId' | 'createdAt' | 'likes' | 'qaList'
    >,
    editingId?: string
  ) => {
    if (!currentUser) return;

    if (editingId) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...productData } : p))
      );
      showToast('✓ 已儲存商品變更！');
    } else {
      const newId = `p-${Date.now()}`;
      const newProduct: Product = {
        ...productData,
        id: newId,
        sellerId: currentUser.id,
        createdAt: '2026-11-10 剛剛',
        likes: 1,
        likedByMe: false,
        qaList: [],
      };
      setProducts((prev) => [newProduct, ...prev]);

      // Check Keyword Subscriptions (第六大點之2：關鍵字訂閱自動寄信通知)
      const matchedSubs = subscriptions.filter((sub) => {
        const kw = sub.keyword.toLowerCase();
        return (
          newProduct.title.toLowerCase().includes(kw) ||
          (newProduct.courseName &&
            newProduct.courseName.toLowerCase().includes(kw)) ||
          newProduct.subCategory.toLowerCase().includes(kw)
        );
      });

      if (matchedSubs.length > 0) {
        const newLogs: EmailNotificationLog[] = matchedSubs.map((sub) => ({
          id: `mail-${Date.now()}-${sub.id}`,
          toEmail: sub.email,
          subject: `【大慶拾物所】您訂閱的關鍵字「${sub.keyword}」有新商品上架！`,
          keyword: sub.keyword,
          productId: newProduct.id,
          productTitle: newProduct.title,
          productPrice: newProduct.price,
          sentAt: '2026-11-10 剛剛',
          read: false,
        }));
        setEmailLogs((prev) => [...newLogs, ...prev]);
        setSubscriptions((prev) =>
          prev.map((s) =>
            matchedSubs.some((m) => m.id === s.id)
              ? { ...s, matchedProductIds: [newProduct.id, ...s.matchedProductIds] }
              : s
          )
        );
        showToast(
          `✓ 商品已上架！系統已自動觸發「關鍵字訂閱通知」並寄信至 ${matchedSubs[0].email}`
        );
      } else {
        showToast('✓ 商品已成功上架！');
      }
    }

    setShowListingModal(false);
    setEditingProduct(null);
  };

  const handleStartChat = (product: Product) => {
    if (!currentUser) {
      setShowGoogleAuthModal(true);
      return;
    }

    const existing = chats.find(
      (t) =>
        t.productId === product.id &&
        (t.buyerId === currentUser.id || t.sellerId === currentUser.id)
    );

    if (existing) {
      setActiveChatThreadId(existing.id);
    } else {
      const newThread: ChatThread = {
        id: `chat-${Date.now()}`,
        productId: product.id,
        buyerId: currentUser.id,
        sellerId: product.sellerId,
        updatedAt: '剛剛',
        unreadCount: 0,
        messages: [
          {
            id: `m-${Date.now()}`,
            senderId: currentUser.id,
            text: `您好！我對您刊登的《${product.title}》有興趣，請問目前商品還在嗎？`,
            timestamp: '剛剛',
          },
        ],
      };
      setChats((prev) => [newThread, ...prev]);
      setActiveChatThreadId(newThread.id);
    }

    setSelectedProduct(null);
    setShowChatModal(true);
  };

  const handleSendMessage = (
    threadId: string,
    text: string,
    imageUrl?: string
  ) => {
    if (!currentUser) return;
    const risk = detectExternalLinkOrRisk(text);

    setChats((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        return {
          ...t,
          updatedAt: '剛剛',
          unreadCount: 0,
          messages: [
            ...t.messages,
            {
              id: `m-${Date.now()}`,
              senderId: currentUser.id,
              text,
              imageUrl,
              timestamp: '剛剛',
              hasExternalLinkWarning: risk.hasUrl || risk.hasScamKeyword,
            },
          ],
        };
      })
    );
  };

  const handleSubmitReview = (
    targetUserId: string,
    productId: string,
    productTitle: string,
    rating: number,
    comment: string,
    tags: string[],
    role: '買家評價賣家' | '賣家評價買家'
  ) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== targetUserId) return u;
        const nextCount = u.ratingCount + 1;
        const nextAvg =
          (u.ratingAvg * u.ratingCount + rating) / nextCount;
        return {
          ...u,
          ratingCount: nextCount,
          ratingAvg: Number(nextAvg.toFixed(1)),
          reviews: [
            {
              id: `rev-${Date.now()}`,
              reviewerId: currentUser.id,
              reviewerName: currentUser.name,
              reviewerDept: currentUser.department,
              role,
              productId,
              productTitle,
              rating,
              comment,
              tags,
              createdAt: '2026-11-10',
            },
            ...u.reviews,
          ],
        };
      })
    );
    showToast(`★ 已送出 ${rating} 星評價！已即時更新至對方個人誠信檔案。`);
  };

  const handleSubmitReport = (
    targetType: '商品檢舉' | '私訊檢舉' | '面交放鳥/未完成交易爭議',
    reason: ReportReason,
    description: string,
    product?: Product,
    reportedUser?: UserProfile
  ) => {
    const sellerObj =
      reportedUser ||
      users.find((u) => u.id === product?.sellerId) ||
      users[5];

    const newCase: ReportCase = {
      id: `rep-${Date.now()}`,
      targetType,
      productId: product?.id,
      productTitle: product?.title || '站內私訊對話檢舉',
      reportedUserId: sellerObj.id,
      reportedUserName: `${sellerObj.name} (${sellerObj.studentIdMasked})`,
      reporterName: currentUser ? `${currentUser.name}` : '匿名同學',
      reason,
      description,
      createdAt: '2026-11-10 剛剛',
      status: '待審核',
    };

    setReports((prev) => [newCase, ...prev]);
    showToast('🚩 檢舉已送交「後台管理系統」，管理員將盡速審核處置！');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSubCategory('全部');
    setSelectedCondition('全部');
    setSelectedLocation('全部');
    setMinPrice('');
    setMaxPrice('');
    setOnlyActiveStatus(false);
    setOnlyNegotiable(false);
    setOnlyBookCrossingOrFree(false);
    setSortBy('latest');
  };

  const handleQuickCategoryClick = (
    catId: Exclude<CategoryId, 'all'>,
    subCat?: string
  ) => {
    setSelectedCategory(catId);
    setSelectedSubCategory(subCat || '全部');
    setOnlyBookCrossingOrFree(false);
    setActiveView('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBannerAction = (ann: AnnouncementBanner) => {
    if (ann.actionType === 'open_safety_modal') {
      setShowSafetyModal(true);
    } else if (ann.actionType === 'filter_charity') {
      setSelectedCategory('charity');
      setSelectedSubCategory('全部');
      setActiveView('browse');
    } else if (ann.actionType === 'filter_bookcrossing') {
      setSelectedCategory('general_book');
      setOnlyBookCrossingOrFree(true);
      setActiveView('browse');
    } else if (ann.actionType === 'filter_urgent') {
      const el = document.getElementById('urgent-zone');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentBanner = announcements[bannerIdx] || announcements[0];

  const activeFilterCount = [
    selectedCategory !== 'all',
    selectedSubCategory !== '全部',
    selectedCondition !== '全部',
    selectedLocation !== '全部',
    minPrice !== '',
    maxPrice !== '',
    onlyActiveStatus,
    onlyNegotiable,
    onlyBookCrossingOrFree,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink pb-16 md:pb-0">
      {/* Persistent Anti-Scam & Campus Identity Top Strip */}
      <div className="bg-ink text-paper-card text-[11px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="px-1.5 sm:px-2 py-0.5 rounded bg-terracotta text-white font-bold text-[10px] sm:text-[11px] shrink-0">
              防詐
            </span>
            <span className="text-stone-200 truncate">
              <span className="sm:hidden">嚴禁外部連結・堅持正心樓/誠愛樓面交</span>
              <span className="hidden sm:inline">
                請勿點擊外部點數卡或假賣貨便實名認證連結！建議選擇
                <strong className="text-white mx-1">
                  正心樓一樓郵局前、誠愛樓、張啟華圖書館或杏樓
                </strong>
                公開場合面交。
              </span>
            </span>
            <button
              type="button"
              onClick={() => setShowSafetyModal(true)}
              className="underline text-amber-300 hover:text-amber-200 font-semibold shrink-0"
            >
              守則
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-stone-400 hidden lg:inline">
              中山醫學大學校內專用（@csmu.edu.tw Google 驗證）
            </span>
            <button
              type="button"
              onClick={() => setActiveView('admin')}
              className={`px-2 sm:px-2.5 py-0.5 rounded font-semibold transition-colors ${
                activeView === 'admin'
                  ? 'bg-terracotta text-white'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              ⚙️ 後台 ({reports.filter((r) => r.status === '待審核').length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-30 bg-paper-card/95 backdrop-blur-sm border-b border-paper-border shadow-subtle">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => {
              setActiveView('home');
              handleResetFilters();
            }}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-csmu text-white flex flex-col items-center justify-center font-serif font-bold leading-none border border-csmu-dark shadow-sm shrink-0">
              <span className="text-[10px] sm:text-xs tracking-widest">中山醫</span>
              <span className="text-[8px] sm:text-[10px] font-mono opacity-90 mt-0.5">CSMU</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-base sm:text-xl font-bold text-ink tracking-tight group-hover:text-csmu transition-colors truncate">
                  大慶拾物所
                </h1>
                <span className="hidden lg:inline-block px-2 py-0.5 text-[11px] font-semibold bg-paper-muted text-ink-muted rounded border border-paper-border">
                  二手教材・宿舍好物・漂書交換
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-ink-muted truncate">
                <span className="sm:hidden">中山醫學大學二手交換平台</span>
                <span className="hidden sm:inline">Chung Shan Medical University Second-Hand Exchange</span>
              </p>
            </div>
          </div>

          {/* Primary Navigation Links (Desktop only; on Mobile moved to thumb-friendly Bottom Bar) */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-bold">
            <button
              type="button"
              onClick={() => setActiveView('home')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeView === 'home'
                  ? 'bg-csmu-light text-csmu'
                  : 'text-ink-muted hover:text-ink hover:bg-paper-muted'
              }`}
            >
              首頁總覽
            </button>
            <button
              type="button"
              onClick={() => setActiveView('browse')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeView === 'browse'
                  ? 'bg-csmu-light text-csmu'
                  : 'text-ink-muted hover:text-ink hover:bg-paper-muted'
              }`}
            >
              分類篩選瀏覽 ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveView('wanted')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                activeView === 'wanted'
                  ? 'bg-csmu-light text-csmu'
                  : 'text-ink-muted hover:text-ink hover:bg-paper-muted'
              }`}
            >
              <span>求購專區</span>
              <span className="px-1.5 py-0.2 rounded-full bg-terracotta/15 text-terracotta-dark font-mono text-[11px]">
                {wantedPosts.filter((w) => w.status === '徵求中').length}
              </span>
            </button>
          </nav>

          {/* Right Action Controls: Sell CTA, Chat Inbox, User Avatar Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Post Item Button (Desktop & Tablet; on Mobile also in Bottom Nav) */}
            <button
              type="button"
              onClick={() => {
                if (!currentUser || !currentUser.isGoogleVerified) {
                  setShowGoogleAuthModal(true);
                  return;
                }
                setEditingProduct(null);
                setShowListingModal(true);
              }}
              className="hidden sm:flex px-3.5 py-2 rounded-lg bg-csmu hover:bg-csmu-dark text-white text-xs sm:text-sm font-bold items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>我要上架 / 掃描 ISBN</span>
            </button>

            {/* Chat Inbox Button */}
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  setShowGoogleAuthModal(true);
                  return;
                }
                setShowChatModal(true);
              }}
              className="relative p-2 rounded-lg border border-paper-border bg-paper hover:border-csmu text-ink transition-colors"
              title="站內私訊訊息匣"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-terracotta text-white font-mono text-[10px] font-bold flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* User Avatar & Dropdown Menu */}
            <div className="relative">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                  className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-2 sm:pl-1.5 sm:pr-2.5 py-1 rounded-full border border-paper-border bg-paper hover:border-csmu transition-colors"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-csmu/40"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-ink leading-none">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-csmu font-medium leading-tight mt-0.5">
                      {currentUser.isGoogleVerified ? '✓ Google 已驗證' : '未驗證買家'}
                    </p>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowGoogleAuthModal(true)}
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-paper-border bg-paper hover:border-csmu text-xs font-bold text-ink flex items-center gap-1"
                >
                  <User className="w-4 h-4 text-csmu" />
                  <span>登入</span>
                </button>
              )}

              {/* Avatar Dropdown Menu */}
              {showAvatarMenu && currentUser && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-paper-card border border-paper-border shadow-2xl py-2 z-50 text-xs">
                  <div className="px-4 py-2.5 border-b border-paper-border">
                    <p className="font-bold text-sm text-ink">{currentUser.nickname}</p>
                    <p className="font-mono text-ink-muted text-[11px]">
                      {currentUser.email}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-csmu font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>
                        {currentUser.isGoogleVerified
                          ? '具備買家＋賣家完整權限'
                          : '目前僅具買家權限'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPersonalTab('listings');
                        setActiveView('personal');
                        setShowAvatarMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-paper-muted flex items-center justify-between font-medium text-ink"
                    >
                      <span>📦 我的管理（上架中 / 已售出 / 追蹤清單）</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowChatModal(true);
                        setShowAvatarMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-paper-muted flex items-center justify-between font-medium text-ink"
                    >
                      <span>💬 私訊訊息匣</span>
                      <span className="px-1.5 py-0.5 rounded bg-terracotta text-white font-mono text-[10px]">
                        {chats.length} 筆對話
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPersonalTab('subscriptions');
                        setActiveView('personal');
                        setShowAvatarMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-paper-muted flex items-center justify-between font-medium text-ink"
                    >
                      <span>🔔 關鍵字訂閱 ＆ 註冊信箱通知</span>
                      <span className="px-1.5 py-0.5 rounded bg-csmu-light text-csmu font-mono text-[10px]">
                        {emailLogs.length} 封信
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPersonalTab('settings');
                        setActiveView('personal');
                        setShowAvatarMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-paper-muted flex items-center justify-between font-medium text-ink"
                    >
                      <span>⚙️ 個人設定、Google 身分驗證狀態</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInspectedUserId(currentUser.id);
                        setShowAvatarMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-paper-muted flex items-center justify-between font-medium text-csmu"
                    >
                      <span>👤 瀏覽個人頁面（公開評價與檔案）</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Role / Persona Switcher for Testing */}
                  <div className="px-4 py-2 border-t border-paper-border bg-paper/60 space-y-1.5">
                    <p className="text-[11px] font-bold text-ink-muted">
                      快速切換測試身分（檢視不同評價與權限）：
                    </p>
                    <div className="grid grid-cols-1 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentUserId('u-me');
                          setShowAvatarMenu(false);
                          showToast('已切換為：林宥辰（醫學四・4.9★ 好評賣家）');
                        }}
                        className={`px-2.5 py-1 rounded text-left text-[11px] font-medium ${
                          currentUserId === 'u-me'
                            ? 'bg-csmu text-white'
                            : 'bg-paper-card border border-paper-border'
                        }`}
                      >
                        1. 林宥辰（醫四・已完成驗證・4.9★）
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentUserId('u-6');
                          setShowAvatarMenu(false);
                          showToast('已切換為：王冠廷（心理一・新帳號顯示「未評分」）');
                        }}
                        className={`px-2.5 py-1 rounded text-left text-[11px] font-medium ${
                          currentUserId === 'u-6'
                            ? 'bg-csmu text-white'
                            : 'bg-paper-card border border-paper-border'
                        }`}
                      >
                        2. 王冠廷（心理一・顯示「未評分」狀態）
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowGoogleAuthModal(true);
                          setShowAvatarMenu(false);
                        }}
                        className="px-2.5 py-1 rounded text-left text-[11px] font-medium bg-paper-card border border-paper-border hover:border-csmu"
                      >
                        🔐 開啟 Google 校內信箱驗證視窗
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Search Bar & Hot Keywords Strip (頂部搜尋列與熱門關鍵字) */}
        {(activeView === 'home' || activeView === 'browse') && (
          <div className="bg-paper border-t border-paper-border py-2 sm:py-3 px-3 sm:px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-3">
              {/* Search Input */}
              <div className="relative flex-1 max-w-2xl">
                <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeView === 'home' && e.target.value.trim()) {
                      setActiveView('browse');
                    }
                  }}
                  placeholder="搜尋教科書、ISBN、聽診器、小冰箱..."
                  className="w-full pl-9 pr-14 py-1.5 sm:py-2 rounded-lg border border-paper-border bg-paper-card text-xs sm:text-sm text-ink focus:outline-none focus:border-csmu"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted hover:text-ink"
                  >
                    清除
                  </button>
                )}
              </div>

              {/* Hot Keywords */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-[11px] sm:text-xs">
                <span className="text-ink-faint font-semibold shrink-0">
                  熱門：
                </span>
                {HOT_KEYWORDS.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => {
                      if (kw === '免費漂書') {
                        setSelectedCategory('general_book');
                        setOnlyBookCrossingOrFree(true);
                        setSearchQuery('');
                      } else {
                        setSearchQuery(kw.replace('Netter', '').replace('OSCE', '').replace('大慶退宿', '').replace('好市多', ''));
                      }
                      setActiveView('browse');
                    }}
                    className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-paper-card hover:bg-csmu-light border border-paper-border hover:border-csmu text-ink-muted hover:text-csmu-dark font-medium shrink-0 transition-colors"
                  >
                    #{kw}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-5 right-3 sm:right-5 left-3 sm:left-auto z-50 max-w-md px-4 py-3 rounded-xl bg-ink text-white text-xs font-bold shadow-2xl border border-stone-700 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 sm:space-y-8">
        {/* ==================== VIEW 1: HOME (首頁) ==================== */}
        {activeView === 'home' && (
          <>
            {/* 1. Carousel Announcement Banner (輪播公告欄：校園活動、公益二手書募集、平台防詐提醒) */}
            {currentBanner && (
              <section className="relative rounded-xl overflow-hidden border border-paper-border shadow-card">
                <div
                  className={`p-4 sm:p-8 transition-colors ${
                    currentBanner.theme === 'forest'
                      ? 'bg-[#174939] text-white'
                      : currentBanner.theme === 'amber'
                      ? 'bg-[#6E3B1E] text-white'
                      : 'bg-[#232624] text-white'
                  }`}
                >
                  <div className="max-w-3xl space-y-2 sm:space-y-3">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="px-2 py-0.5 rounded bg-white/15 text-amber-200 text-[11px] sm:text-xs font-bold tracking-wide">
                        📢 {currentBanner.tag}
                      </span>
                      <span className="text-[11px] sm:text-xs font-mono text-stone-300 truncate max-w-full">
                        {currentBanner.metaInfo}
                      </span>
                    </div>

                    <h2 className="font-serif text-base sm:text-2xl font-bold leading-snug">
                      {currentBanner.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-stone-200 leading-relaxed line-clamp-2 sm:line-clamp-none">
                      {currentBanner.summary}
                    </p>

                    <div className="pt-1.5 sm:pt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleBannerAction(currentBanner)}
                        className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white text-ink hover:bg-amber-100 text-xs font-bold transition-colors shadow-sm shrink-0"
                      >
                        {currentBanner.ctaLabel} →
                      </button>

                      {/* Carousel Dots & Prev/Next Controls */}
                      <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={() =>
                            setBannerIdx(
                              (prev) =>
                                (prev - 1 + announcements.length) %
                                announcements.length
                            )
                          }
                          className="p-1 sm:p-1.5 rounded bg-white/10 hover:bg-white/20 text-white"
                          title="上一則公告"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {announcements.map((ann, idx) => (
                          <button
                            key={ann.id}
                            type="button"
                            onClick={() => setBannerIdx(idx)}
                            className={`transition-all ${
                              bannerIdx === idx
                                ? 'bg-white text-ink font-bold px-2 py-0.5 sm:py-1 rounded text-[11px]'
                                : 'bg-white/20 text-stone-300 hover:bg-white/30 w-2 h-2 sm:w-auto sm:h-auto sm:px-2 sm:py-1 rounded-full sm:rounded text-[11px]'
                            }`}
                          >
                            <span className={bannerIdx === idx ? 'inline' : 'hidden sm:inline'}>
                              {ann.tag}
                            </span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setBannerIdx((prev) => (prev + 1) % announcements.length)
                          }
                          className="p-1 sm:p-1.5 rounded bg-white/10 hover:bg-white/20 text-white"
                          title="下一則公告"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 2. Popular Category Quick Entry (熱門分類快捷入口：手機版橫向滑動不佔高度、電腦版 8 欄網格) */}
            <section className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-base sm:text-lg font-bold text-ink">
                  熱門結構化分類快捷入口
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveView('browse')}
                  className="text-xs font-bold text-csmu hover:underline"
                >
                  多重篩選器 →
                </button>
              </div>

              <div className="flex overflow-x-auto no-scrollbar gap-2.5 pb-1 sm:grid sm:grid-cols-4 lg:grid-cols-8">
                {CATEGORY_CONFIGS.map((cat) => {
                  const count = products.filter((p) => p.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleQuickCategoryClick(cat.id)}
                      className="min-w-[132px] sm:min-w-0 p-3 sm:p-3.5 rounded-xl bg-paper-card border border-paper-border hover:border-csmu hover:shadow-subtle text-left flex flex-col justify-between gap-1.5 sm:gap-2 transition-all group shrink-0"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-csmu group-hover:translate-x-0.5 transition-transform">
                          {cat.shortName}
                        </span>
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-paper-muted text-ink-muted">
                          {count}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-muted line-clamp-1 sm:line-clamp-2 leading-tight">
                        {cat.subCategories
                          .slice(0, 2)
                          .map((s) => s.name.split(' ')[0])
                          .join('、')}
                      </p>
                    </button>
                  );
                })}

                {/* 8th Card: Wanted Board Entry */}
                <button
                  type="button"
                  onClick={() => setActiveView('wanted')}
                  className="min-w-[132px] sm:min-w-0 p-3 sm:p-3.5 rounded-xl bg-terracotta-light/60 border border-terracotta/30 hover:border-terracotta text-left flex flex-col justify-between gap-1.5 sm:gap-2 transition-all group shrink-0"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-terracotta-dark">
                      求購徵求專區
                    </span>
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-terracotta text-white">
                      {wantedPosts.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-terracotta-dark/80 line-clamp-1 sm:line-clamp-2 leading-tight">
                    徵書/徵物・賣家主動報價
                  </p>
                </button>
              </div>
            </section>

            {/* 3. Urgent Sale / Price Drop Zone (急售 / 降價專區) */}
            <section
              id="urgent-zone"
              className="p-3.5 sm:p-6 rounded-xl bg-[#F4ECE4] border border-[#E0CFC1] space-y-3 sm:space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 border-b border-[#E0CFC1] pb-2.5 sm:pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-terracotta text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 shrink-0">
                    <Flame className="w-3.5 h-3.5" />
                    急售 / 降價
                  </span>
                  <h2 className="font-serif text-sm sm:text-lg font-bold text-ink truncate">
                    畢業退宿出清・實習前降價・即期惜食拆售
                  </h2>
                </div>
                <span className="text-[11px] sm:text-xs text-ink-muted hidden sm:inline">
                  食品與保養品自動檢核效期，30 天內自動標註「⚠️ 即期警示標籤」
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {urgentProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    seller={users.find((u) => u.id === prod.sellerId)}
                    onSelect={setSelectedProduct}
                    onToggleLike={handleToggleLike}
                    onOpenSellerProfile={(sid, e) => {
                      e.stopPropagation();
                      setInspectedUserId(sid);
                    }}
                  />
                ))}
              </div>
            </section>

            {/* 4. Book Crossing & Academic Affairs 3C Charity Banner */}
            <section className="p-4 sm:p-5 rounded-xl bg-csmu-light/70 border border-csmu/30 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-csmu text-white text-[11px] sm:text-xs font-bold">
                    特色公益專區
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-csmu-dark">
                    🌱 學校/社團二手課外書免費漂書 ＆ 教務處 3C 物資免費贈送
                  </h3>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  匯集張啟華紀念圖書館漂書角與教務處畢業學長姐捐贈之工程計算機、護眼檯燈，提供本校在學同學 $0 免費索取傳承。
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setOnlyBookCrossingOrFree(true);
                    setActiveView('browse');
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-csmu hover:bg-csmu-dark text-white text-xs font-bold text-center"
                >
                  查看所有 $0 免費贈與 / 漂書 ({products.filter((p) => p.price === 0).length} 件) →
                </button>
              </div>
            </section>

            {/* 5. Latest Listed Products Section (最新上架商品區) */}
            <section className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-paper-border pb-2.5 sm:pb-3">
                <div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-ink">
                    最新上架商品區
                  </h2>
                  <p className="text-[11px] sm:text-xs text-ink-muted">
                    點擊商品卡可檢視多張實拍圖、科目版次、有效期限、賣家誠信評價與公開問與答
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg border border-paper-border bg-paper-card text-xs font-semibold text-ink"
                  >
                    <option value="latest">排序：最新上架</option>
                    <option value="price_asc">排序：價格低至高</option>
                    <option value="price_desc">排序：價格高至低</option>
                    <option value="most_liked">排序：最多人關注</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setActiveView('browse')}
                    className="px-3.5 py-1.5 rounded-lg bg-ink text-white text-xs font-bold hover:bg-csmu transition-colors shrink-0"
                  >
                    進階篩選
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    seller={users.find((u) => u.id === prod.sellerId)}
                    onSelect={setSelectedProduct}
                    onToggleLike={handleToggleLike}
                    onOpenSellerProfile={(sid, e) => {
                      e.stopPropagation();
                      setInspectedUserId(sid);
                    }}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {/* ==================== VIEW 2: CATEGORY & MULTI-FILTER EXPLORER (分類瀏覽頁) ==================== */}
        {activeView === 'browse' && (
          <section className="space-y-4 sm:space-y-6">
            {/* Multi-Filter Panel (電腦版完整展開、手機版精簡橫向分類＋可收合進階篩選) */}
            <div className="p-3.5 sm:p-5 rounded-xl bg-paper-card border border-paper-border shadow-subtle space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-paper-border pb-2.5 sm:pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <SlidersHorizontal className="w-4 h-4 text-csmu shrink-0" />
                  <h2 className="text-sm sm:text-base font-bold text-ink truncate">
                    分類瀏覽與多重篩選器
                  </h2>
                  <span className="text-xs text-ink-muted hidden lg:inline">
                    （支援分類/科系、價格區間、新舊程度、校園交易地點交叉篩選）
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Mobile Toggle Button for Detailed Filters */}
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="md:hidden px-2.5 py-1 rounded bg-csmu-light text-csmu text-xs font-bold flex items-center gap-1"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>
                      {showMobileFilters ? '收起篩選' : `進階篩選${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-2.5 py-1 rounded border border-paper-border hover:border-ink text-xs font-semibold text-ink-muted hover:text-ink flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">重設所有篩選條件</span>
                    <span className="sm:hidden">重設</span>
                  </button>
                </div>
              </div>

              {/* Filter Row 1: Main Categories (Swipeable single row on mobile, wrap on desktop) */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-ink-muted hidden sm:block">
                  1. 商品大分類：
                </span>
                <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap gap-1.5 pb-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSubCategory('全部');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border shrink-0 transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-csmu text-white border-csmu'
                        : 'bg-paper text-ink-muted border-paper-border hover:border-csmu'
                    }`}
                  >
                    全部分類 ({products.length})
                  </button>
                  {CATEGORY_CONFIGS.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedSubCategory('全部');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border shrink-0 transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-csmu text-white border-csmu'
                          : 'bg-paper text-ink-muted border-paper-border hover:border-csmu'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Row 1.5: Subcategories */}
              {selectedCategory !== 'all' && (
                <div className="p-2.5 sm:p-3 rounded-lg bg-paper border border-paper-border space-y-1.5">
                  <span className="text-xs font-bold text-csmu block">
                    細分科系 / 子分類：
                  </span>
                  <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap gap-1.5 pb-0.5">
                    <button
                      type="button"
                      onClick={() => setSelectedSubCategory('全部')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold border shrink-0 ${
                        selectedSubCategory === '全部'
                          ? 'bg-ink text-white border-ink'
                          : 'bg-paper-card text-ink-muted border-paper-border'
                      }`}
                    >
                      全部子分類
                    </button>
                    {CATEGORY_CONFIGS.find(
                      (c) => c.id === selectedCategory
                    )?.subCategories.map((sub) => (
                      <button
                        key={sub.name}
                        type="button"
                        onClick={() => setSelectedSubCategory(sub.name)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold border shrink-0 ${
                          selectedSubCategory === sub.name
                            ? 'bg-ink text-white border-ink'
                            : 'bg-paper-card text-ink-muted border-paper-border hover:border-ink'
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Compact Mobile Sort & Result Summary Bar (when detailed filters are collapsed) */}
              {!showMobileFilters && (
                <div className="flex md:hidden items-center justify-between gap-2 pt-1 text-xs">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-2.5 py-1.5 rounded border border-csmu bg-csmu-light/40 text-xs font-bold text-csmu-dark"
                  >
                    <option value="latest">排序：最新上架</option>
                    <option value="price_asc">排序：價格低至高</option>
                    <option value="price_desc">排序：價格高至低</option>
                    <option value="most_liked">排序：最多人關注</option>
                  </select>
                  <span className="font-mono text-ink-muted">
                    共 <strong className="text-ink">{filteredProducts.length}</strong> 件商品
                  </span>
                </div>
              )}

              {/* Filter Row 2 & 3: Detailed Filters (Always visible on md+, collapsible on mobile) */}
              <div className={`${showMobileFilters ? 'block' : 'hidden md:block'} space-y-3`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  {/* Price Range */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-ink-muted">
                      2. 價格區間 (NT$)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="最低價"
                        className="w-full px-2.5 py-1.5 rounded border border-paper-border bg-paper text-xs font-mono"
                      />
                      <span className="text-ink-faint">–</span>
                      <input
                        type="number"
                        min={0}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="最高價"
                        className="w-full px-2.5 py-1.5 rounded border border-paper-border bg-paper text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Condition */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-ink-muted">
                      3. 新舊程度
                    </label>
                    <select
                      value={selectedCondition}
                      onChange={(e) =>
                        setSelectedCondition(e.target.value as '全部' | ItemCondition)
                      }
                      className="w-full px-3 py-1.5 rounded border border-paper-border bg-paper text-xs font-medium"
                    >
                      <option value="全部">全部新舊程度</option>
                      <option value="全新未拆">全新未拆</option>
                      <option value="九成新">九成新</option>
                      <option value="八成新">八成新</option>
                      <option value="有使用痕跡/畫記">有使用痕跡/畫記</option>
                    </select>
                  </div>

                  {/* Meetup Location */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-ink-muted">
                      4. 校園交易地點
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) =>
                        setSelectedLocation(e.target.value as '全部' | MeetupLocation)
                      }
                      className="w-full px-3 py-1.5 rounded border border-paper-border bg-paper text-xs font-medium"
                    >
                      <option value="全部">全部中山醫面交地點</option>
                      {CSMU_MEETUP_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Select */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-ink-muted">
                      5. 排序方式
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full px-3 py-1.5 rounded border border-csmu bg-csmu-light/40 text-xs font-bold text-csmu-dark"
                    >
                      <option value="latest">最新上架</option>
                      <option value="price_asc">價格低至高</option>
                      <option value="price_desc">價格高至低</option>
                      <option value="most_liked">最多人關注 (收藏數)</option>
                    </select>
                  </div>
                </div>

                {/* Filter Row 3: Quick Checkboxes */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-5 pt-2 border-t border-paper-border text-xs">
                  <label className="flex items-center gap-1.5 font-semibold text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyActiveStatus}
                      onChange={(e) => setOnlyActiveStatus(e.target.checked)}
                      className="rounded text-csmu focus:ring-csmu"
                    />
                    <span>僅顯示「上架中」</span>
                  </label>

                  <label className="flex items-center gap-1.5 font-semibold text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyNegotiable}
                      onChange={(e) => setOnlyNegotiable(e.target.checked)}
                      className="rounded text-csmu focus:ring-csmu"
                    />
                    <span>僅看「可議價」</span>
                  </label>

                  <label className="flex items-center gap-1.5 font-semibold text-csmu-dark cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyBookCrossingOrFree}
                      onChange={(e) => setOnlyBookCrossingOrFree(e.target.checked)}
                      className="rounded text-csmu focus:ring-csmu"
                    />
                    <span>🌱 僅看「免費漂書 / 公益贈送 ($0)」</span>
                  </label>

                  <span className="ml-auto font-mono text-ink-muted">
                    共篩選出 <strong className="text-ink">{filteredProducts.length}</strong> 件商品
                  </span>
                </div>
              </div>
            </div>

            {/* Filtered Results Grid */}
            {filteredProducts.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-xl bg-paper-card border border-dashed border-paper-border text-center space-y-3">
                <p className="text-sm sm:text-base font-bold text-ink">
                  沒有找到符合目前篩選條件的商品
                </p>
                <p className="text-xs text-ink-muted">
                  您可以放寬篩選條件、設定「關鍵字訂閱」讓系統在到貨時自動寄信給您，或前往「求購專區」主動張貼需求！
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-lg border border-paper-border bg-paper text-xs font-bold"
                  >
                    清除篩選條件
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('wanted')}
                    className="px-4 py-2 rounded-lg bg-csmu text-white text-xs font-bold"
                  >
                    前往求購專區發布需求
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    seller={users.find((u) => u.id === prod.sellerId)}
                    onSelect={setSelectedProduct}
                    onToggleLike={handleToggleLike}
                    onOpenSellerProfile={(sid, e) => {
                      e.stopPropagation();
                      setInspectedUserId(sid);
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ==================== VIEW 3: WANTED BOARD (求購專區) ==================== */}
        {activeView === 'wanted' && (
          <WantedBoardView
            wantedPosts={wantedPosts}
            currentUser={currentUser}
            onAddWantedPost={(postData) => {
              if (!currentUser) return;
              const nextPost: WantedPost = {
                ...postData,
                id: `w-${Date.now()}`,
                requesterId: currentUser.id,
                requesterName: currentUser.name,
                requesterDept: currentUser.department,
                createdAt: '2026-11-10 剛剛',
                status: '徵求中',
                responsesCount: 0,
              };
              setWantedPosts((prev) => [nextPost, ...prev]);
              showToast('✓ 已刊登求購需求！若有賣家回應將同步寄送通知至您的校內信箱。');
            }}
            onRespondToWanted={(post) => {
              if (!currentUser) {
                setShowGoogleAuthModal(true);
                return;
              }
              setWantedPosts((prev) =>
                prev.map((w) =>
                  w.id === post.id
                    ? { ...w, responsesCount: w.responsesCount + 1 }
                    : w
                )
              );
              showToast(
                `💬 已向求購人「${post.requesterName}」發送站內私訊與信箱通知！`
              );
              setShowChatModal(true);
            }}
            onMarkWantedFulfilled={(postId) => {
              setWantedPosts((prev) =>
                prev.map((w) =>
                  w.id === postId ? { ...w, status: '已徵得' } : w
                )
              );
              showToast('✓ 已將求購需求標記為「已徵得」！');
            }}
            onRequireLogin={() => setShowGoogleAuthModal(true)}
          />
        )}

        {/* ==================== VIEW 4: PERSONAL CENTER (個人資訊與管理) ==================== */}
        {activeView === 'personal' && currentUser && (
          <PersonalCenterView
            currentUser={currentUser}
            allProducts={products}
            allUsers={users}
            subscriptions={subscriptions}
            emailLogs={emailLogs}
            initialTab={personalTab}
            onSelectProduct={setSelectedProduct}
            onToggleLike={handleToggleLike}
            onChangeProductStatus={handleChangeProductStatus}
            onEditProduct={(prod) => {
              setEditingProduct(prod);
              setShowListingModal(true);
            }}
            onOpenNewListing={() => {
              setEditingProduct(null);
              setShowListingModal(true);
            }}
            onOpenPublicProfile={(uid) => setInspectedUserId(uid)}
            onAddSubscription={(keyword, categoryFilter) => {
              const newSub: KeywordSubscription = {
                id: `sub-${Date.now()}`,
                keyword,
                categoryFilter,
                email: currentUser.email,
                createdAt: '2026-11-10',
                matchedProductIds: [],
              };
              setSubscriptions((prev) => [newSub, ...prev]);
              showToast(
                `🔔 已新增關鍵字「${keyword}」訂閱！有賣家上架將自動寄信至 ${currentUser.email}`
              );
            }}
            onRemoveSubscription={(subId) => {
              setSubscriptions((prev) => prev.filter((s) => s.id !== subId));
              showToast('已移除關鍵字訂閱');
            }}
            onUpdateProfile={(nickname, department) => {
              setUsers((prev) =>
                prev.map((u) =>
                  u.id === currentUser.id ? { ...u, nickname, department } : u
                )
              );
            }}
            onToggleGoogleVerify={() => {
              setUsers((prev) =>
                prev.map((u) =>
                  u.id === currentUser.id
                    ? { ...u, isGoogleVerified: !u.isGoogleVerified }
                    : u
                )
              );
              showToast('已切換 Google 校內帳號驗證狀態！');
            }}
          />
        )}

        {/* ==================== VIEW 5: ADMIN DASHBOARD (後台管理系統) ==================== */}
        {activeView === 'admin' && (
          <AdminDashboardView
            reports={reports}
            users={users}
            products={products}
            announcements={announcements}
            onForceUnlistProduct={(productId, reportId) => {
              setProducts((prev) =>
                prev.map((p) =>
                  p.id === productId ? { ...p, status: '已下架' } : p
                )
              );
              if (reportId) {
                setReports((prev) =>
                  prev.map((r) =>
                    r.id === reportId ? { ...r, status: '已強制下架商品' } : r
                  )
                );
              }
              showToast('⛔ 已強制下架該違規商品！');
            }}
            onUpdateUserAccountStatus={(userId, status, warningNote, reportId) => {
              setUsers((prev) =>
                prev.map((u) =>
                  u.id === userId
                    ? { ...u, accountStatus: status, warningNote }
                    : u
                )
              );
              if (reportId) {
                setReports((prev) =>
                  prev.map((r) =>
                    r.id === reportId ? { ...r, status: '已記警告/停權' } : r
                  )
                );
              }
              showToast(`✓ 已將該帳號狀態更新為「${status}」`);
            }}
            onResolveReport={(reportId, status) => {
              setReports((prev) =>
                prev.map((r) => (r.id === reportId ? { ...r, status } : r))
              );
              showToast('✓ 檢舉案件已更新為結案');
            }}
            onAddAnnouncement={(annData) => {
              const nextAnn: AnnouncementBanner = {
                ...annData,
                id: `ann-${Date.now()}`,
              };
              setAnnouncements((prev) => [nextAnn, ...prev]);
              setBannerIdx(0);
              showToast('📢 已發布全站廣播公告，並已同步至首頁輪播欄第一則！');
            }}
            onDeleteAnnouncement={(annId) => {
              setAnnouncements((prev) => prev.filter((a) => a.id !== annId));
              setBannerIdx(0);
              showToast('已移除該則輪播公告');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-paper-muted border-t border-paper-border mt-12 py-8 px-4 text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-bold text-ink">
              大慶拾物所｜中山醫學大學二手交換平台
            </h3>
            <p className="leading-relaxed">
              專為中山醫四大學院與附設醫院實習生打造的校園無金流二手教材、宿舍家電與公益漂書交流站。
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-ink">推薦校園公開面交點</h4>
            <ul className="space-y-1">
              <li>• 正心樓一樓郵局前 / 中庭廣場</li>
              <li>• 誠愛樓一樓大廳入口</li>
              <li>• 張啟華紀念圖書館 1F 漂書角</li>
              <li>• 杏樓（學生餐廳 / 宿舍門口）</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-ink">平台規範與效期檢核</h4>
            <ul className="space-y-1">
              <li>• 食品與彩妝保養品強制標註有效期限</li>
              <li>• 過期商品系統自動攔截禁止上架</li>
              <li>• 嚴禁加價黃牛票券、處方藥品與菸酒</li>
              <li>• 私訊含外部連結自動觸發防詐警示</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-ink">快速功能捷徑</h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setShowListingModal(true);
                }}
                className="px-2.5 py-1 rounded bg-paper-card border border-paper-border hover:border-csmu text-ink"
              >
                📷 ISBN 掃描上架
              </button>
              <button
                type="button"
                onClick={() => {
                  setPersonalTab('subscriptions');
                  setActiveView('personal');
                }}
                className="px-2.5 py-1 rounded bg-paper-card border border-paper-border hover:border-csmu text-ink"
              >
                🔔 關鍵字信箱訂閱
              </button>
              <button
                type="button"
                onClick={() => setShowSafetyModal(true)}
                className="px-2.5 py-1 rounded bg-paper-card border border-paper-border hover:border-csmu text-ink"
              >
                🛡️ 防詐面交守則
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation Bar (手機版專屬底部導覽列，徹底解決頂部擁擠問題) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper-card/95 backdrop-blur-md border-t border-paper-border px-2 py-1.5 grid grid-cols-5 items-center shadow-2xl">
        <button
          type="button"
          onClick={() => {
            setActiveView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 gap-0.5 rounded-lg text-[11px] font-bold transition-colors ${
            activeView === 'home' ? 'text-csmu' : 'text-ink-muted'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>首頁</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveView('browse');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 gap-0.5 rounded-lg text-[11px] font-bold transition-colors ${
            activeView === 'browse' ? 'text-csmu' : 'text-ink-muted'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>分類篩選</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!currentUser || !currentUser.isGoogleVerified) {
              setShowGoogleAuthModal(true);
              return;
            }
            setEditingProduct(null);
            setShowListingModal(true);
          }}
          className="flex flex-col items-center justify-center -mt-3 py-2 px-2 rounded-xl bg-csmu text-white text-[11px] font-bold shadow-md border border-csmu-dark"
        >
          <Barcode className="w-4 h-4" />
          <span>上架/掃書</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveView('wanted');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`relative flex flex-col items-center justify-center py-1 gap-0.5 rounded-lg text-[11px] font-bold transition-colors ${
            activeView === 'wanted' ? 'text-csmu' : 'text-ink-muted'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>求購專區</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!currentUser) {
              setShowGoogleAuthModal(true);
              return;
            }
            setActiveView('personal');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 gap-0.5 rounded-lg text-[11px] font-bold transition-colors ${
            activeView === 'personal' ? 'text-csmu' : 'text-ink-muted'
          }`}
        >
          <User className="w-4 h-4" />
          <span>我的管理</span>
        </button>
      </nav>

      {/* ==================== MODALS ==================== */}

      {/* 1. Product Detail Modal (商品卡詳細頁) */}
      {liveSelectedProduct && (
        <ProductDetailModal
          product={liveSelectedProduct}
          seller={
            users.find((u) => u.id === liveSelectedProduct.sellerId) || users[0]
          }
          currentUser={currentUser}
          allProducts={products}
          allUsers={users}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={setSelectedProduct}
          onToggleLike={handleToggleLike}
          onStartChat={handleStartChat}
          onOpenSellerProfile={(sid) => setInspectedUserId(sid)}
          onAddQuestion={handleAddQuestion}
          onReplyQuestion={handleReplyQuestion}
          onChangeStatus={handleChangeProductStatus}
          onEditProduct={(prod) => {
            setSelectedProduct(null);
            setEditingProduct(prod);
            setShowListingModal(true);
          }}
          onOpenReport={(targetType, prod) => {
            setReportModalState({
              targetType,
              product: prod,
              reportedUser: users.find((u) => u.id === prod.sellerId),
            });
          }}
          onRequireLogin={() => setShowGoogleAuthModal(true)}
        />
      )}

      {/* 2. Listing Form Modal (商品上架 / 編輯 / ISBN 條碼掃描 / 效期檢查) */}
      {showListingModal && (
        <ListingFormModal
          initialProduct={editingProduct}
          onClose={() => {
            setShowListingModal(false);
            setEditingProduct(null);
          }}
          onSaveProduct={handleSaveProduct}
        />
      )}

      {/* 3. Chat Drawer Modal (站內私訊與溝通) */}
      {showChatModal && currentUser && (
        <ChatDrawerModal
          threads={chats}
          activeThreadId={activeChatThreadId}
          currentUser={currentUser}
          allProducts={products}
          allUsers={users}
          onSelectThread={setActiveChatThreadId}
          onClose={() => setShowChatModal(false)}
          onSendMessage={handleSendMessage}
          onChangeProductStatus={handleChangeProductStatus}
          onOpenProductDetail={(prod) => {
            setShowChatModal(false);
            setSelectedProduct(prod);
          }}
          onOpenReviewModal={(prod, partner, tid) => {
            setReviewModalState({
              product: prod,
              targetUser: partner,
              threadId: tid,
            });
          }}
          onOpenReportModal={(targetType, prod, reportedUser) => {
            setReportModalState({ targetType, product: prod, reportedUser });
          }}
        />
      )}

      {/* 4. Public Seller/User Profile Modal (瀏覽個人檔案與歷史評價) */}
      {inspectedUserId && (
        <UserProfileModal
          user={users.find((u) => u.id === inspectedUserId) || users[0]}
          allProducts={products}
          onClose={() => setInspectedUserId(null)}
          onSelectProduct={setSelectedProduct}
        />
      )}

      {/* 5. Mutual Review & Dispute Modal (交易完成互評 & 未完成交易守時紀錄) */}
      {reviewModalState && currentUser && (
        <MutualReviewModal
          product={reviewModalState.product}
          targetUser={reviewModalState.targetUser}
          currentUser={currentUser}
          onClose={() => setReviewModalState(null)}
          onSubmitReview={handleSubmitReview}
          onSubmitDisputeReport={(prod, targetUser, reason, details) => {
            handleSubmitReport(
              '面交放鳥/未完成交易爭議',
              reason,
              details,
              prod,
              targetUser
            );
          }}
        />
      )}

      {/* 6. One-Click Report Modal (一鍵檢舉視窗) */}
      {reportModalState && (
        <ReportModal
          targetType={reportModalState.targetType}
          product={reportModalState.product}
          reportedUser={reportModalState.reportedUser}
          onClose={() => setReportModalState(null)}
          onSubmitReport={(reason, desc) => {
            handleSubmitReport(
              reportModalState.targetType,
              reason,
              desc,
              reportModalState.product,
              reportModalState.reportedUser
            );
          }}
        />
      )}

      {/* 7. Campus Safety Guide Modal */}
      {showSafetyModal && (
        <SafetyGuideModal onClose={() => setShowSafetyModal(false)} />
      )}

      {/* 8. Google Workspace (@csmu.edu.tw) Account Verification Modal */}
      {showGoogleAuthModal && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-paper-card border border-paper-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-paper-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-csmu" />
                <h3 className="text-base font-bold text-ink">
                  中山醫學大學 Google 帳號驗證
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleAuthModal(false)}
                className="text-xs text-ink-muted hover:text-ink"
              >
                關閉
              </button>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              為確保校園二手交易安全與誠信，本平台採用{' '}
              <strong className="text-ink">
                CSMU Google Workspace (@csmu.edu.tw / @live.csmu.edu.tw)
              </strong>{' '}
              單一簽入驗證。完成驗證後即可獲得完整「買家＋賣家上架」權限與「已完成驗證」誠信徽章。
            </p>

            <div className="space-y-2">
              {users.slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setCurrentUserId(u.id);
                    setUsers((prev) =>
                      prev.map((item) =>
                        item.id === u.id
                          ? { ...item, isGoogleVerified: true }
                          : item
                      )
                    );
                    setShowGoogleAuthModal(false);
                    showToast(`✓ 已透過 Google 驗證登入：${u.name} (${u.email})`);
                  }}
                  className="w-full p-3 rounded-lg bg-paper hover:bg-csmu-light/60 border border-paper-border hover:border-csmu flex items-center gap-3 text-left transition-colors"
                >
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-ink">
                      使用 {u.name} 的校內 Google 帳號繼續
                    </p>
                    <p className="text-[11px] font-mono text-ink-muted">
                      {u.email}｜{u.department}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;

