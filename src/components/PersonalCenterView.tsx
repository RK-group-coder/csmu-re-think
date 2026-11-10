import React, { useState } from 'react';
import {
  Package,
  Heart,
  Bell,
  Mail,
  Settings,
  ShieldCheck,
  Edit3,
  Plus,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Star,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import {
  EmailNotificationLog,
  KeywordSubscription,
  ListingStatus,
  Product,
  UserProfile,
} from '../types';
import { formatPrice } from '../utils/helpers';
import { CATEGORY_CONFIGS } from '../data/csmuData';
import { ProductCard } from './ProductCard';

interface PersonalCenterViewProps {
  currentUser: UserProfile;
  allProducts: Product[];
  allUsers: UserProfile[];
  subscriptions: KeywordSubscription[];
  emailLogs: EmailNotificationLog[];
  initialTab?: 'listings' | 'favorites' | 'subscriptions' | 'settings';
  onSelectProduct: (product: Product) => void;
  onToggleLike: (productId: string, e: React.MouseEvent) => void;
  onChangeProductStatus: (
    productId: string,
    newStatus: ListingStatus,
    buyerId?: string
  ) => void;
  onEditProduct: (product: Product) => void;
  onOpenNewListing: () => void;
  onOpenPublicProfile: (userId: string) => void;
  onAddSubscription: (keyword: string, categoryFilter: string) => void;
  onRemoveSubscription: (subId: string) => void;
  onUpdateProfile: (nickname: string, department: string) => void;
  onToggleGoogleVerify: () => void;
}

export const PersonalCenterView: React.FC<PersonalCenterViewProps> = ({
  currentUser,
  allProducts,
  allUsers,
  subscriptions,
  emailLogs,
  initialTab = 'listings',
  onSelectProduct,
  onToggleLike,
  onChangeProductStatus,
  onEditProduct,
  onOpenNewListing,
  onOpenPublicProfile,
  onAddSubscription,
  onRemoveSubscription,
  onUpdateProfile,
  onToggleGoogleVerify,
}) => {
  const [activeTab, setActiveTab] = useState<
    'listings' | 'favorites' | 'subscriptions' | 'settings'
  >(initialTab);

  const [statusFilter, setStatusFilter] = useState<'全部' | ListingStatus>('全部');
  const [newKeyword, setNewKeyword] = useState('');
  const [newCatFilter, setNewCatFilter] = useState('教科書 / 課業學習');

  const [nicknameInput, setNicknameInput] = useState(currentUser.nickname);
  const [deptInput, setDeptInput] = useState(currentUser.department);
  const [savedNotice, setSavedNotice] = useState(false);

  const myProducts = allProducts.filter((p) => p.sellerId === currentUser.id);
  const filteredMyProducts =
    statusFilter === '全部'
      ? myProducts
      : myProducts.filter((p) => p.status === statusFilter);

  const likedProducts = allProducts.filter((p) => p.likedByMe);

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    onAddSubscription(newKeyword.trim(), newCatFilter);
    setNewKeyword('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(nicknameInput.trim() || currentUser.name, deptInput.trim());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <section className="space-y-6">
      {/* Top Personal Summary Bar */}
      <div className="p-6 rounded-xl bg-paper-card border border-paper-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-csmu/40 shrink-0"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-ink">{currentUser.nickname}</h2>
              <span className="text-xs font-mono text-ink-muted">
                ({currentUser.email}｜學號 {currentUser.studentIdMasked})
              </span>
            </div>
            <p className="text-xs text-ink-muted">{currentUser.department}</p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {currentUser.isGoogleVerified ? (
                <span className="px-2.5 py-0.5 rounded bg-csmu-light text-csmu text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  已完成 CSMU Google 帳號驗證（具備買家＋賣家完整權限）
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  尚未完成 Google 驗證（目前僅具買家瀏覽權限）
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded bg-paper border border-paper-border text-xs font-mono">
                評價：
                {currentUser.ratingCount > 0
                  ? `${currentUser.ratingAvg.toFixed(1)} ★ (${currentUser.ratingCount}則)`
                  : '未評分'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpenPublicProfile(currentUser.id)}
            className="px-3.5 py-2 rounded-lg border border-paper-border bg-paper hover:border-csmu text-xs font-semibold text-ink flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-csmu" />
            <span>瀏覽我的公開個人頁面</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewListing}
            className="px-4 py-2 rounded-lg bg-csmu hover:bg-csmu-dark text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>新增上架商品</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-paper-border pb-2.5 sm:pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 sm:gap-2 shrink-0 transition-colors ${
            activeTab === 'listings'
              ? 'bg-csmu text-white'
              : 'bg-paper-card border border-paper-border text-ink-muted hover:text-ink'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>我的商品 ({myProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('favorites')}
          className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 sm:gap-2 shrink-0 transition-colors ${
            activeTab === 'favorites'
              ? 'bg-csmu text-white'
              : 'bg-paper-card border border-paper-border text-ink-muted hover:text-ink'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>追蹤收藏 ({likedProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subscriptions')}
          className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 sm:gap-2 shrink-0 transition-colors ${
            activeTab === 'subscriptions'
              ? 'bg-csmu text-white'
              : 'bg-paper-card border border-paper-border text-ink-muted hover:text-ink'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>關鍵字訂閱 ({subscriptions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 sm:gap-2 shrink-0 transition-colors ${
            activeTab === 'settings'
              ? 'bg-csmu text-white'
              : 'bg-paper-card border border-paper-border text-ink-muted hover:text-ink'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>設定 ＆ 驗證狀態</span>
        </button>
      </div>

      {/* Tab 1: My Listings Management */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['全部', '上架中', '保留中', '已售出', '已下架'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    statusFilter === st
                      ? 'bg-ink text-white border-ink'
                      : 'bg-paper-card text-ink-muted border-paper-border hover:border-ink'
                  }`}
                >
                  {st} (
                  {st === '全部'
                    ? myProducts.length
                    : myProducts.filter((p) => p.status === st).length}
                  )
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-muted">
              提示：標記「已售出」後系統將自動下架並邀請買賣雙方進行 1~5 星互評
            </p>
          </div>

          {filteredMyProducts.length === 0 ? (
            <div className="p-10 rounded-xl bg-paper-card border border-dashed border-paper-border text-center space-y-2">
              <p className="text-sm font-bold text-ink">此狀態下尚無商品</p>
              <button
                type="button"
                onClick={onOpenNewListing}
                className="px-4 py-2 rounded-lg bg-csmu text-white text-xs font-bold"
              >
                立即刊登第一件二手物
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMyProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-4 rounded-xl bg-paper-card border border-paper-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div
                    onClick={() => onSelectProduct(prod)}
                    className="flex items-center gap-3.5 cursor-pointer group min-w-0"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="w-16 h-16 rounded-lg object-cover border border-paper-border shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            prod.status === '上架中'
                              ? 'bg-csmu text-white'
                              : prod.status === '保留中'
                              ? 'bg-amber-800 text-white'
                              : 'bg-stone-700 text-white'
                          }`}
                        >
                          {prod.status}
                        </span>
                        <span className="text-xs text-ink-muted">{prod.subCategory}</span>
                      </div>
                      <h4 className="text-sm font-bold text-ink truncate group-hover:text-csmu">
                        {prod.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-mono font-bold text-terracotta-dark">
                          {formatPrice(prod.price)}
                        </span>
                        <span className="text-ink-faint">收藏數：{prod.likes}</span>
                        <span className="text-ink-faint">問與答：{prod.qaList.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seller Quick Status Switcher */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {(['上架中', '保留中', '已售出', '已下架'] as ListingStatus[]).map(
                      (st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => onChangeProductStatus(prod.id, st, 'u-2')}
                          className={`px-2.5 py-1.5 rounded text-xs font-semibold border transition-colors ${
                            prod.status === st
                              ? 'bg-csmu text-white border-csmu'
                              : 'bg-paper text-ink-muted border-paper-border hover:border-csmu hover:text-ink'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => onEditProduct(prod)}
                      className="px-2.5 py-1.5 rounded bg-paper-muted hover:bg-paper-dark text-ink text-xs font-semibold flex items-center gap-1 ml-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>編輯</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Favorites / Watchlist */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          {likedProducts.length === 0 ? (
            <div className="p-10 rounded-xl bg-paper-card border border-dashed border-paper-border text-center text-xs text-ink-muted">
              您尚未收藏任何商品，在商品卡右上角點擊愛心即可加入追蹤清單！
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {likedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  seller={allUsers.find((u) => u.id === p.sellerId)}
                  onSelect={onSelectProduct}
                  onToggleLike={onToggleLike}
                  onOpenSellerProfile={(sid, e) => {
                    e.stopPropagation();
                    onOpenPublicProfile(sid);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Keyword Subscriptions & Email Logs (第六大點之2：關鍵字訂閱) */}
      {activeTab === 'subscriptions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Manage Keyword Subscriptions (6 cols) */}
          <div className="lg:col-span-6 p-5 rounded-xl bg-paper-card border border-paper-border space-y-4">
            <div>
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <Bell className="w-4 h-4 text-csmu" />
                <span>關鍵字到貨訂閱（自動寄信至註冊信箱）</span>
              </h3>
              <p className="text-xs text-ink-muted mt-1">
                設定熱門科目名稱或物品關鍵字（如：解剖學、聽診器、小冰箱），只要有學長姐上架吻合商品，系統將自動發送通知信至您的{" "}
                <strong className="font-mono text-ink">{currentUser.email}</strong>！
              </p>
            </div>

            <form onSubmit={handleAddSub} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="輸入科目或商品關鍵字（如：病理學、實驗衣）"
                className="flex-1 px-3 py-2 rounded-lg border border-paper-border bg-paper text-xs"
              />
              <select
                value={newCatFilter}
                onChange={(e) => setNewCatFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-paper-border bg-paper text-xs"
              >
                <option value="全部類別">全部類別</option>
                {CATEGORY_CONFIGS.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-csmu text-white text-xs font-bold shrink-0 hover:bg-csmu-dark"
              >
                + 新增訂閱
              </button>
            </form>

            <div className="space-y-2.5 pt-2">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-lg bg-paper border border-paper-border flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-csmu-light text-csmu text-xs font-bold">
                        關鍵字：{sub.keyword}
                      </span>
                      <span className="text-xs text-ink-muted">{sub.categoryFilter}</span>
                    </div>
                    <p className="text-[11px] text-ink-faint font-mono mt-1">
                      通知信箱：{sub.email}｜已媒合 {sub.matchedProductIds.length} 件商品
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveSubscription(sub.id)}
                    className="p-1.5 rounded text-ink-muted hover:text-terracotta hover:bg-terracotta-light/40"
                    title="取消訂閱"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Simulated Email Notification Inbox (6 cols) */}
          <div className="lg:col-span-6 p-5 rounded-xl bg-paper-card border border-paper-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <Mail className="w-4 h-4 text-terracotta" />
                <span>註冊信箱自動通知紀錄 ({emailLogs.length})</span>
              </h3>
              <span className="text-xs font-mono text-ink-muted">{currentUser.email}</span>
            </div>

            <div className="space-y-3">
              {emailLogs.map((log) => {
                const matchedProd = allProducts.find((p) => p.id === log.productId);
                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-lg bg-paper border border-paper-border space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-ink-faint">
                      <span>寄件者：no-reply@rethink.csmu.edu.tw</span>
                      <span>{log.sentAt}</span>
                    </div>
                    <p className="text-xs font-bold text-ink">{log.subject}</p>
                    <p className="text-xs text-ink-muted">
                      系統偵測到新上架商品《{log.productTitle}》，預售價{' '}
                      <strong className="font-mono text-terracotta-dark">
                        {formatPrice(log.productPrice)}
                      </strong>
                      ，符合您訂閱的關鍵字「{log.keyword}」。
                    </p>
                    {matchedProd && (
                      <button
                        type="button"
                        onClick={() => onSelectProduct(matchedProd)}
                        className="text-xs font-bold text-csmu hover:underline pt-1 inline-block"
                      >
                        點擊直接檢視該商品 →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Settings & Google Auth Permissions */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Profile Edit */}
          <form
            onSubmit={handleSaveProfile}
            className="lg:col-span-6 p-5 rounded-xl bg-paper-card border border-paper-border space-y-4"
          >
            <h3 className="text-base font-bold text-ink">個人檔案設定</h3>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                顯示暱稱（會顯示於商品卡與評價頁面）
              </label>
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-paper-border bg-paper text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                所屬學院與科系年級
              </label>
              <input
                type="text"
                value={deptInput}
                onChange={(e) => setDeptInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-paper-border bg-paper text-sm"
              />
            </div>

            {savedNotice && (
              <p className="text-xs font-bold text-csmu">✓ 已儲存個人檔案設定！</p>
            )}

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-csmu hover:bg-csmu-dark text-white text-xs font-bold"
            >
              儲存個人設定
            </button>
          </form>

          {/* Right: Google Account Verification & Role Matrix */}
          <div className="lg:col-span-6 p-5 rounded-xl bg-paper-card border border-paper-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">
                Google 帳號驗證與買賣家權限矩陣
              </h3>
              <button
                type="button"
                onClick={onToggleGoogleVerify}
                className="px-3 py-1.5 rounded-lg border border-paper-border bg-paper hover:border-csmu text-xs font-semibold"
              >
                {currentUser.isGoogleVerified
                  ? '模擬切換為「未完成賣家驗證」'
                  : '一鍵完成 Google 帳號驗證'}
              </button>
            </div>

            <div className="p-4 rounded-lg bg-paper border border-paper-border space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-csmu shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-ink">買家權限（基礎驗證）</p>
                  <p className="text-ink-muted mt-0.5">
                    瀏覽商品、收藏商品、公開留言提問、站內私訊賣家、發布求購、關鍵字訂閱、對賣家進行 1~5 星評價。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-paper-border">
                <ShieldCheck className="w-4 h-4 text-csmu shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-ink">
                    賣家權限（已完成 CSMU Google 帳號驗證：{currentUser.email}）
                  </p>
                  <p className="text-ink-muted mt-0.5">
                    具備買家所有功能，並新增「商品上架（支援 ISBN 掃描與圖片拖曳排序）、編輯商品、切換保留中、下架、標記已售出並邀請買家互評」完整權限。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

