import React, { useState } from 'react';
import {
  Plus,
  Bell,
  Clock,
  MapPin,
  MessageSquare,
  CheckCircle2,
  BookOpen,
  Search,
} from 'lucide-react';
import { CategoryId, MeetupLocation, UserProfile, WantedPost } from '../types';
import { CATEGORY_CONFIGS, CSMU_MEETUP_LOCATIONS } from '../data/csmuData';

interface WantedBoardViewProps {
  wantedPosts: WantedPost[];
  currentUser: UserProfile | null;
  onAddWantedPost: (
    post: Omit<
      WantedPost,
      'id' | 'requesterId' | 'requesterName' | 'requesterDept' | 'createdAt' | 'responsesCount' | 'status'
    >
  ) => void;
  onRespondToWanted: (post: WantedPost) => void;
  onMarkWantedFulfilled: (postId: string) => void;
  onRequireLogin: () => void;
}

export const WantedBoardView: React.FC<WantedBoardViewProps> = ({
  wantedPosts,
  currentUser,
  onAddWantedPost,
  onRespondToWanted,
  onMarkWantedFulfilled,
  onRequireLogin,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<CategoryId, 'all'>>('textbook');
  const [subCategory, setSubCategory] = useState('醫學院｜醫學系');
  const [courseOrSpec, setCourseOrSpec] = useState('');
  const [budgetText, setBudgetText] = useState('預算 $400 – $800');
  const [preferredCondition, setPreferredCondition] = useState('九成新或有重點畫記皆可');
  const [preferredLocation, setPreferredLocation] =
    useState<MeetupLocation>('正心樓一樓郵局前');
  const [expiresAt, setExpiresAt] = useState('2026-12-05');
  const [emailNotify, setEmailNotify] = useState(true);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    if (!title.trim()) return;
    onAddWantedPost({
      title: title.trim(),
      category,
      subCategory,
      courseOrSpec: courseOrSpec.trim() || undefined,
      budgetText,
      preferredCondition,
      preferredLocation,
      expiresAt,
      emailNotify,
      description:
        description.trim() ||
        '徵求學長姐閒置好物，正心樓或誠愛樓皆可配合您的下課時間面交！',
    });
    setTitle('');
    setCourseOrSpec('');
    setDescription('');
    setShowForm(false);
  };

  return (
    <section className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-paper-card border border-paper-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-terracotta text-white text-xs font-bold">
              求購徵求專區
            </span>
            <h2 className="text-xl font-bold text-ink">
              找不到需要的課本或宿舍家電？發布求購讓學長姐主動聯繫你
            </h2>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            買家可設定「需求有效期限」與「@csmu.edu.tw 信箱即時通知」，避免求購需求過期無人知曉；手邊剛好有閒置品的賣家可一鍵發起私訊報價。
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!currentUser) {
              onRequireLogin();
              return;
            }
            setShowForm(!showForm);
          }}
          className="px-4 py-2.5 rounded-lg bg-csmu hover:bg-csmu-dark text-white text-sm font-bold flex items-center gap-2 shrink-0 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? '收起發布表單' : '發布求購需求'}</span>
        </button>
      </div>

      {/* Create Wanted Post Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-xl bg-paper-card border-2 border-csmu/40 space-y-4 shadow-card"
        >
          <h3 className="text-base font-bold text-ink border-b border-paper-border pb-2">
            新增徵求二手書 / 物品需求
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-ink mb-1">
                徵求物品名稱 / 書名 *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：【徵求】生理學原文書 Guyton 14/e 或 醫技系實驗衣 M 號"
                className="w-full px-3.5 py-2 rounded-lg border border-paper-border bg-paper text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                需求類別 *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as Exclude<CategoryId, 'all'>;
                  setCategory(cat);
                  const found = CATEGORY_CONFIGS.find((c) => c.id === cat);
                  if (found) setSubCategory(found.subCategories[0].name);
                }}
                className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-sm"
              >
                {CATEGORY_CONFIGS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                適用科目 / 規格說明
              </label>
              <input
                type="text"
                value={courseOrSpec}
                onChange={(e) => setCourseOrSpec(e.target.value)}
                placeholder="例如：大二必修生理學 / 雙層防燙"
                className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                期望預算區間 *
              </label>
              <input
                type="text"
                required
                value={budgetText}
                onChange={(e) => setBudgetText(e.target.value)}
                placeholder="例如：預算 $400 – $800"
                className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                需求有效期限（避免需求過期）*
              </label>
              <input
                type="date"
                required
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                偏好面交地點
              </label>
              <select
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value as MeetupLocation)}
                className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-sm"
              >
                {CSMU_MEETUP_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-ink mb-1">
                可接受之書況 / 新舊程度
              </label>
              <input
                type="text"
                value={preferredCondition}
                onChange={(e) => setPreferredCondition(e.target.value)}
                placeholder="例如：有螢光筆畫記可，無掉頁即可"
                className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              補充說明
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="寫下方便面交的時段或其他需求細節..."
              className="w-full px-3.5 py-2 rounded-lg border border-paper-border bg-paper text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-paper-border">
            <label className="flex items-center gap-2 text-xs font-semibold text-csmu-dark cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotify}
                onChange={(e) => setEmailNotify(e.target.checked)}
                className="rounded text-csmu focus:ring-csmu w-4 h-4"
              />
              <Bell className="w-3.5 h-3.5" />
              <span>開啟「賣家主動回應 ＆ 需求即將到期」校內信箱通知</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-paper-border text-xs font-semibold text-ink-muted"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-csmu hover:bg-csmu-dark text-white text-xs font-bold"
              >
                立即刊登求購
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Wanted Posts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wantedPosts.map((post) => {
          const isMine = currentUser?.id === post.requesterId;
          return (
            <div
              key={post.id}
              className={`p-5 rounded-xl bg-paper-card border border-paper-border flex flex-col justify-between gap-4 ${
                post.status === '已徵得' ? 'opacity-65' : 'hover:border-csmu transition-colors'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        post.status === '徵求中'
                          ? 'bg-terracotta-light text-terracotta-dark border border-terracotta/30'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {post.status}
                    </span>
                    <span className="font-semibold text-csmu">{post.subCategory}</span>
                  </div>
                  <span className="font-mono text-ink-faint flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    需求有效至 {post.expiresAt}
                  </span>
                </div>

                <h3 className="text-base font-bold text-ink leading-snug">{post.title}</h3>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded bg-paper border border-paper-border font-mono font-bold text-terracotta-dark">
                    {post.budgetText}
                  </span>
                  {post.courseOrSpec && (
                    <span className="px-2.5 py-1 rounded bg-paper border border-paper-border text-ink-muted">
                      規格/科目：{post.courseOrSpec}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded bg-paper border border-paper-border text-ink-muted">
                    接受狀況：{post.preferredCondition}
                  </span>
                </div>

                <p className="text-xs text-ink-muted leading-relaxed bg-paper p-3 rounded-lg border border-paper-border">
                  {post.description}
                </p>
              </div>

              <div className="pt-3 border-t border-paper-border flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-ink">
                    求購同學：{post.requesterName}（{post.requesterDept}）
                  </p>
                  <p className="text-ink-muted flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-csmu" />
                    偏好面交：{post.preferredLocation}
                    {post.emailNotify && (
                      <span className="ml-2 text-csmu font-medium">✓ 已開啟信箱通知</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isMine && post.status === '徵求中' && (
                    <button
                      type="button"
                      onClick={() => onMarkWantedFulfilled(post.id)}
                      className="px-3 py-2 rounded-lg border border-paper-border hover:bg-paper-muted text-ink font-semibold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-csmu" />
                      <span>標記已徵得</span>
                    </button>
                  )}

                  {post.status === '徵求中' && (
                    <button
                      type="button"
                      onClick={() => onRespondToWanted(post)}
                      className="px-3.5 py-2 rounded-lg bg-csmu hover:bg-csmu-dark text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>我有這件商品・主動回應 ({post.responsesCount})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

