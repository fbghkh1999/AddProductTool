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
      router.push('/');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden max-w-3xl w-full animate-fade-in">
        {/* Success Header with Animation */}
        <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 p-10 text-center overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-20 translate-y-20"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-full mb-5 shadow-lg animate-bounce-slow">
              <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">محصول اضافه شد</h1>
            <p className="text-lg text-green-50">محصول شما با موفقیت در باسلام ثبت شد</p>
          </div>
        </div>

        <div className="p-8 sm:p-10 space-y-6">
          {/* Success Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-green-50 to-emerald-50/50 border border-green-200 rounded-xl">
              <div className="w-10 h-10 flex-shrink-0 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-green-800 mb-1">محصول ایجاد شد</h3>
                <p className="text-xs text-green-600">در باسلام ثبت شد</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200 rounded-xl">
              <div className="w-10 h-10 flex-shrink-0 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-blue-800 mb-1">به گروه اضافه شد</h3>
                <p className="text-xs text-blue-600">در صفحه گروه محصول</p>
              </div>
            </div>
          </div>

          {/* Product ID Card */}
          <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1C2575] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">شناسه محصول</p>
                  <p className="text-sm font-mono font-bold text-slate-800">{productId}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-green-700">فعال</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <a
              href={`https://vendor.basalam.com/edit-product/${productId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-[#1C2575] to-[#2a3699] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>مشاهده در باسلام</span>
              <svg className="w-4 h-4 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <button
              onClick={() => router.push('/')}
              className="group px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-[#1C2575] hover:bg-blue-50 hover:text-[#1C2575] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>افزودن محصول جدید</span>
            </button>
          </div>

          {/* Footer Tip */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p>می‌توانید محصول خود را در پنل فروشندگی باسلام مشاهده و ویرایش کنید</p>
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
