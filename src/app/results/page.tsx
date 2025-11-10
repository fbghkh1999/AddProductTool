'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Product {
  id: number;
  uuid: string;
  title: string;
  image_urls: string[];
  title_similarity_score: number | null;
  image_similarity_score: number | null;
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const resultsData = searchParams.get('data');
    if (resultsData) {
      try {
        const parsedProducts = JSON.parse(decodeURIComponent(resultsData));
        setProducts(parsedProducts);
      } catch (error) {
        console.error('Error parsing results:', error);
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="flex flex-col items-start gap-5 max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-[#1C2575] hover:bg-slate-50 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">بازگشت به جستجو</span>
          </button>
        </div>

        <div className="flex flex-col gap-5 w-full">
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-16 text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-6">
                <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-3">
                هیچ نتیجه‌ای یافت نشد
              </h2>
              <p className="text-base text-slate-500">
                لطفا جستجوی دیگری انجام دهید
              </p>
            </div>
          ) : (
            <>
              {products.map((product, index) => (
              <div
                key={product.id}
                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl border-2 border-slate-100 hover:border-[#1C2575]/40 overflow-hidden transition-all duration-500 transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#1C2575] via-[#2a3699] to-[#3b47bd] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>

                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 p-6 sm:p-8">
                  {product.image_urls && product.image_urls.length > 0 && product.image_urls[0] ? (
                    <div className="relative w-32 h-32 sm:w-48 sm:h-48 flex-shrink-0 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-500">
                      <Image
                        src={product.image_urls[0]}
                        alt={product.title}
                        fill
                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="relative w-32 h-32 sm:w-48 sm:h-48 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-md">
                      <svg className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1 min-w-0 w-full sm:w-auto text-center sm:text-right sm:pr-6">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2 sm:mb-3 leading-relaxed group-hover:text-[#1C2575] transition-colors duration-300">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="hidden sm:inline">کلیک کنید برای مشاهده جزئیات و انتخاب ویژگی‌ها</span>
                      <span className="sm:hidden">مشاهده جزئیات</span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/product/${product.uuid}`)}
                    className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#1C2575] via-[#2a3699] to-[#1C2575] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white text-sm sm:text-base font-bold rounded-2xl shadow-lg shadow-blue-900/30 hover:shadow-2xl hover:shadow-blue-900/50 transition-all duration-500 transform group-hover:scale-110"
                  >
                    <span>انتخاب محصول</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1C2575]/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
              </div>
              ))}

              <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-100 overflow-hidden p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">محصول مورد نظرت را پیدا نکردی؟</h3>
                      <p className="text-xs sm:text-sm text-slate-600">می‌توانی محصول جدیدی ایجاد کنی یا دوباره جستجو کن</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm sm:text-base font-bold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>ایجاد محصول جدید</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
