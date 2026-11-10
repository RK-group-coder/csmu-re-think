import React, { useState } from 'react';
import {
  ShieldAlert,
  Ban,
  Megaphone,
  Flag,
  CheckCircle2,
  Trash2,
  Plus,
  UserX,
  AlertTriangle,
  PackageX,
} from 'lucide-react';
import {
  AnnouncementBanner,
  Product,
  ReportCase,
  UserProfile,
} from '../types';
import { formatPrice } from '../utils/helpers';

interface AdminDashboardViewProps {
  reports: ReportCase[];
  users: UserProfile[];
  products: Product[];
  announcements: AnnouncementBanner[];
  onForceUnlistProduct: (productId: string, reportId?: string) => void;
  onUpdateUserAccountStatus: (
    userId: string,
    status: '正常' | '警告中' | '已停權',
    warningNote?: string,
    reportId?: string
  ) => void;
  onResolveReport: (reportId: string, status: ReportCase['status']) => void;
  onAddAnnouncement: (ann: Omit<AnnouncementBanner, 'id'>) => void;
  onDeleteAnnouncement: (annId: string) => void;
  onReturnToMain?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  reports,
  users,
  products,
  announcements,
  onForceUnlistProduct,
  onUpdateUserAccountStatus,
  onResolveReport,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onReturnToMain,
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'broadcast'>(
    'reports'
  );

