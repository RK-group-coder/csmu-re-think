import React, { useState } from 'react';
import {
  X,
  Send,
  Image as ImageIcon,
  ShieldAlert,
  Flag,
  CheckCircle2,
  ExternalLink,
  AlertOctagon,
  MessageSquare,
  Star,
  ArrowLeft,
} from 'lucide-react';
import { ChatThread, ListingStatus, Product, UserProfile } from '../types';
import { QUICK_CHAT_PHRASES } from '../data/csmuData';
import { detectExternalLinkOrRisk, formatPrice } from '../utils/helpers';

interface ChatDrawerModalProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  currentUser: UserProfile;
  allProducts: Product[];
  allUsers: UserProfile[];
  onSelectThread: (threadId: string) => void;
  onClose: () => void;
  onSendMessage: (threadId: string, text: string, imageUrl?: string) => void;
  onChangeProductStatus: (
    productId: string,
    newStatus: ListingStatus,
    buyerId?: string
  ) => void;
  onOpenProductDetail: (product: Product) => void;
  onOpenReviewModal: (product: Product, partnerUser: UserProfile, threadId: string) => void;
  onOpenReportModal: (
    targetType: '私訊檢舉' | '面交放鳥/未完成交易爭議',
    product?: Product,
    reportedUser?: UserProfile
  ) => void;
}

const SAMPLE_DETAIL_IMAGES = [
  {
    label: '傳送書本內頁畫記實拍',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '傳送商品背面/配件細節照',
    url: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=800&q=80',
  },
];

