import { CategoryId } from '../types';
import { REFERENCE_TODAY } from '../data/csmuData';

export interface ExpiryCheckResult {
  hasExpiry: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean; // <= 30 days
  daysLeft: number;
  badgeText: string;
}

export function getExpiryStatus(expiryDate?: string): ExpiryCheckResult {
  if (!expiryDate) {
    return {
      hasExpiry: false,
      isExpired: false,
      isExpiringSoon: false,
      daysLeft: 999,
      badgeText: '',
    };
  }

  const today = new Date(`${REFERENCE_TODAY}T00:00:00`);
  const target = new Date(`${expiryDate}T00:00:00`);
  const diffMs = target.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      hasExpiry: true,
      isExpired: true,
      isExpiringSoon: false,
      daysLeft,
      badgeText: `已過期 (${expiryDate})・禁止上架`,
    };
  }

  if (daysLeft <= 30) {
    return {
      hasExpiry: true,
      isExpired: false,
      isExpiringSoon: true,
      daysLeft,
      badgeText: `即期警示標籤｜效期剩 ${daysLeft} 天 (${expiryDate})`,
    };
  }

  return {
    hasExpiry: true,
    isExpired: false,
    isExpiringSoon: false,
    daysLeft,
    badgeText: `效期至 ${expiryDate}`,
  };
}

export function isExpiryMandatory(category: Exclude<CategoryId, 'all'>, subCategory: string): boolean {
  if (category === 'food') return true;
  if (category === 'daily_dorm' && (subCategory.includes('彩妝') || subCategory.includes('保養品'))) {
    return true;
  }
  return false;
}

export function detectExternalLinkOrRisk(text: string): {
  hasUrl: boolean;
  hasScamKeyword: boolean;
  warningMessage: string;
} {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|tw|net|org|me|io|cc)(\/[^\s]*)?)/i;
  const scamKeywords = ['點數卡', '賣貨便', '實名認證', '帳戶凍結', '托運單', '金流驗證', '加賴', 'line id'];

  const hasUrl = urlRegex.test(text);
  const matchedScam = scamKeywords.find((kw) => text.toLowerCase().includes(kw));

  if (hasUrl || matchedScam) {
    return {
      hasUrl,
      hasScamKeyword: Boolean(matchedScam),
      warningMessage: hasUrl
        ? '偵測到外部連結 (URL)！請勿點擊不明外部賣場、假冒實名認證或點數卡連結。建議於正心樓、誠愛樓或杏樓當面交易。'
        : `偵測到高風險關鍵字「${matchedScam}」！本平台無內建金流，請勿脫離站內私訊或進行外部匯款。`,
    };
  }

  return {
    hasUrl: false,
    hasScamKeyword: false,
    warningMessage: '',
  };
}

export function formatPrice(price: number): string {
  if (price === 0) return '免費贈與 $0';
  return `NT$ ${price.toLocaleString('zh-TW')}`;
}