  // Broadcast form states
  const [tag, setTag] = useState<AnnouncementBanner['tag']>('全站廣播');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [metaInfo, setMetaInfo] = useState(
    '系統營運公告｜中山醫二手物交換管理中心'
  );
  const [theme, setTheme] = useState<AnnouncementBanner['theme']>('forest');

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddAnnouncement({
      tag,
      title: title.trim(),
      summary:
        summary.trim() ||
        '請全體中山醫同學遵守校園面交與誠信守則，嚴禁加價販售黃牛票券與過期食品。',
      metaInfo,
      ctaLabel: '查看詳情',
      actionType: 'open_safety_modal',
      theme,
    });
    setTitle('');
    setSummary('');
  };

  return (
    <section className="space-y-6">
      {/* Admin Top Header */}
      <div className="p-5 sm:p-6 rounded-xl bg-ink text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-stone-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-terracotta text-white text-xs font-bold">
              SYSTEM ADMIN CONSOLE
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-stone-800 text-stone-300 border border-stone-700">
              獨立後台網址：/admin
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            大慶拾物所｜管理員後台營運中心
          </h2>
          <p className="text-xs text-stone-300">
            具備違規商品強制下架、帳號停權/警告機制、檢舉案件即時審核與全站首頁廣播公告發布功能。
          </p>
        </div>

        {onReturnToMain && (
          <button
            type="button"
            onClick={onReturnToMain}
            className="px-4 py-2 rounded-lg bg-csmu hover:bg-csmu-dark text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
          >
            <span>返回前台二手交換平台</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-paper-card border border-paper-border space-y-1">
          <span className="text-xs text-ink-muted">待審核檢舉案件</span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-terracotta">
              {reports.filter((r) => r.status === '待審核').length}
            </span>
            <span className="text-[11px] text-ink-faint">件待處理</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-paper-card border border-paper-border space-y-1">
          <span className="text-xs text-ink-muted">全站上架中商品</span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-csmu">
              {products.filter((p) => p.status === '上架中').length}
            </span>
            <span className="text-[11px] text-ink-faint">總計 {products.length} 件</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-paper-card border border-paper-border space-y-1">
          <span className="text-xs text-ink-muted">註冊學生與帳號狀態</span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-ink">
              {users.length}
            </span>
            <span className="text-[11px] text-amber-700 font-semibold">
              {users.filter((u) => u.accountStatus !== '正常').length} 個帳號受處分
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-paper-card border border-paper-border space-y-1">
          <span className="text-xs text-ink-muted">首頁輪播公告</span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-ink">
              {announcements.length}
            </span>
            <span className="text-[11px] text-csmu font-semibold">即時發布生效</span>
          </div>
        </div>
      </div>

      {/* Admin Module Switcher */}
      <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-bold pb-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'reports'
                ? 'bg-terracotta text-white'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>檢舉與下架 ({reports.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'users'
                ? 'bg-terracotta text-white'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <UserX className="w-4 h-4" />
            <span>帳號停權/警告 ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('broadcast')}
            className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === 'broadcast'
                ? 'bg-terracotta text-white'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>全站廣播發布 ({announcements.length})</span>
          </button>
        </div>

      {/* Tab 1: Reports & Forced Unlisting */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {reports.map((rep) => {
              const targetProduct = products.find((p) => p.id === rep.productId);
              return (
                <div
                  key={rep.id}
                  className="p-5 rounded-xl bg-paper-card border border-paper-border flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          rep.status === '待審核'
                            ? 'bg-terracotta text-white'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {rep.status}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                        檢舉原因：{rep.reason}
                      </span>
                      <span className="text-ink-muted">類型：{rep.targetType}</span>
                      <span className="font-mono text-ink-faint">{rep.createdAt}</span>
                    </div>

                    <h4 className="text-sm font-bold text-ink">
                      被檢舉標的：{rep.productTitle}
                    </h4>

                    <p className="text-xs text-ink-muted">
                      被檢舉人：<strong className="text-ink">{rep.reportedUserName}</strong>｜檢舉人：
                      {rep.reporterName}
                    </p>

                    <p className="text-xs text-ink bg-paper p-2.5 rounded border border-paper-border">
                      詳細事由：{rep.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {rep.productId && targetProduct && targetProduct.status !== '已下架' && (
                      <button
                        type="button"
                        onClick={() => onForceUnlistProduct(rep.productId!, rep.id)}
                        className="px-3 py-2 rounded-lg bg-terracotta hover:bg-terracotta-dark text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <PackageX className="w-4 h-4" />
                        <span>強制下架違規商品</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateUserAccountStatus(
                          rep.reportedUserId,
                          '警告中',
                          `因「${rep.reason}」經管理員審核記予警告一次`,
                          rep.id
                        )
                      }
                      className="px-3 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>記警告一次</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateUserAccountStatus(
                          rep.reportedUserId,
                          '已停權',
                          `因嚴重違規「${rep.reason}」遭系統停權`,
                          rep.id
                        )
                      }
                      className="px-3 py-2 rounded-lg bg-red-800 hover:bg-red-900 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Ban className="w-4 h-4" />
                      <span>停權該帳號</span>
                    </button>

                    {rep.status === '待審核' && (
                      <button
                        type="button"
                        onClick={() => onResolveReport(rep.id, '已結案')}
                        className="px-3 py-2 rounded-lg border border-paper-border bg-paper hover:bg-paper-muted text-xs font-semibold text-ink-muted"
                      >
                        標記結案
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: User Account Suspension / Warning Management */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-4 rounded-xl bg-paper-card border border-paper-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink">{u.name}</span>
                    <span className="text-xs font-mono text-ink-muted">
                      ({u.email}｜{u.studentIdMasked})
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        u.accountStatus === '正常'
                          ? 'bg-emerald-100 text-emerald-900'
                          : u.accountStatus === '警告中'
                          ? 'bg-amber-200 text-amber-950'
                          : 'bg-red-700 text-white'
                      }`}
                    >
                      狀態：{u.accountStatus}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted">{u.department}</p>
                  {u.warningNote && (
                    <p className="text-xs text-terracotta-dark font-medium">
                      紀錄：{u.warningNote}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {(['正常', '警告中', '已停權'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() =>
                      onUpdateUserAccountStatus(
                        u.id,
                        st,
                        st === '正常'
                          ? undefined
                          : st === '警告中'
                          ? '管理員手動標記守時/違規警告'
                          : '違反平台安全規定已停權處分'
                      )
                    }
                    className={`px-3 py-1.5 rounded text-xs font-bold border ${
                      u.accountStatus === st
                        ? 'bg-ink text-white border-ink'
                        : 'bg-paper text-ink-muted border-paper-border hover:border-ink'
                    }`}
                  >
                    設為「{st}」
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Site-wide Broadcast Announcements */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Create Broadcast Form */}
          <form
            onSubmit={handleCreateBroadcast}
            className="lg:col-span-5 p-5 rounded-xl bg-paper-card border border-paper-border space-y-4"
          >
            <h3 className="text-base font-bold text-ink flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-csmu" />
              <span>發布全站廣播公告（即時同步至首頁輪播欄）</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                公告分類標籤 *
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value as AnnouncementBanner['tag'])}
                className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-xs font-semibold"
              >
                <option value="全站廣播">全站廣播</option>
                <option value="校園活動">校園活動</option>
                <option value="公益二手書募集">公益二手書募集</option>
                <option value="平台防詐提醒">平台防詐提醒</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                廣播主標題 *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：【期末大慶街退宿】大型家電清運與二手交接專區開放"
                className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                公告內容摘要 *
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="輸入廣播內容細節..."
                className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                時間與地點資訊
              </label>
              <input
                type="text"
                value={metaInfo}
                onChange={(e) => setMetaInfo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-csmu hover:bg-csmu-dark text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>立即發布至首頁輪播公告欄</span>
            </button>
          </form>

          {/* Existing Announcements List */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-sm font-bold text-ink">
              目前首頁輪播中的公告 ({announcements.length})
            </h3>
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-xl bg-paper-card border border-paper-border flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded bg-csmu-light text-csmu text-xs font-bold">
                    {ann.tag}
                  </span>
                  <h4 className="text-sm font-bold text-ink">{ann.title}</h4>
                  <p className="text-xs text-ink-muted leading-relaxed">{ann.summary}</p>
                  <p className="text-[11px] font-mono text-ink-faint">{ann.metaInfo}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteAnnouncement(ann.id)}
                  className="p-2 rounded text-ink-muted hover:text-terracotta hover:bg-terracotta-light/40 shrink-0"
                  title="移除公告"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