export const ChatDrawerModal: React.FC<ChatDrawerModalProps> = ({
  threads,
  activeThreadId,
  currentUser,
  allProducts,
  allUsers,
  onSelectThread,
  onClose,
  onSendMessage,
  onChangeProductStatus,
  onOpenProductDetail,
  onOpenReviewModal,
  onOpenReportModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  // On mobile, allow toggling between thread list and active chat view
  const [mobileShowList, setMobileShowList] = useState(false);

  const activeThread =
    threads.find((t) => t.id === activeThreadId) || threads[0] || null;

  const activeProduct = activeThread
    ? allProducts.find((p) => p.id === activeThread.productId)
    : undefined;

  const partnerId = activeThread
    ? activeThread.buyerId === currentUser.id
      ? activeThread.sellerId
      : activeThread.buyerId
    : undefined;

  const partnerUser = partnerId
    ? allUsers.find((u) => u.id === partnerId)
    : undefined;

  const isSellerInActiveThread =
    activeThread && activeThread.sellerId === currentUser.id;

  const liveInputRisk = detectExternalLinkOrRisk(inputText);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !inputText.trim()) return;
    onSendMessage(activeThread.id, inputText.trim());
    setInputText('');
  };

  const handleQuickPhrase = (phrase: string) => {
    if (!activeThread) return;
    onSendMessage(activeThread.id, phrase);
  };

  const handleSendPhoto = (url: string, label: string) => {
    if (!activeThread) return;
    onSendMessage(activeThread.id, `[已傳送圖片：${label}]`, url);
    setShowPhotoPicker(false);
  };

  const handleLocalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeThread) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        onSendMessage(activeThread.id, '[已傳送商品細節照片]', ev.target.result);
        setShowPhotoPicker(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-paper-card border-t sm:border border-paper-border sm:rounded-xl max-w-5xl w-full h-[100dvh] sm:h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <div className="px-4 sm:px-5 py-3 bg-paper border-b border-paper-border flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {!mobileShowList && (
              <button
                type="button"
                onClick={() => setMobileShowList(true)}
                className="md:hidden px-2 py-1 rounded border border-paper-border bg-paper-card text-xs font-bold text-ink flex items-center gap-1 shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>列表 ({threads.length})</span>
              </button>
            )}
            <MessageSquare className="w-4 h-4 text-csmu shrink-0 hidden sm:block" />
            <h2 className="text-sm sm:text-base font-bold text-ink truncate">
              站內私訊訊息匣
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-paper-muted shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Anti-Scam Persistent Banner */}
        <div className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-amber-100/90 border-b border-amber-300 text-amber-950 text-[11px] sm:text-xs flex items-center gap-1.5 font-medium shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terracotta shrink-0" />
          <span className="truncate">
            防詐警示：請勿點擊外部點數卡或假賣貨便連結，建議正心樓/誠愛樓/杏樓公開面交。
          </span>
        </div>

        {/* Main Split Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Thread List (4 cols on desktop, toggled on mobile) */}
          <div
            className={`${
              mobileShowList ? 'flex' : 'hidden md:flex'
            } md:col-span-4 border-r border-paper-border bg-paper overflow-y-auto flex-col min-h-0`}
          >
            <div className="p-3 border-b border-paper-border text-xs font-bold text-ink-muted flex items-center justify-between">
              <span>進行中的相談對話 ({threads.length})</span>
              <span className="md:hidden text-[11px] text-csmu">點擊任一對話進入</span>
            </div>

            {threads.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink-muted">
                尚無私訊紀錄，在商品頁點擊「一鍵私訊賣家」即可自動帶入商品開始對話！
              </div>
            ) : (
              <div className="divide-y divide-paper-border">
                {threads.map((t) => {
                  const prod = allProducts.find((p) => p.id === t.productId);
                  const otherId =
                    t.buyerId === currentUser.id ? t.sellerId : t.buyerId;
                  const otherUser = allUsers.find((u) => u.id === otherId);
                  const lastMsg = t.messages[t.messages.length - 1];
                  const isSelected = activeThread?.id === t.id;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        onSelectThread(t.id);
                        setMobileShowList(false);
                      }}
                      className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                        isSelected
                          ? 'bg-csmu-light/70 border-l-4 border-l-csmu'
                          : 'hover:bg-paper-muted/70'
                      }`}
                    >
                      {prod && (
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-12 h-12 rounded object-cover border border-paper-border shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-ink truncate">
                            {otherUser?.name || '同學'}
                            <span className="font-normal text-ink-muted ml-1">
                              ({t.sellerId === currentUser.id ? '買家' : '賣家'})
                            </span>
                          </span>
                          <span className="text-[10px] font-mono text-ink-faint shrink-0">
                            {t.updatedAt}
                          </span>
                        </div>

                        {prod && (
                          <p className="text-[11px] font-semibold text-csmu truncate">
                            {prod.title}
                          </p>
                        )}

                        <p className="text-xs text-ink-muted truncate">
                          {lastMsg?.text || '點擊開始對話'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Active Conversation (8 cols on desktop, default view on mobile) */}
          <div
            className={`${
              mobileShowList ? 'hidden md:flex' : 'flex'
            } md:col-span-8 flex-col min-h-0 bg-paper-card`}
          >
            {activeThread && activeProduct && partnerUser ? (
              <>
                {/* Pinned Product Snapshot Header */}
                <div className="p-2.5 sm:p-3.5 bg-paper border-b border-paper-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 shrink-0">
                  <div
                    onClick={() => onOpenProductDetail(activeProduct)}
                    className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0"
                  >
                    <img
                      src={activeProduct.images[0]}
                      alt={activeProduct.title}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-paper-border shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-csmu text-white shrink-0">
                          {activeProduct.status}
                        </span>
                        <span className="text-xs font-bold text-ink truncate group-hover:text-csmu">
                          {activeProduct.title}
                        </span>
                        <ExternalLink className="w-3 h-3 text-ink-faint shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] sm:text-xs">
                        <span className="font-mono font-bold text-terracotta-dark shrink-0">
                          {formatPrice(activeProduct.price)}
                        </span>
                        <span className="text-ink-muted truncate">
                          ｜{partnerUser.name}（{partnerUser.department.split('・').pop()}）
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions: Seller Status Control / Mutual Review / Report */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                    {isSellerInActiveThread && activeProduct.status !== '已售出' && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            onChangeProductStatus(
                              activeProduct.id,
                              activeProduct.status === '保留中' ? '上架中' : '保留中',
                              partnerUser.id
                            )
                          }
                          className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded text-[11px] sm:text-xs font-semibold border shrink-0 ${
                            activeProduct.status === '保留中'
                              ? 'bg-amber-800 text-white border-amber-800'
                              : 'bg-paper-card text-ink border-paper-border hover:border-csmu'
                          }`}
                        >
                          {activeProduct.status === '保留中' ? '取消保留' : '設為保留中'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onChangeProductStatus(
                              activeProduct.id,
                              '已售出',
                              partnerUser.id
                            );
                            onOpenReviewModal(activeProduct, partnerUser, activeThread.id);
                          }}
                          className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded bg-csmu hover:bg-csmu-dark text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1 shrink-0"
                        >
                          <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>已售出＆互評</span>
                        </button>
                      </>
                    )}

                    {activeProduct.status === '已售出' && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenReviewModal(activeProduct, partnerUser, activeThread.id)
                        }
                        className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 shrink-0"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>給予評價</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onOpenReportModal(
                          '面交放鳥/未完成交易爭議',
                          activeProduct,
                          partnerUser
                        )
                      }
                      className="px-2 py-1 rounded text-[11px] sm:text-xs text-ink-muted hover:text-terracotta hover:bg-terracotta-light/50 flex items-center gap-1 shrink-0"
                      title="檢舉對話或回報面交放鳥/描述不符"
                    >
                      <Flag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>檢舉/爭議</span>
                    </button>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-paper/40">
                  {activeThread.messages.map((msg) => {
                    const isMine = msg.senderId === currentUser.id;
                    const riskCheck = detectExternalLinkOrRisk(msg.text);
                    const showWarning = msg.hasExternalLinkWarning || riskCheck.hasUrl || riskCheck.hasScamKeyword;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isMine ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[80%] rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm leading-relaxed ${
                            isMine
                              ? 'bg-csmu text-white rounded-br-none'
                              : 'bg-paper-card border border-paper-border text-ink rounded-bl-none shadow-subtle'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          {msg.imageUrl && (
                            <img
                              src={msg.imageUrl}
                              alt="細節照片"
                              className="mt-2 rounded-lg max-h-44 object-cover border border-white/20"
                            />
                          )}
                          <span
                            className={`block text-[10px] font-mono mt-1 text-right ${
                              isMine ? 'text-csmu-light/80' : 'text-ink-faint'
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                        </div>

                        {/* External URL / Scam Warning Popup right below the message */}
                        {showWarning && (
                          <div className="mt-1.5 max-w-[90%] sm:max-w-[82%] p-2.5 sm:p-3 rounded-lg bg-red-50 border-2 border-red-400 text-red-950 text-xs flex items-start gap-2 shadow-sm">
                            <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="font-bold text-red-800">
                                🛡️ 系統安全攔截提醒：偵測到外部連結 (URL) 或高風險字眼！
                              </p>
                              <p className="leading-relaxed text-[11px] sm:text-xs">
                                {riskCheck.warningMessage ||
                                  '請勿點擊外部點數卡、假賣貨便或實名認證連結！請堅持於校園公開場合當面交易。'}
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  onOpenReportModal('私訊檢舉', activeProduct, partnerUser)
                                }
                                className="underline font-bold text-red-700 hover:text-red-900"
                              >
                                立即檢舉此可疑連結 →
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Preset Quick Phrases Bar (預設常用語句) */}
                <div className="px-3 py-2 bg-paper border-t border-paper-border flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                  <span className="text-[11px] font-semibold text-ink-faint shrink-0">
                    常用語：
                  </span>
                  {QUICK_CHAT_PHRASES.map((phrase) => (
                    <button
                      key={phrase}
                      type="button"
                      onClick={() => handleQuickPhrase(phrase)}
                      className="px-2.5 py-1 rounded-full bg-paper-card hover:bg-csmu-light border border-paper-border hover:border-csmu text-[11px] sm:text-xs text-ink-muted hover:text-csmu-dark shrink-0 transition-colors"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>

                {/* Photo Picker Popover */}
                {showPhotoPicker && (
                  <div className="px-3.5 py-2.5 bg-paper-muted border-t border-paper-border flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <label className="px-2.5 py-1.5 rounded bg-csmu text-white font-semibold cursor-pointer hover:bg-csmu-dark">
                        上傳手機照片
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLocalPhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {SAMPLE_DETAIL_IMAGES.map((img) => (
                        <button
                          key={img.label}
                          type="button"
                          onClick={() => handleSendPhoto(img.url, img.label)}
                          className="px-2 py-1.5 rounded bg-paper-card border border-paper-border hover:border-csmu text-ink text-[11px]"
                        >
                          📷 {img.label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPhotoPicker(false)}
                      className="text-ink-muted hover:text-ink"
                    >
                      關閉
                    </button>
                  </div>
                )}

                {/* Live typing external link warning */}
                {(liveInputRisk.hasUrl || liveInputRisk.hasScamKeyword) && (
                  <div className="px-3.5 py-1.5 bg-amber-100 text-amber-950 text-[11px] sm:text-xs font-medium flex items-center gap-1.5 border-t border-amber-300">
                    <ShieldAlert className="w-3.5 h-3.5 text-terracotta shrink-0" />
                    <span className="truncate">{liveInputRisk.warningMessage}</span>
                  </div>
                )}

                {/* Input Box */}
                <form
                  onSubmit={handleSend}
                  className="p-2.5 sm:p-3 bg-paper-card border-t border-paper-border flex items-center gap-2 shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                    className="p-2 sm:p-2.5 rounded-lg border border-paper-border text-ink-muted hover:text-csmu hover:border-csmu transition-colors shrink-0"
                    title="傳送商品細節圖片"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="輸入私訊約正心樓/杏樓面交..."
                    className="flex-1 px-3 py-2 sm:py-2.5 rounded-lg border border-paper-border bg-paper text-xs sm:text-sm focus:outline-none focus:border-csmu min-w-0"
                  />
                  <button
                    type="submit"
                    className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-csmu hover:bg-csmu-dark text-white text-xs sm:text-sm font-semibold flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>傳送</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-sm text-ink-muted">
                請選擇一筆對話開始相談
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
