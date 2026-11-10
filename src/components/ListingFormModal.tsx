import React, { useState } from 'react';
import {
  X,
  Upload,
  Barcode,
  GripVertical,
  Star,
  Trash2,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Camera,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import {
  CategoryId,
  ItemCondition,
  MeetupLocation,
  Product,
} from '../types';
import {
  CATEGORY_CONFIGS,
  CSMU_COLLEGES_MAP,
  CSMU_MEETUP_LOCATIONS,
  ISBN_DATABASE,
  REFERENCE_TODAY,
} from '../data/csmuData';
import { getExpiryStatus, isExpiryMandatory } from '../utils/helpers';

interface ListingFormModalProps {
  initialProduct?: Product | null;
  onClose: () => void;
  onSaveProduct: (
    productData: Omit<Product, 'id' | 'sellerId' | 'createdAt' | 'likes' | 'qaList'>,
    editingId?: string
  ) => void;
}

const SAMPLE_CAMPUS_PHOTOS = [
  {
    label: '原文書實拍',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: '內頁筆記細節',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: '3C 平板與筆',
    url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: '宿舍家電實拍',
    url: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: '好市多團購食品',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
  },
];

export const ListingFormModal: React.FC<ListingFormModalProps> = ({
  initialProduct,
  onClose,
  onSaveProduct,
}) => {
  const [category, setCategory] = useState<Exclude<CategoryId, 'all'>>(
    initialProduct?.category || 'textbook'
  );
  const currentCategoryConfig =
    CATEGORY_CONFIGS.find((c) => c.id === category) || CATEGORY_CONFIGS[0];

  const [subCategory, setSubCategory] = useState<string>(
    initialProduct?.subCategory || currentCategoryConfig.subCategories[0].name
  );

  // Images (Max 8, drag-and-drop sortable, index 0 is cover)
  const [images, setImages] = useState<string[]>(
    initialProduct?.images?.length
      ? initialProduct.images
      : ['https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=80']
  );
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Basic Fields
  const [title, setTitle] = useState(initialProduct?.title || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [originalPrice, setOriginalPrice] = useState<string>(
    initialProduct?.originalPrice !== undefined ? String(initialProduct.originalPrice) : ''
  );
  const [price, setPrice] = useState<string>(
    initialProduct?.price !== undefined ? String(initialProduct.price) : ''
  );
  const [negotiable, setNegotiable] = useState<boolean>(initialProduct?.negotiable ?? true);
  const [condition, setCondition] = useState<ItemCondition>(
    initialProduct?.condition || '九成新'
  );
  const [quantity, setQuantity] = useState<number>(initialProduct?.quantity || 1);

  // Urgent / Price drop
  const [isUrgent, setIsUrgent] = useState<boolean>(initialProduct?.isUrgent || false);
  const [urgentReason, setUrgentReason] = useState<string>(
    initialProduct?.urgentReason || '畢業退宿出清'
  );

  // Textbook Structured Fields
  const [college, setCollege] = useState<string>(initialProduct?.college || '醫學院');
  const [department, setDepartment] = useState<string>(initialProduct?.department || '醫學系');
  const [courseName, setCourseName] = useState<string>(initialProduct?.courseName || '');
  const [publishYearEdition, setPublishYearEdition] = useState<string>(
    initialProduct?.publishYearEdition || ''
  );
  const [isbn, setIsbn] = useState<string>(initialProduct?.isbn || '');
  const [author, setAuthor] = useState<string>(initialProduct?.author || '');

  // Book crossing / free charity
  const [isBookCrossing, setIsBookCrossing] = useState<boolean>(
    initialProduct?.isBookCrossing || false
  );

  // Expiry Date (Mandatory for Food & Cosmetics)
  const [expiryDate, setExpiryDate] = useState<string>(initialProduct?.expiryDate || '');

  // Meetup Locations
  const [meetupLocations, setMeetupLocations] = useState<MeetupLocation[]>(
    initialProduct?.meetupLocations?.length
      ? initialProduct.meetupLocations
      : ['正心樓一樓郵局前', '誠愛樓一樓大廳']
  );

  // ISBN Scanner Modal state
  const [showIsbnScanner, setShowIsbnScanner] = useState(false);
  const [scanningIsbn, setScanningIsbn] = useState(false);
  const [scanSuccessMessage, setScanSuccessMessage] = useState('');

  // Error message
  const [formError, setFormError] = useState('');

  const mandatoryExpiry = isExpiryMandatory(category, subCategory);
  const expiryCheck = getExpiryStatus(expiryDate);

  const handleCategoryChange = (newCat: Exclude<CategoryId, 'all'>) => {
    setCategory(newCat);
    const cfg = CATEGORY_CONFIGS.find((c) => c.id === newCat);
    if (cfg && cfg.subCategories.length > 0) {
      setSubCategory(cfg.subCategories[0].name);
      if (cfg.subCategories[0].isBookCrossing || newCat === 'charity') {
        setPrice('0');
        setNegotiable(false);
      }
    }
  };

  const handleSubCategoryChange = (newSub: string) => {
    setSubCategory(newSub);
    if (newSub.includes('免費贈與') || newSub.includes('免費贈送') || newSub === '贈送') {
      setPrice('0');
      setNegotiable(false);
      setIsBookCrossing(newSub.includes('漂書'));
    } else {
      setIsBookCrossing(false);
    }
  };

  // Handle ISBN Barcode Autofill
  const handleApplyIsbnRecord = (recordIspn: string) => {
    setScanningIsbn(true);
    setTimeout(() => {
      const found = ISBN_DATABASE.find((b) => b.isbn === recordIspn);
      if (found) {
        setCategory('textbook');
        setTitle(found.title);
        setAuthor(found.author);
        setPublishYearEdition(found.publishYearEdition);
        setOriginalPrice(String(found.originalPrice));
        setPrice(String(Math.round(found.originalPrice * 0.5)));
        setCollege(found.college);
        setDepartment(found.department);
        setCourseName(found.courseName);
        setIsbn(found.isbn);
        setDescription(found.defaultDesc);
        setSubCategory(`${found.college}｜${found.department}`);
        if (!images.includes(found.coverImage)) {
          setImages((prev) => [found.coverImage, ...prev].slice(0, 8));
        }
        setScanSuccessMessage(
          `✓ 已成功掃描 ISBN ${found.isbn}！自動帶入書名、作者（${found.author}）、版次與原價 NT$${found.originalPrice}。`
        );
      }
      setScanningIsbn(false);
      setShowIsbnScanner(false);
    }, 450);
  };

  // Image Upload / Drag & Drop handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (images.length >= 8) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === 'string') {
          setImages((prev) => (prev.length < 8 ? [...prev, ev.target!.result as string] : prev));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const next = [...images];
    const [moved] = next.splice(draggedIdx, 1);
    next.splice(targetIdx, 0, moved);
    setImages(next);
    setDraggedIdx(null);
  };

  const moveImage = (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    setImages(next);
  };

  const setAsCover = (idx: number) => {
    if (idx === 0) return;
    const next = [...images];
    const [moved] = next.splice(idx, 1);
    next.unshift(moved);
    setImages(next);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleLocation = (loc: MeetupLocation) => {
    setMeetupLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('請填寫商品名稱');
      return;
    }
    if (images.length === 0) {
      setFormError('請至少上傳或選擇 1 張商品圖片（最多 8 張）');
      return;
    }
    if (price === '' || Number(price) < 0) {
      setFormError('請填寫有效的預售價（免費贈送請填 0）');
      return;
    }
    if (meetupLocations.length === 0) {
      setFormError('請至少選擇一個中山醫校園面交地點偏好');
      return;
    }
    if (mandatoryExpiry && !expiryDate) {
      setFormError('食品與彩妝/保養品類別依法規與平台安全規範，強制必填「有效日期」');
      return;
    }
    if (expiryDate && expiryCheck.isExpired) {
      setFormError('過期商品禁止上架！您填寫的有效日期早於今日，系統已攔截刊登。');
      return;
    }

    onSaveProduct(
      {
        title: title.trim(),
        description: description.trim() || '保存狀況良好，歡迎中山醫同學站內私訊約正心樓或誠愛樓面交確認！',
        images,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        price: Number(price),
        negotiable,
        condition,
        quantity,
        category,
        subCategory,
        status: initialProduct?.status || '上架中',
        meetupLocations,
        isUrgent,
        urgentReason: isUrgent ? urgentReason : undefined,
        college: category === 'textbook' ? college : undefined,
        department: category === 'textbook' ? department : undefined,
        courseName: category === 'textbook' ? courseName : undefined,
        publishYearEdition: category === 'textbook' ? publishYearEdition : undefined,
        isbn: category === 'textbook' ? isbn : undefined,
        author: category === 'textbook' ? author : undefined,
        isBookCrossing: category === 'general_book' ? isBookCrossing : undefined,
        expiryDate: expiryDate || undefined,
      },
      initialProduct?.id
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto">
      <div className="bg-paper-card border-t sm:border border-paper-border rounded-t-2xl sm:rounded-xl max-w-4xl w-full h-[95dvh] sm:h-auto sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden sm:my-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-paper border-b border-paper-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-ink">
              {initialProduct ? '編輯二手商品資訊' : '刊登二手商品 / 教科書 / 漂書物資'}
            </h2>
            <p className="text-[11px] sm:text-xs text-ink-muted">
              支援最多 8 張圖片、ISBN 條碼掃描自動填表、食品/保養品效期檢核
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-paper-muted shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1">
          {/* ISBN Barcode Quick Scanner Banner */}
          <div className="p-4 rounded-xl bg-csmu-light/75 border border-csmu/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-sm font-bold text-csmu-dark">
                <Barcode className="w-4 h-4" />
                <span>教科書 ISBN 條碼掃描功能（手機鏡頭掃描自動填表）</span>
              </div>
              <p className="text-xs text-ink-muted">
                要賣醫學、護理、物治或通識課本嗎？掃描書背 ISBN 條碼即可自動帶入書名、作者、版次、科目與原價！
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowIsbnScanner(!showIsbnScanner)}
              className="px-4 py-2 rounded-lg bg-csmu hover:bg-csmu-dark text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>{showIsbnScanner ? '收起條碼掃描器' : '啟動 ISBN 條碼掃描'}</span>
            </button>
          </div>

          {scanSuccessMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{scanSuccessMessage}</span>
            </div>
          )}

          {/* Interactive Camera ISBN Barcode Viewfinder */}
          {showIsbnScanner && (
            <div className="p-4 rounded-xl bg-ink text-white space-y-4 border border-stone-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>CSMU ISBN BARCODE SCANNER ACTIVE (EAN-13 / ISBN-13)</span>
                </div>
                <span className="text-xs text-stone-400">點擊下方任一常用課本條碼模擬對焦掃描</span>
              </div>

              {/* Simulated Viewfinder Box */}
              <div className="relative h-28 rounded-lg bg-stone-900 border border-stone-700 flex flex-col items-center justify-center overflow-hidden">
                <div className="w-64 h-12 border-2 border-emerald-400/80 rounded flex items-center justify-center relative">
                  <div className="absolute inset-x-2 h-0.5 bg-terracotta animate-pulse" />
                  <span className="font-mono text-xs tracking-widest text-stone-300">
                    {scanningIsbn ? '正在解析 ISBN 圖書資料庫...' : '||| |||| || ||||| ||| ||||'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 mt-2">
                  將手機鏡頭對準書背右下角 978 開頭之 ISBN 條碼
                </p>
              </div>

              {/* Quick Test Barcodes for CSMU Books */}
              <div className="space-y-2">
                <p className="text-xs text-stone-300 font-semibold">
                  點擊模擬掃描中山醫熱門教科書條碼（自動填入書名、作者與原價）：
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ISBN_DATABASE.map((book) => (
                    <button
                      key={book.isbn}
                      type="button"
                      onClick={() => handleApplyIsbnRecord(book.isbn)}
                      className="p-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-left flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{book.title}</p>
                        <p className="text-[11px] text-stone-400 truncate">
                          {book.department}｜作者：{book.author}｜原價 ${book.originalPrice}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded bg-emerald-600 text-white font-mono text-[11px] shrink-0">
                        掃描 {book.isbn.slice(-4)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Product Images (5-8 photos, Drag & Drop, Set Cover) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-bold text-ink">
                1. 商品圖片（已上傳 {images.length} / 8 張・可滑鼠拖曳排序，第一張為首圖）
              </label>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-lg bg-csmu text-white text-xs font-semibold cursor-pointer hover:bg-csmu-dark flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>從手機/電腦上傳圖片</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Draggable Image Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((imgUrl, idx) => (
                <div
                  key={`${imgUrl}-${idx}`}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                  className={`relative group rounded-lg overflow-hidden border-2 bg-paper-muted aspect-[4/3] flex flex-col justify-between transition-all cursor-move ${
                    idx === 0 ? 'border-csmu ring-2 ring-csmu/20' : 'border-paper-border'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />

                  {/* Top Overlay: Cover badge & drag handle */}
                  <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between">
                    {idx === 0 ? (
                      <span className="px-2 py-0.5 rounded bg-csmu text-white text-[11px] font-bold flex items-center gap-1 shadow">
                        <Star className="w-3 h-3 fill-current" />
                        首圖封面
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAsCover(idx)}
                        className="px-2 py-0.5 rounded bg-ink/80 hover:bg-csmu text-white text-[10px] font-medium"
                      >
                        設為首圖
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1 rounded bg-ink/75 hover:bg-terracotta text-white"
                      title="移除此圖片"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Overlay: Reorder controls */}
                  <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between bg-ink/75 text-white px-2 py-1 rounded text-[11px]">
                    <span className="flex items-center gap-1 font-mono">
                      <GripVertical className="w-3 h-3" />#{idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveImage(idx, -1)}
                        className="p-0.5 hover:text-amber-300 disabled:opacity-30"
                        title="往前移"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => moveImage(idx, 1)}
                        className="p-0.5 hover:text-amber-300 disabled:opacity-30"
                        title="往後移"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Sample Photos & URL Input */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-ink-muted">快速帶入測試實拍圖：</span>
              {SAMPLE_CAMPUS_PHOTOS.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  disabled={images.length >= 8}
                  onClick={() =>
                    setImages((prev) => (prev.length < 8 ? [...prev, sample.url] : prev))
                  }
                  className="px-2.5 py-1 rounded bg-paper border border-paper-border hover:border-csmu text-ink-muted hover:text-ink disabled:opacity-40"
                >
                  + {sample.label}
                </button>
              ))}
              <div className="flex items-center gap-1 ml-auto">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="或貼上圖片網址..."
                  className="px-2.5 py-1 rounded border border-paper-border bg-paper text-xs w-40"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customImageUrl.trim() && images.length < 8) {
                      setImages((prev) => [...prev, customImageUrl.trim()]);
                      setCustomImageUrl('');
                    }
                  }}
                  className="px-2.5 py-1 rounded bg-paper-dark text-ink font-medium"
                >
                  新增
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Structured Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-paper-border">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                2. 結構化商品主分類 *
              </label>
              <select
                value={category}
                onChange={(e) =>
                  handleCategoryChange(e.target.value as Exclude<CategoryId, 'all'>)
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-paper-border bg-paper text-sm font-medium text-ink focus:outline-none focus:border-csmu"
              >
                {CATEGORY_CONFIGS.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                子分類 / 細項 *
              </label>
              <select
                value={subCategory}
                onChange={(e) => handleSubCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-paper-border bg-paper text-sm font-medium text-ink focus:outline-none focus:border-csmu"
              >
                {currentCategoryConfig.subCategories.map((sub) => (
                  <option key={sub.name} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional: Textbook Specific Fields */}
          {category === 'textbook' && (
            <div className="p-4 rounded-xl bg-paper border border-paper-border space-y-3">
              <div className="text-xs font-bold text-csmu flex items-center justify-between">
                <span>📚 教科書 / 課業學習專屬結構化欄位</span>
                <span className="text-ink-faint font-normal">讓同系學弟妹能依學院與科目精準搜尋</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-ink-muted mb-1">所屬學院</label>
                  <select
                    value={college}
                    onChange={(e) => {
                      const nextCol = e.target.value;
                      setCollege(nextCol);
                      const depts = CSMU_COLLEGES_MAP[nextCol] || [];
                      if (depts[0]) setDepartment(depts[0]);
                    }}
                    className="w-full px-3 py-2 rounded border border-paper-border bg-paper-card text-xs font-medium"
                  >
                    {Object.keys(CSMU_COLLEGES_MAP).map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-ink-muted mb-1">科系 / 通識學門</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-paper-border bg-paper-card text-xs font-medium"
                  >
                    {(CSMU_COLLEGES_MAP[college] || []).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-ink-muted mb-1">科目名稱 *</label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="例如：大體解剖學、生物統計學"
                    className="w-full px-3 py-2 rounded border border-paper-border bg-paper-card text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-ink-muted mb-1">出版年份 / 版次</label>
                  <input
                    type="text"
                    value={publishYearEdition}
                    onChange={(e) => setPublishYearEdition(e.target.value)}
                    placeholder="例如：2022年・第 8 版"
                    className="w-full px-3 py-2 rounded border border-paper-border bg-paper-card text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-ink-muted mb-1">作者</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="例如：Frank H. Netter"
                    className="w-full px-3 py-2 rounded border border-paper-border bg-paper-card text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-ink-muted mb-1">ISBN 國際標準書號</label>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978..."
                    className="w-full px-3 py-2 rounded border border-paper-border bg-paper-card text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Conditional: Expiry Date (Mandatory for Food & Cosmetics) */}
          {(mandatoryExpiry || expiryDate) && (
            <div
              className={`p-4 rounded-xl border space-y-2.5 ${
                expiryDate && expiryCheck.isExpired
                  ? 'bg-red-50 border-red-400'
                  : expiryDate && expiryCheck.isExpiringSoon
                  ? 'bg-amber-50 border-amber-400'
                  : 'bg-paper border-paper-border'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-terracotta" />
                    <span>
                      特殊欄位：有效日期（食品、保養品 / 化妝品強制填寫，過期商品禁止上架）*
                    </span>
                  </label>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    系統基準日：{REFERENCE_TODAY}｜效期少於 30 天將自動顯示「即期警示標籤」
                  </p>
                </div>

                <input
                  type="date"
                  required={mandatoryExpiry}
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-paper-border bg-white text-sm font-mono text-ink"
                />
              </div>

              {/* Quick test buttons for Expiry Date validation */}
              <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                <span className="text-ink-muted">快速測試效期檢核：</span>
                <button
                  type="button"
                  onClick={() => setExpiryDate('2026-10-01')}
                  className="px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-300 font-medium"
                >
                  測試「已過期 (2026-10-01)」阻擋
                </button>
                <button
                  type="button"
                  onClick={() => setExpiryDate('2026-11-20')}
                  className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-medium"
                >
                  測試「即期品 (剩 10 天)」自動標籤
                </button>
                <button
                  type="button"
                  onClick={() => setExpiryDate('2027-08-15')}
                  className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-medium"
                >
                  測試「正常效期 (2027-08-15)」
                </button>
              </div>

              {/* Real-time Validation Feedback */}
              {expiryDate && expiryCheck.isExpired && (
                <div className="p-2.5 rounded bg-red-600 text-white text-xs font-bold flex items-center gap-2">
                  <Ban className="w-4 h-4 shrink-0" />
                  <span>
                    過期商品禁止上架！您輸入的有效日期 ({expiryDate}) 已過期，系統已鎖定上架按鈕。
                  </span>
                </div>
              )}

              {expiryDate && expiryCheck.isExpiringSoon && (
                <div className="p-2.5 rounded bg-amber-800 text-white text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    即期商品自動提醒：距離到期剩餘 {expiryCheck.daysLeft} 天，上架後商品卡將自動顯示「⚠️ 即期警示標籤」。
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Basic Info Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                3. 商品名稱 *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：Netter's 人體解剖學圖譜 第8版 / 大慶街退宿聲寶雙門小冰箱"
                className="w-full px-3.5 py-2.5 rounded-lg border border-paper-border bg-paper text-sm text-ink focus:outline-none focus:border-csmu"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  預售價 (NT$) *
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="必填，免費填 0"
                  className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-sm font-mono font-bold text-terracotta-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-muted mb-1">
                  購入原價 (選填)
                </label>
                <input
                  type="number"
                  min={0}
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="選填，顯示折扣比對"
                  className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  新舊程度 *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ItemCondition)}
                  className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-sm"
                >
                  <option value="全新未拆">全新未拆</option>
                  <option value="九成新">九成新</option>
                  <option value="八成新">八成新</option>
                  <option value="有使用痕跡/畫記">有使用痕跡/畫記</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  商品數量 *
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-lg border border-paper-border bg-paper text-sm font-mono"
                />
              </div>
            </div>

            {/* Toggles: Negotiable & Urgent Sale */}
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={negotiable}
                  onChange={(e) => setNegotiable(e.target.checked)}
                  className="rounded border-paper-border text-csmu focus:ring-csmu w-4 h-4"
                />
                <span>接受買家小幅議價</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-terracotta-dark cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded border-paper-border text-terracotta focus:ring-terracotta w-4 h-4"
                />
                <span>列入首頁「急售 / 降價專區」</span>
              </label>

              {isUrgent && (
                <input
                  type="text"
                  value={urgentReason}
                  onChange={(e) => setUrgentReason(e.target.value)}
                  placeholder="急售標籤（如：月底退宿急售）"
                  className="px-3 py-1 rounded border border-terracotta/40 bg-terracotta-light/40 text-xs text-terracotta-dark font-medium"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                商品詳細描述（書況畫記說明、配件、可面交時段）*
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="請詳述商品狀況，例如：第幾章有螢光筆畫記、是否附光碟/序號、小家電使用年份與清潔狀況..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-paper-border bg-paper text-sm text-ink focus:outline-none focus:border-csmu"
              />
            </div>
          </div>

          {/* Section 4: Meetup Locations */}
          <div className="space-y-2 pt-2 border-t border-paper-border">
            <label className="block text-xs font-bold text-ink">
              4. 交易地點偏好（可複選中山醫校園與大慶周邊公開地標）*
            </label>
            <div className="flex flex-wrap gap-2">
              {CSMU_MEETUP_LOCATIONS.map((loc) => {
                const selected = meetupLocations.includes(loc);
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => toggleLocation(loc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                      selected
                        ? 'bg-csmu text-white border-csmu'
                        : 'bg-paper text-ink-muted border-paper-border hover:border-csmu'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{loc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {formError && (
            <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-900 text-xs font-bold">
              ⚠️ {formError}
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-paper-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-paper-border text-xs font-semibold text-ink-muted hover:bg-paper-muted"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={Boolean(expiryDate && expiryCheck.isExpired)}
              className="px-6 py-2.5 rounded-lg bg-csmu hover:bg-csmu-dark disabled:bg-stone-300 disabled:text-stone-500 text-white text-sm font-bold shadow-sm transition-colors"
            >
              {initialProduct ? '儲存變更' : '確認上架商品'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

