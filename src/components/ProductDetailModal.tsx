import React, { useState } from 'react';
import {
  X,
  Heart,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  MessageSquare,
  Flag,
  Star,
  BookOpen,
  Calendar,
  Package,
  Edit3,
  CheckCircle2,
  Send,
  Sparkles,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { ListingStatus, Product, UserProfile } from '../types';
import { formatPrice, getExpiryStatus } from '../utils/helpers';
import { CATEGORY_CONFIGS } from '../data/csmuData';

interface ProductDetailModalProps {
  product: Product;
  seller: UserProfile;
  currentUser: UserProfile | null;
  allProducts: Product[];
  allUsers: UserProfile[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onToggleLike: (productId: string, e: React.MouseEvent) => void;
  onStartChat: (product: Product) => void;
  onOpenSellerProfile: (sellerId: string) => void;
  onAddQuestion: (productId: string, questionText: string) => void;
  onReplyQuestion: (productId: string, qaId: string, replyText: string) => void;
  onChangeStatus: (productId: string, newStatus: ListingStatus, soldToBuyerId?: string) => void;
  onEditProduct: (product: Product) => void;
  onOpenReport: (targetType: '商品檢舉', product: Product) => void;
  onRequireLogin: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  seller,
  currentUser,
  allProducts,
  allUsers,
  onClose,
  onSelectProduct,
  onToggleLike,
  onStartChat,
  onOpenSellerProfile,
  onAddQuestion,
  onReplyQuestion,
  onChangeStatus,
  onEditProduct,
  onOpenReport,
  onRequireLogin,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [questionInput, setQuestionInput] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [selectedBuyerForSold, setSelectedBuyerForSold] = useState<string>(
    product.reservedForUserId || 'u-2'
  );
  const [showSoldConfirm, setShowSoldConfirm] = useState(false);

  const isMyProduct = currentUser?.id === product.sellerId;
  const expiry = getExpiryStatus(product.expiryDate);
  const categoryConfig = CATEGORY_CONFIGS.find((c) => c.id === product.category);

  // Seller's other active products
  const sellerOtherProducts = allProducts.filter(
    (p) => p.sellerId === seller.id && p.id !== product.id && p.status !== '已下架'
  );

  const potentialBuyers = allUsers.filter((u) => u.id !== product.sellerId);

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    if (!questionInput.trim()) return;
    onAddQuestion(product.id, questionInput.trim());
    setQuestionInput('');
  };

  const handleReplySubmit = (qaId: string) => {
    const text = replyInputs[qaId]?.trim();
    if (!text) return;
    onReplyQuestion(product.id, qaId, text);
    setReplyInputs((prev) => ({ ...prev, [qaId]: '' }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto">
      <div className="bg-paper-card border-t sm:border border-paper-border rounded-t-2xl sm:rounded-xl max-w-5xl w-full h-[94dvh] sm:h-auto sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden sm:my-auto">
        {/* Top Bar */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-paper border-b border-paper-border flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-ink-muted overflow-hidden">
            <span className="px-2 py-0.5 rounded bg-csmu-light text-csmu font-semibold shrink-0">
              {categoryConfig?.shortName || categoryConfig?.name}
            </span>
            <span>/</span>
            <span className="truncate font-medium text-ink">{product.subCategory}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onOpenReport('商品檢舉', product)}
              className="px-2 sm:px-2.5 py-1.5 rounded text-xs font-medium text-ink-muted hover:text-terracotta hover:bg-terracotta-light/60 flex items-center gap-1 transition-colors"
              title="檢舉違規商品"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>檢舉</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-paper-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 flex-1">
          {/* Seller Management Bar (Visible if currentUser is Seller) */}
          {isMyProduct && (
            <div className="p-4 rounded-lg bg-csmu-light/70 border border-csmu/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-csmu-dark">
                  <Edit3 className="w-4 h-4" />
                  <span>賣家商品管理控制台（這是您刊登的商品）</span>
                </div>
                <p className="text-xs text-ink-muted mt-0.5">
                  可隨時切換交易狀態；切換為「保留中」將暫停其他買家私訊，標記「已售出」將邀請買賣雙方進行 1~5 星互評。
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(['上架中', '保留中', '已下架'] as ListingStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onChangeStatus(product.id, st)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                      product.status === st
                        ? 'bg-csmu text-white border-csmu'
                        : 'bg-paper-card text-ink border-paper-border hover:border-csmu'
                    }`}
                  >
                    {st}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowSoldConfirm(!showSoldConfirm)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                    product.status === '已售出'
                      ? 'bg-terracotta text-white border-terracotta'
                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  標記「已售出」並互評
                </button>
                <button
                  type="button"
                  onClick={() => onEditProduct(product)}
                  className="px-3 py-1.5 rounded text-xs font-semibold bg-paper-card text-ink border border-paper-border hover:bg-paper-muted"
                >
                  編輯內容/圖片
                </button>
              </div>
            </div>
          )}

          {/* Sold Confirmation Sub-panel */}
          {isMyProduct && showSoldConfirm && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-950">
                  請選擇完成面交的買家，系統將自動下架商品並開啟「雙方互評視窗」：
                </p>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedBuyerForSold}
                    onChange={(e) => setSelectedBuyerForSold(e.target.value)}
                    className="px-3 py-1.5 rounded border border-amber-300 bg-white text-xs font-medium text-ink"
                  >
                    {potentialBuyers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}（{u.department}｜{u.studentIdMasked}）
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSoldConfirm(false);
                    onChangeStatus(product.id, '已售出', selectedBuyerForSold);
                  }}
                  className="px-3.5 py-1.5 rounded bg-terracotta text-white text-xs font-semibold hover:bg-terracotta-dark"
                >
                  確認售出 ＆ 立即評價買家
                </button>
                <button
                  type="button"
                  onClick={() => setShowSoldConfirm(false)}
                  className="px-2.5 py-1.5 rounded text-xs text-ink-muted hover:bg-amber-100"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* Main Grid: Left Gallery + Right Specs & Seller Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Image Gallery (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-paper-muted border border-paper-border">
                <img
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {activeImageIdx === 0 && (
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-ink/80 text-white text-[11px] font-medium">
                    首圖封面
                  </span>
                )}
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-ink/80 text-white text-xs font-mono">
                  {activeImageIdx + 1} / {product.images.length}
                </span>
              </div>

              {/* Thumbnail strip */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-16 h-16 rounded overflow-hidden border-2 shrink-0 transition-all ${
                        activeImageIdx === idx
                          ? 'border-csmu ring-2 ring-csmu/20'
                          : 'border-paper-border opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-csmu/90 text-white text-[9px] text-center">
                          首圖
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Anti-Fraud Campus Safety Notice Box */}
              <div className="p-3.5 rounded-lg bg-paper border border-paper-border space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <ShieldAlert className="w-4 h-4 text-terracotta shrink-0" />
                  <span>校園安全面交與防詐騙守則</span>
                </div>
                <ul className="text-xs text-ink-muted space-y-1 list-disc list-inside leading-relaxed">
                  <li>
                    <strong className="text-ink">請勿點擊外部點數卡或假賣貨便連結</strong>：本平台為中山醫校內無金流媒合，不需填寫銀行帳戶或實名認證。
                  </li>
                  <li>
                    <strong className="text-ink">建議選擇校園公開場合面交</strong>：如正心樓一樓郵局前、誠愛樓大廳、張啟華圖書館或杏樓門口，當面點清物品與現金。
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Detailed Info + Seller Card (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                {/* Status & Urgent Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      product.status === '上架中'
                        ? 'bg-csmu text-white'
                        : product.status === '保留中'
                        ? 'bg-amber-800 text-white'
                        : 'bg-stone-700 text-white'
                    }`}
                  >
                    狀態：{product.status}
                  </span>
                  {product.isUrgent && (
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-terracotta-light text-terracotta-dark border border-terracotta/30">
                      🔥 {product.urgentReason || '急售降價專區'}
                    </span>
                  )}
                  {product.isBookCrossing && (
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-csmu-light text-csmu border border-csmu/30 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      學校/社團二手課外書免費贈與・漂書專區
                    </span>
                  )}
                  <span className="text-xs text-ink-faint font-mono ml-auto">
                    刊登於 {product.createdAt}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-ink leading-snug">{product.title}</h2>

                {/* Price Block */}
                <div className="p-3.5 rounded-lg bg-paper border border-paper-border flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-xs text-ink-muted">預售價</span>
                    <span
                      className={`font-mono text-2xl font-bold ${
                        product.price === 0 ? 'text-csmu' : 'text-terracotta-dark'
                      }`}
                    >
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice !== undefined && product.originalPrice > 0 && (
                      <span className="text-xs text-ink-faint font-mono line-through">
                        原價 NT$ {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        product.negotiable
                          ? 'bg-csmu-light text-csmu'
                          : 'bg-paper-muted text-ink-muted'
                      }`}
                    >
                      {product.price === 0
                        ? '公益無償贈與'
                        : product.negotiable
                        ? '✓ 接受小幅議價'
                        : '✕ 不接受議價'}
                    </span>
                  </div>
                </div>

                {/* Expiry Warning Alert if Food / Cosmetics */}
                {expiry.hasExpiry && (
                  <div
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
                      expiry.isExpiringSoon
                        ? 'bg-amber-100/90 border-amber-400 text-amber-950'
                        : 'bg-paper border-paper-border text-ink'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <Calendar className="w-4 h-4 text-amber-800 shrink-0" />
                      <span>
                        有效期限：<strong className="font-mono">{product.expiryDate}</strong>
                      </span>
                    </div>
                    {expiry.isExpiringSoon && (
                      <span className="px-2 py-0.5 rounded bg-amber-800 text-white text-xs font-bold shrink-0">
                        ⚠️ 即期警示標籤（剩餘 {expiry.daysLeft} 天）
                      </span>
                    )}
                  </div>
                )}

                {/* Structured Attributes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded bg-paper border border-paper-border">
                    <span className="text-ink-faint block mb-0.5">新舊程度</span>
                    <span className="font-semibold text-ink">{product.condition}</span>
                  </div>
                  <div className="p-2.5 rounded bg-paper border border-paper-border">
                    <span className="text-ink-faint block mb-0.5">剩餘數量</span>
                    <span className="font-semibold text-ink font-mono">{product.quantity} 件</span>
                  </div>
                  <div className="p-2.5 rounded bg-paper border border-paper-border col-span-2 sm:col-span-1">
                    <span className="text-ink-faint block mb-0.5">交易方式</span>
                    <span className="font-semibold text-csmu">校園當面交易 (無金流)</span>
                  </div>

                  {/* Textbook Specific Structured Fields */}
                  {product.category === 'textbook' && (
                    <>
                      <div className="p-2.5 rounded bg-paper border border-paper-border">
                        <span className="text-ink-faint block mb-0.5">適用學院 / 科系</span>
                        <span className="font-semibold text-ink">
                          {product.college}・{product.department}
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-paper border border-paper-border">
                        <span className="text-ink-faint block mb-0.5">科目名稱</span>
                        <span className="font-semibold text-ink">
                          {product.courseName || '系所專業必修'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-paper border border-paper-border">
                        <span className="text-ink-faint block mb-0.5">出版年份 / 版次</span>
                        <span className="font-semibold text-ink">
                          {product.publishYearEdition || '詳見說明'}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Preferred Meetup Locations */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-ink-muted flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-csmu" />
                    賣家偏好面交地點（中山醫校園與大慶周邊）：
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.meetupLocations.map((loc) => (
                      <span
                        key={loc}
                        className="px-2.5 py-1 rounded bg-csmu-light/70 border border-csmu/25 text-xs font-medium text-csmu-dark"
                      >
                        📍 {loc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                    商品詳細說明與書況備註
                  </h4>
                  <p className="text-sm text-ink leading-relaxed whitespace-pre-line bg-paper p-3.5 rounded-lg border border-paper-border">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Chat & Favorite */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {product.status === '保留中' && !isMyProduct && product.reservedForUserId !== currentUser?.id ? (
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-3 px-4 rounded-lg bg-stone-300 text-stone-600 font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    <span>保留中（賣家已與買家約定面交，暫停其他人私訊）</span>
                  </button>
                ) : product.status === '已售出' || product.status === '已下架' ? (
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-3 px-4 rounded-lg bg-stone-300 text-stone-600 font-semibold text-sm cursor-not-allowed"
                  >
                    此商品{product.status}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onStartChat(product)}
                    className="flex-1 py-3 px-5 rounded-lg bg-csmu hover:bg-csmu-dark text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>
                      {isMyProduct ? '查看此商品的買家私訊紀錄' : '一鍵私訊賣家相談（自動帶入商品圖與價格）'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => onToggleLike(product.id, e)}
                  className={`py-3 px-4 rounded-lg border font-semibold text-sm flex items-center gap-2 transition-colors ${
                    product.likedByMe
                      ? 'bg-terracotta-light border-terracotta text-terracotta-dark'
                      : 'bg-paper border-paper-border text-ink hover:border-csmu'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${product.likedByMe ? 'fill-current' : ''}`} />
                  <span>{product.likedByMe ? '已追蹤' : '收藏'} ({product.likes})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Seller Information Card (賣家資訊卡：評價、聯絡方式、其他在售商品) */}
          <div className="p-5 rounded-xl bg-paper border border-paper-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-border">
              <div className="flex items-start gap-3.5">
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-csmu/30 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-ink">{seller.nickname}</h3>
                    <span className="text-xs font-mono text-ink-muted">
                      ({seller.name}｜學號 {seller.studentIdMasked})
                    </span>
                    {seller.accountStatus === '警告中' && (
                      <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[11px] font-bold">
                        ⚠️ 曾有未守時紀錄
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted">{seller.department}</p>

                  {/* Integrity Badges (交易誠信徽章) */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {seller.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-2 py-0.5 rounded bg-csmu-light text-csmu text-[11px] font-semibold flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rating Summary & Profile Link */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {seller.ratingCount > 0 ? (
                    <span className="font-mono text-base font-bold text-ink">
                      {seller.ratingAvg.toFixed(1)} / 5.0
                      <span className="text-xs font-normal text-ink-muted ml-1">
                        ({seller.ratingCount} 則歷史評價)
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-ink-muted bg-paper-muted px-2 py-0.5 rounded">
                      目前尚未有評分
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenSellerProfile(seller.id)}
                  className="text-xs font-semibold text-csmu hover:underline flex items-center gap-1"
                >
                  <span>瀏覽賣家完整個人檔案與歷史評語</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Seller's Other Active Listings */}
            {sellerOtherProducts.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-ink-muted">
                  賣家其他在售商品（共 {sellerOtherProducts.length} 件，可一起約面交省時）：
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sellerOtherProducts.slice(0, 3).map((other) => (
                    <button
                      key={other.id}
                      type="button"
                      onClick={() => {
                        setActiveImageIdx(0);
                        onSelectProduct(other);
                      }}
                      className="p-2.5 rounded-lg bg-paper-card border border-paper-border hover:border-csmu flex items-center gap-3 text-left transition-colors"
                    >
                      <img
                        src={other.images[0]}
                        alt={other.title}
                        className="w-12 h-12 rounded object-cover shrink-0 border border-paper-border"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-ink truncate">{other.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono text-xs font-bold text-terracotta-dark">
                            {formatPrice(other.price)}
                          </span>
                          <span className="text-[11px] text-ink-faint">{other.status}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Public Q&A / Message Board (問與答 / 留言板) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-paper-border pb-2.5">
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-csmu" />
                <span>公開問與答 / 留言板 ({product.qaList.length})</span>
              </h3>
              <span className="text-xs text-ink-muted">
                公開詢問書況、畫記程度或面交時間，賣家回覆後所有人皆可見
              </span>
            </div>

            {/* Existing Q&A List */}
            {product.qaList.length === 0 ? (
              <div className="p-6 rounded-lg bg-paper border border-dashed border-paper-border text-center text-xs text-ink-muted">
                目前尚無同學提問，對書況、版次或效期有疑問歡迎直接留言詢問！
              </div>
            ) : (
              <div className="space-y-3">
                {product.qaList.map((qa) => (
                  <div
                    key={qa.id}
                    className="p-4 rounded-lg bg-paper border border-paper-border space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-paper-dark text-ink font-semibold">
                          買家提問
                        </span>
                        <span className="font-semibold text-ink">{qa.userNickname}</span>
                        <span className="text-ink-faint">({qa.userDepartment})</span>
                      </div>
                      <span className="font-mono text-ink-faint">{qa.askedAt}</span>
                    </div>
                    <p className="text-sm text-ink pl-1">{qa.question}</p>

                    {qa.reply ? (
                      <div className="mt-2 p-3 rounded bg-csmu-light/60 border-l-2 border-csmu text-xs space-y-1">
                        <div className="flex items-center justify-between text-csmu-dark font-semibold">
                          <span>賣家（{seller.name}）回覆：</span>
                          <span className="font-mono text-[11px]">{qa.repliedAt}</span>
                        </div>
                        <p className="text-ink text-sm">{qa.reply}</p>
                      </div>
                    ) : isMyProduct ? (
                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={replyInputs[qa.id] || ''}
                          onChange={(e) =>
                            setReplyInputs((prev) => ({ ...prev, [qa.id]: e.target.value }))
                          }
                          placeholder="身為賣家，回覆此位同學的提問..."
                          className="flex-1 px-3 py-1.5 rounded border border-paper-border bg-paper-card text-xs focus:outline-none focus:border-csmu"
                        />
                        <button
                          type="button"
                          onClick={() => handleReplySubmit(qa.id)}
                          className="px-3 py-1.5 rounded bg-csmu text-white text-xs font-semibold hover:bg-csmu-dark"
                        >
                          送出回覆
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-ink-faint italic pl-1">等待賣家回覆中...</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Ask Question Form */}
            <form onSubmit={handleQuestionSubmit} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="在此輸入公開提問（例如：請問這本解剖學圖譜有缺頁嗎？週三中午誠愛樓方便面交嗎？）"
                className="flex-1 px-4 py-2.5 rounded-lg border border-paper-border bg-paper-card text-sm focus:outline-none focus:border-csmu"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg bg-ink hover:bg-csmu text-white text-sm font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>送出提問</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

