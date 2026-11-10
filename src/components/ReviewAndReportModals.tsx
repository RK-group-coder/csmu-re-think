import React, { useState } from 'react';
import {
  X,
  Star,
  Flag,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { Product, ReportReason, UserProfile } from '../types';

interface MutualReviewModalProps {
  product: Product;
  targetUser: UserProfile;
  currentUser: UserProfile;
  onClose: () => void;
  onSubmitReview: (
    targetUserId: string,
    productId: string,
    productTitle: string,
    rating: number,
    comment: string,
    tags: string[],
    role: '買家評價賣家' | '賣家評價買家'
  ) => void;
  onSubmitDisputeReport: (
    product: Product,
    targetUser: UserProfile,
    reason: ReportReason,
    details: string
  ) => void;
}

const POSITIVE_TAGS = [
  '準時守信',
  '書況如實',
  '正心樓面交順利',
  '回覆迅速',
  '自備零錢',
  '效期透明',
];

export const MutualReviewModal: React.FC<MutualReviewModalProps> = ({
  product,
  targetUser,
  currentUser,
  onClose,
  onSubmitReview,
  onSubmitDisputeReport,
}) => {
  const [mode, setMode] = useState<'review' | 'dispute'>('review');
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '準時守信',
    '正心樓面交順利',
  ]);
  const [comment, setComment] = useState<string>(
    '面交非常準時，商品狀況跟描述完全一致，推薦的中山醫好同學！'
  );

  // Dispute fields (未完成交易 / 守時紀錄)
  const [disputeType, setDisputeType] = useState<string>('放鳥 / 未到（約定時間未出現）');
  const [disputeNote, setDisputeNote] = useState<string>('');

  const isCurrentUserSeller = product.sellerId === currentUser.id;
  const roleLabel: '買家評價賣家' | '賣家評價買家' = isCurrentUserSeller
    ? '賣家評價買家'
    : '買家評價賣家';

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'review') {
      onSubmitReview(
        targetUser.id,
        product.id,
        product.title,
        rating,
        comment.trim() || '交易愉快，準時守信！',
        selectedTags,
        roleLabel
      );
      onClose();
    } else {
      const reasonMap: ReportReason = disputeType.includes('放鳥')
        ? '放鳥 / 未到 / 詐騙行為'
        : '描述不符 / 臨時惡意殺價';
      onSubmitDisputeReport(
        product,
        targetUser,
        reasonMap,
        `【未完成交易/守時爭議：${disputeType}】${disputeNote}`
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-paper-card border border-paper-border rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="px-5 py-4 bg-paper border-b border-paper-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-ink">
              交易完成互評 ＆ 守時紀錄回報
            </h3>
            <p className="text-xs text-ink-muted">
              商品：{product.title.slice(0, 28)}...
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 border-b border-paper-border bg-paper-muted/50 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('review')}
            className={`py-3 text-center border-b-2 transition-colors ${
              mode === 'review'
                ? 'border-csmu text-csmu bg-paper-card'
                : 'border-transparent text-ink-muted'
            }`}
          >
            ★ 交易完成互評 (1~5星)
          </button>
          <button
            type="button"
            onClick={() => setMode('dispute')}
            className={`py-3 text-center border-b-2 transition-colors ${
              mode === 'dispute'
                ? 'border-terracotta text-terracotta-dark bg-paper-card'
                : 'border-transparent text-ink-muted'
            }`}
          >
            ⚠️ 未完成交易 / 放鳥檢舉
          </button>
        </div>

        <form onSubmit={handleReviewSubmit} className="p-5 space-y-4">
          {/* Target User Summary */}
          <div className="p-3 rounded-lg bg-paper border border-paper-border flex items-center gap-3">
            <img
              src={targetUser.avatar}
              alt={targetUser.name}
              className="w-10 h-10 rounded-full object-cover border border-paper-border"
            />
            <div>
              <p className="text-xs font-bold text-ink">
                對象：{targetUser.name}（{targetUser.department}）
              </p>
              <p className="text-[11px] text-ink-muted">{roleLabel}</p>
            </div>
          </div>

          {mode === 'review' ? (
            <>
              {/* 1-5 Star Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-ink">
                  給予星級評分 (1 ~ 5 星) *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-mono text-sm font-bold text-amber-800">
                    {rating}.0 顆星
                  </span>
                </div>
              </div>

              {/* Quick Tags */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-ink">
                  誠信與守時印象標籤（可複選）
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POSITIVE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-csmu text-white border-csmu'
                          : 'bg-paper text-ink-muted border-paper-border'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-ink">
                  文字評語 *
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="寫下對這次面交體驗的評價..."
                  className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-sm text-ink"
                />
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-lg bg-terracotta-light/60 border border-terracotta/30 text-xs text-terracotta-dark leading-relaxed">
                若遇到面交「放鳥 / 未到」或「商品嚴重描述不符」導致交易破局，可在此送出紀錄。經後台查核屬實將記入該帳號誠信檔案並給予警告。
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-ink">
                  爭議項目 *
                </label>
                <select
                  value={disputeType}
                  onChange={(e) => setDisputeType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-sm font-medium"
                >
                  <option value="放鳥 / 未到（約定時間未出現）">
                    放鳥 / 未到（約定面交時間未出現且失聯）
                  </option>
                  <option value="嚴重遲到超過 30 分鐘">
                    守時爭議：嚴重遲到超過 30 分鐘
                  </option>
                  <option value="商品與描述嚴重不符（缺頁/故障/過期）">
                    描述不符：現場檢查發現缺頁、故障或效期不符
                  </option>
                  <option value="面交現場臨時惡意殺價">
                    面交現場臨時惡意殺價
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-ink">
                  事發經過與約定時間地點說明 *
                </label>
                <textarea
                  rows={3}
                  required
                  value={disputeNote}
                  onChange={(e) => setDisputeNote(e.target.value)}
                  placeholder="例如：約定 11/10 中午 12:10 於正心樓一樓郵局前，等了 30 分鐘私訊未讀..."
                  className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-sm"
                />
              </div>
            </>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-paper-border text-xs font-semibold text-ink-muted"
            >
              取消
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg text-white text-xs font-bold ${
                mode === 'review'
                  ? 'bg-csmu hover:bg-csmu-dark'
                  : 'bg-terracotta hover:bg-terracotta-dark'
              }`}
            >
              {mode === 'review' ? '送出評價並寫入對方檔案' : '送出面交爭議檢舉'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ReportModalProps {
  targetType: '商品檢舉' | '私訊檢舉' | '面交放鳥/未完成交易爭議';
  product?: Product;
  reportedUser?: UserProfile;
  onClose: () => void;
  onSubmitReport: (reason: ReportReason, description: string) => void;
}

const REPORT_REASONS: ReportReason[] = [
  '黃牛票券',
  '違禁品 (藥品 / 煙酒)',
  '假貨 / 盜版影印書',
  '過期食品 / 保養品',
  '放鳥 / 未到 / 詐騙行為',
  '描述不符 / 臨時惡意殺價',
  '違規商業廣告',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  targetType,
  product,
  reportedUser,
  onClose,
  onSubmitReport,
}) => {
  const [reason, setReason] = useState<ReportReason>('黃牛票券');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport(
      reason,
      description.trim() || `檢舉項目：${reason}，請管理員協助查核處理。`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-paper-card border border-paper-border rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="px-5 py-4 bg-paper border-b border-paper-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-terracotta" />
            <h3 className="text-base font-bold text-ink">一鍵檢舉與違規回報 ({targetType})</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-paper border border-paper-border text-xs space-y-1">
            {product && (
              <p className="font-semibold text-ink truncate">
                檢舉商品：{product.title}
              </p>
            )}
            {reportedUser && (
              <p className="text-ink-muted">
                檢舉對象：{reportedUser.name} ({reportedUser.studentIdMasked})
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink">
              請選擇檢舉原因 *
            </label>
            <div className="space-y-1.5">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                    reason === r
                      ? 'bg-terracotta-light/60 border-terracotta text-terracotta-dark font-bold'
                      : 'bg-paper border-paper-border text-ink hover:border-ink-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="text-terracotta focus:ring-terracotta"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink">
              補充說明（選填，將送交後台管理系統審核）
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="請簡述違規情形，例如：加價轉售演唱會門票、私訊傳送不明點數卡連結、販售處方藥品等..."
              className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-paper-border text-xs font-semibold text-ink-muted"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-terracotta hover:bg-terracotta-dark text-white text-xs font-bold"
            >
              送出檢舉案件
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const SafetyGuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-paper-card border border-paper-border rounded-xl max-w-xl w-full shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-ink text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">
              中山醫二手交換平台｜校園安全面交與防詐騙守則
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-stone-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm text-ink leading-relaxed">
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 space-y-1.5">
            <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-terracotta" />
              1. 嚴禁點擊外部點數卡、假賣貨便或實名認證連結
            </h4>
            <p className="text-xs text-amber-900">
              本平台採「純校內無金流媒合」，不提供任何線上刷卡、第三方託管或宅急便收款連結。凡是在私訊中傳送外部網址要求「簽署金流協議、帳戶解凍、購買遊戲點數卡」100% 為詐騙，系統亦會自動跳出紅框攔截提醒。
            </p>
          </div>

          <div className="p-4 rounded-lg bg-csmu-light/60 border border-csmu/30 space-y-1.5">
            <h4 className="font-bold text-csmu-dark flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-csmu" />
              2. 建議選擇校園公開、有監視器之場所面交
            </h4>
            <p className="text-xs text-ink-muted">
              推薦面交熱點：<strong>正心樓一樓郵局前大廳</strong>、<strong>誠愛樓一樓入口</strong>、<strong>張啟華紀念圖書館前</strong>、<strong>杏樓學生餐廳門口</strong>。高單價 3C 商品（如 iPad、Apple Pencil、聽診器）請當場測試功能後再交付現金。
            </p>
          </div>

          <div className="p-4 rounded-lg bg-paper border border-paper-border space-y-1.5">
            <h4 className="font-bold text-ink flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-csmu" />
              3. 違禁品與效期嚴格把關
            </h4>
            <p className="text-xs text-ink-muted">
              依藥事法與校規，平台嚴禁刊登處方藥品、隱形眼鏡（含生理食鹽水醫療器材）、菸酒與黃牛加價票券；食品與彩妝保養品強制填寫有效期限，過期商品系統直接鎖定禁止上架。
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-csmu text-white text-xs font-bold hover:bg-csmu-dark"
            >
              我已了解安全守則
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

