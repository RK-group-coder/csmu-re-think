import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Package,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import { Product, UserProfile } from '../types';
import { formatPrice } from '../utils/helpers';

interface UserProfileModalProps {
  user: UserProfile;
  allProducts: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  allProducts,
  onClose,
  onSelectProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'selling' | 'sold' | 'reviews'>('selling');

  const sellingProducts = allProducts.filter(
    (p) => p.sellerId === user.id && (p.status === '上架中' || p.status === '保留中')
  );
  const soldProducts = allProducts.filter(
    (p) => p.sellerId === user.id && p.status === '已售出'
  );

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-paper-card border border-paper-border rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="px-6 py-4 bg-paper border-b border-paper-border flex items-center justify-between">
          <h3 className="text-base font-bold text-ink">
            個人檔案與歷史誠信評價
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-paper-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Hero */}
        <div className="p-6 bg-paper-card border-b border-paper-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-csmu/40 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-ink">{user.nickname}</h2>
                  <span className="text-xs font-mono text-ink-muted">
                    ({user.name}｜學號 {user.studentIdMasked})
                  </span>
                </div>
                <p className="text-xs text-ink-muted">
                  {user.department}｜Google 校內信箱：{user.email}
                </p>

                {/* Integrity Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {user.badges.map((badge) => (
                    <span
                      key={badge}
                      className="px-2.5 py-0.5 rounded bg-csmu-light text-csmu text-xs font-semibold flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {badge}
                    </span>
                  ))}
                  {user.accountStatus !== '正常' && (
                    <span className="px-2.5 py-0.5 rounded bg-red-100 text-red-900 border border-red-300 text-xs font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      帳號狀態：{user.accountStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Rating Box */}
            <div className="p-3.5 rounded-xl bg-paper border border-paper-border text-center min-w-[150px]">
              {user.ratingCount > 0 ? (
                <>
                  <div className="flex items-center justify-center gap-1 text-amber-600 font-mono text-2xl font-bold">
                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    <span>{user.ratingAvg.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">
                    共 {user.ratingCount} 則歷史評價
                  </p>
                </>
              ) : (
                <div className="py-2">
                  <span className="px-2.5 py-1 rounded bg-paper-muted text-ink-muted text-xs font-bold">
                    未評分（尚無評價紀錄）
                  </span>
                </div>
              )}
            </div>
          </div>

          {user.warningNote && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-terracotta shrink-0" />
              <span>守時/違規備註：{user.warningNote}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-csmu" />
              常約面交：{user.preferredLocations.join('、')}
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-ink-faint" />
              加入日期：{user.joinedAt}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 bg-paper border-b border-paper-border flex items-center gap-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('selling')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'selling'
                ? 'border-csmu text-csmu'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            正在出售商品 ({sellingProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sold')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'sold'
                ? 'border-csmu text-csmu'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            已售出商品紀錄 ({soldProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-csmu text-csmu'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            過往歷史評價與評語 ({user.reviews.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'selling' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sellingProducts.length === 0 ? (
                <p className="col-span-2 text-center py-8 text-xs text-ink-muted">
                  目前沒有正在出售的商品
                </p>
              ) : (
                sellingProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      onSelectProduct(p);
                    }}
                    className="p-3 rounded-lg bg-paper border border-paper-border hover:border-csmu flex items-center gap-3 cursor-pointer transition-colors"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-16 h-16 rounded object-cover border border-paper-border shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="px-1.5 py-0.5 rounded bg-csmu-light text-csmu text-[10px] font-bold">
                        {p.status}
                      </span>
                      <h4 className="text-xs font-bold text-ink truncate">{p.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-terracotta-dark">
                          {formatPrice(p.price)}
                        </span>
                        <span className="text-[11px] text-ink-muted">{p.condition}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'sold' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {soldProducts.length === 0 ? (
                <p className="col-span-2 text-center py-8 text-xs text-ink-muted">
                  目前尚無已售出之商品紀錄
                </p>
              ) : (
                soldProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      onSelectProduct(p);
                    }}
                    className="p-3 rounded-lg bg-paper/70 border border-paper-border flex items-center gap-3 cursor-pointer opacity-80 hover:opacity-100"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-16 h-16 rounded object-cover grayscale-[40%] shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="px-1.5 py-0.5 rounded bg-stone-700 text-white text-[10px] font-bold">
                        已售出
                      </span>
                      <h4 className="text-xs font-bold text-ink truncate">{p.title}</h4>
                      <span className="font-mono text-xs text-ink-muted">
                        成交價 {formatPrice(p.price)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {user.reviews.length === 0 ? (
                <div className="p-8 rounded-lg bg-paper border border-dashed border-paper-border text-center space-y-1">
                  <p className="text-sm font-bold text-ink">目前顯示：未評分</p>
                  <p className="text-xs text-ink-muted">
                    此位同學尚未完成互評交易，面交時建議約於正心樓或誠愛樓公開場合當面確認商品。
                  </p>
                </div>
              ) : (
                user.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-lg bg-paper border border-paper-border space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink">{rev.reviewerName}</span>
                        <span className="text-ink-muted">({rev.reviewerDept})</span>
                        <span className="px-2 py-0.5 rounded bg-paper-dark text-ink text-[10px] font-semibold">
                          {rev.role}
                        </span>
                      </div>
                      <span className="font-mono text-ink-faint">{rev.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <Star
                          key={st}
                          className={`w-3.5 h-3.5 ${
                            st <= rev.rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-stone-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-ink-muted ml-2">
                        交易商品：{rev.productTitle}
                      </span>
                    </div>

                    <p className="text-sm text-ink">{rev.comment}</p>

                    {rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rev.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded bg-csmu-light text-csmu text-[11px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

