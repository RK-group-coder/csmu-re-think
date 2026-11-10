import React from 'react';
import { Heart, MapPin, AlertTriangle, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { Product, UserProfile } from '../types';
import { formatPrice, getExpiryStatus } from '../utils/helpers';
import { CATEGORY_CONFIGS } from '../data/csmuData';

interface ProductCardProps {
  product: Product;
  seller?: UserProfile;
  onSelect: (product: Product) => void;
  onToggleLike: (productId: string, e: React.MouseEvent) => void;
  onOpenSellerProfile: (sellerId: string, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  seller,
  onSelect,
  onToggleLike,
  onOpenSellerProfile,
}) => {
  const expiry = getExpiryStatus(product.expiryDate);
  const categoryObj = CATEGORY_CONFIGS.find((c) => c.id === product.category);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price && product.price > 0
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const isUnavailable = product.status === '已售出' || product.status === '已下架';

  return (
    <article
      onClick={() => onSelect(product)}
      className={`group bg-paper-card border border-paper-border rounded-xl sm:rounded-lg overflow-hidden transition-all duration-150 cursor-pointer flex flex-col justify-between ${
        isUnavailable
          ? 'opacity-70 grayscale-[35%]'
          : 'hover:border-csmu hover:shadow-card'
      }`}
    >
      <div>
        {/* Image Header */}
        <div className="relative aspect-[4/3] bg-paper-muted overflow-hidden border-b border-paper-border">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />

          {/* Top-Left Badges: streamlined on mobile so photo stays clean */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-wrap gap-1 max-w-[78%]">
            {product.status === '保留中' && (
              <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-amber-900/90 text-amber-50 rounded">
                保留中
              </span>
            )}
            {product.status === '已售出' && (
              <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-ink/90 text-white rounded">
                已售出
              </span>
            )}
            {product.status === '已下架' && (
              <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-stone-700/90 text-white rounded">
                已下架
              </span>
            )}
            {product.status === '上架中' && product.isUrgent && (
              <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-terracotta text-white rounded shadow-sm truncate max-w-full">
                <span className="sm:hidden">急售降價</span>
                <span className="hidden sm:inline">急售・{product.urgentReason || '降價出清'}</span>
              </span>
            )}
            {product.price === 0 && (
              <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-csmu text-white rounded flex items-center gap-1">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>{product.isBookCrossing ? '免費漂書' : '免費贈送'}</span>
              </span>
            )}
          </div>

          {/* Top-Right Favorite Button */}
          <button
            type="button"
            onClick={(e) => onToggleLike(product.id, e)}
            title={product.likedByMe ? '取消收藏' : '加入追蹤清單'}
            className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border transition-colors ${
              product.likedByMe
                ? 'bg-terracotta text-white border-terracotta'
                : 'bg-paper-card/90 text-ink-muted border-paper-border hover:text-terracotta'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${product.likedByMe ? 'fill-current' : ''}`} />
          </button>

          {/* Bottom-Left Image Count & Condition */}
          <div className="absolute bottom-1.5 sm:bottom-2 left-2 right-2 flex items-center justify-between text-[10px] sm:text-[11px]">
            <span className="px-1.5 sm:px-2 py-0.5 rounded bg-ink/75 text-paper-card font-medium backdrop-blur-[2px]">
              {product.condition}
            </span>
            {product.images.length > 1 && (
              <span className="px-1.5 py-0.5 rounded bg-ink/75 text-paper-card font-mono">
                1/{product.images.length}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-2.5 sm:p-3.5">
          {/* Category & Department Meta */}
          <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs text-ink-muted mb-1">
            <span className="truncate font-medium text-csmu">
              {product.department
                ? `${product.department}`
                : product.subCategory.split(' (')[0] || categoryObj?.shortName}
            </span>
            {product.isbn && (
              <span className="hidden sm:inline font-mono text-[11px] text-ink-faint shrink-0">
                ISBN
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-ink leading-snug line-clamp-2 min-h-[2.2rem] sm:min-h-[2.5rem] group-hover:text-csmu transition-colors">
            {product.title}
          </h3>

          {/* Expiry Warning Banner if applicable */}
          {expiry.hasExpiry && (
            <div
              className={`mt-1.5 sm:mt-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs flex items-center gap-1 font-medium ${
                expiry.isExpiringSoon
                  ? 'bg-amber-100/90 text-amber-900 border border-amber-300'
                  : 'bg-paper-muted text-ink-muted'
              }`}
            >
              <AlertTriangle className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${expiry.isExpiringSoon ? 'text-amber-700' : 'text-ink-faint'}`} />
              <span className="truncate">
                {expiry.isExpiringSoon ? `即期・剩 ${expiry.daysLeft} 天` : expiry.badgeText}
              </span>
            </div>
          )}

          {/* Textbook Edition or Course pill (desktop or when not expiring) */}
          {product.publishYearEdition && !expiry.hasExpiry && (
            <div className="hidden sm:flex mt-2 items-center gap-1.5 text-xs text-ink-muted truncate">
              <BookOpen className="w-3.5 h-3.5 text-ink-faint shrink-0" />
              <span className="truncate">{product.publishYearEdition}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Price, Location & Seller */}
      <div className="px-2.5 sm:px-3.5 pb-2.5 sm:pb-3.5 pt-2 border-t border-paper-border/70 flex flex-col gap-1.5 sm:gap-2">
        <div className="flex items-baseline justify-between gap-1 flex-wrap">
          <div className="flex items-baseline gap-1 sm:gap-1.5">
            <span
              className={`font-mono font-bold text-sm sm:text-base ${
                product.price === 0 ? 'text-csmu' : 'text-terracotta-dark'
              }`}
            >
              {product.price === 0 ? '免費 $0' : `NT$ ${product.price.toLocaleString('zh-TW')}`}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="font-mono text-[10px] sm:text-xs text-ink-faint line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {discountPercent && (
              <span className="hidden sm:inline-block text-[11px] font-mono px-1.5 py-0.5 rounded bg-terracotta-light text-terracotta-dark font-semibold">
                -{discountPercent}%
              </span>
            )}
            {product.negotiable && product.price > 0 && (
              <span className="text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded bg-paper-muted text-ink-muted">
                可議
              </span>
            )}
          </div>
        </div>

        {/* Location & Seller Line */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-ink-muted pt-0.5 gap-1">
          <div className="flex items-center gap-1 truncate min-w-0" title={product.meetupLocations.join('、')}>
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-csmu shrink-0" />
            <span className="truncate">{product.meetupLocations[0].replace('一樓郵局前', '').replace('(學餐/宿舍門口)', '')}</span>
          </div>

          {seller && (
            <button
              type="button"
              onClick={(e) => onOpenSellerProfile(seller.id, e)}
              className="flex items-center gap-1 hover:text-csmu transition-colors shrink-0"
              title="點擊查看賣家個人檔案與歷史評價"
            >
              <span className="truncate max-w-[56px] sm:max-w-[80px]">{seller.name}</span>
              {seller.isGoogleVerified && (
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-csmu shrink-0" />
              )}
              <span className="font-mono text-[10px] sm:text-[11px] text-amber-700 font-semibold">
                {seller.ratingCount > 0 ? `${seller.ratingAvg.toFixed(1)}★` : '未評'}
              </span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
