'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

function ProductSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [productId, setProductId] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setProductId(id);
    } else {
      router.push('/dashboard');
    }
  }, [searchParams, router]);

  if (!productId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-[#1C2575] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-6">
        {/* Progress Flow Indicator */}
        <div className="w-full bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            {/* Step 1 - جستجو */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1C2575] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#1C2575] hidden sm:inline">جستجو</span>
            </div>

            {/* Line */}
            <div className="flex-1 h-0.5 bg-[#1C2575] mx-1 sm:mx-2"></div>

            {/* Step 2 - انتخاب محصول */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1C2575] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#1C2575] hidden sm:inline">انتخاب محصول</span>
            </div>

            {/* Line */}
            <div className="flex-1 h-0.5 bg-[#1C2575] mx-1 sm:mx-2"></div>

            {/* Step 3 - تکمیل اطلاعات */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1C2575] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#1C2575] hidden sm:inline">تکمیل اطلاعات</span>
            </div>

            {/* Line */}
            <div className="flex-1 h-0.5 bg-[#1C2575] mx-1 sm:mx-2"></div>

            {/* Step 4 - اتمام (Current/Complete) */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1C2575] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#1C2575] hidden sm:inline">اتمام</span>
            </div>
          </div>
        </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden w-full">
        {/* Success Header with Animation */}
        <div className="relative bg-[#1C2575] p-12 text-center overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full mb-6 shadow-lg">
              <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">محصول اضافه شد</h1>
            <p className="text-sm sm:text-base text-white/80">محصول شما با موفقیت در باسلام ثبت شد</p>
          </div>
        </div>

        <div className="p-8 sm:p-10 space-y-8">
          {/* Product ID Card */}
          <div className="p-6 bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1C2575] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-[#8E8E93] mb-1">شناسه محصول</p>
                  <p className="text-sm sm:text-base font-mono font-bold text-[#3D3D4E]">{productId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-700">فعال</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => router.push(`/edit-product/${productId}`)}
              className="px-6 py-4 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>ویرایش ویژگی‌ها</span>
            </button>

            <a
              href={`https://vendor.basalam.com/edit-product/${productId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 bg-white border-2 border-[#1C2575] text-[#1C2575] text-sm font-semibold rounded-xl hover:bg-[#1C2575] hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>مشاهده محصول در باسلام</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-4 bg-white border border-[#E5E5EA] text-[#3D3D4E] text-sm font-semibold rounded-xl hover:bg-[#F5F5F7] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>افزودن محصول جدید</span>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function ProductSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-[#1C2575] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">در حال بارگذاری...</p>
        </div>
      </div>
    }>
      <ProductSuccessContent />
    </Suspense>
  );
}
