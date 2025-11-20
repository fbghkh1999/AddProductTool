'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface Product {
  id: number;
  uuid: string;
  title: string;
  image_urls: string[];
  title_similarity_score: number | null;
  image_similarity_score: number | null;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const resultsData = searchParams.get('data');
    if (resultsData) {
      try {
        const parsedProducts = JSON.parse(decodeURIComponent(resultsData));

        const uniqueProducts = parsedProducts.reduce((acc: Product[], current: Product) => {
          const existingProduct = acc.find(p => p.title === current.title);
          if (!existingProduct) {
            acc.push(current);
          } else {
            console.log('Duplicate title removed:', current.title);
          }
          return acc;
        }, []);

        console.log('Total products:', parsedProducts.length);
        console.log('Unique products:', uniqueProducts.length);
        console.log('Duplicates removed:', parsedProducts.length - uniqueProducts.length);

        setProducts(uniqueProducts);
      } catch (error) {
        console.error('Error parsing results:', error);
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="flex flex-col items-start gap-6 max-w-4xl mx-auto py-12 px-4">
        <div className="w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-8 py-4 bg-white border border-[#E5E5EA] rounded-xl hover:border-[#1C2575] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-base font-semibold">بازگشت</span>
          </button>
        </div>

        {/* Progress Flow Indicator */}
        <div className="w-full bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            {/* Step 1 - جستجو */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1C2575] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-[#1C2575]">جستجو</span>
            </div>

            {/* Line */}
            <div className="flex-1 h-0.5 bg-[#1C2575] mx-2"></div>

            {/* Step 2 - انتخاب محصول (Current) */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1C2575] flex items-center justify-center">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <span className="text-sm font-semibold text-[#1C2575]">انتخاب محصول</span>
            </div>

            {/* Line */}
            <div className="flex-1 h-0.5 bg-[#E5E5EA] mx-2"></div>

            {/* Step 3 - تکمیل اطلاعات */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E5E5EA] flex items-center justify-center">
                <span className="text-[#8E8E93] font-bold text-sm">3</span>
              </div>
              <span className="text-sm font-semibold text-[#8E8E93]">تکمیل اطلاعات</span>
            </div>

            {/* Line */}
            <div className="flex-1 h-0.5 bg-[#E5E5EA] mx-2"></div>

            {/* Step 4 - اتمام */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E5E5EA] flex items-center justify-center">
                <span className="text-[#8E8E93] font-bold text-sm">4</span>
              </div>
              <span className="text-sm font-semibold text-[#8E8E93]">اتمام</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 w-full">
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm p-16 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-[#F5F5F7] rounded-full mb-6">
                <svg className="w-12 h-12 text-[#8E8E93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#3D3D4E] mb-3">
                محصول یافت نشد
              </h2>
              <p className="text-sm text-[#8E8E93] mb-8">
                محصول مورد نظر شما در باسلام وجود ندارد
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://vendor.basalam.com/create-product"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 bg-[#1C2575] text-white text-sm font-semibold rounded-xl hover:bg-[#151d5f] transition-all flex items-center justify-center gap-2"
                >
                  <span>ایجاد دستی محصول در باسلام</span>
                </a>
                <button
                  onClick={() => router.back()}
                  className="w-full sm:w-auto px-8 py-4 bg-white border border-[#E5E5EA] text-[#3D3D4E] text-sm font-semibold rounded-xl hover:bg-[#F5F5F7] transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>جستجوی دوباره</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl shadow-sm border border-[#E5E5EA] hover:border-[#1C2575] overflow-hidden transition-all"
              >
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6">
                  {product.image_urls && product.image_urls.length > 0 && product.image_urls[0] ? (
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-[#F5F5F7] rounded-2xl overflow-hidden">
                      <Image
                        src={product.image_urls[0]}
                        alt={product.title}
                        fill
                        className="object-contain p-3"
                      />
                    </div>
                  ) : (
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-[#F5F5F7] rounded-2xl flex items-center justify-center">
                      <svg className="w-14 h-14 text-[#8E8E93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1 min-w-0 w-full sm:w-auto text-center sm:text-right">
                    <h3 className="text-sm font-semibold text-[#3D3D4E] mb-2">
                      {product.title}
                    </h3>
                    <p className="text-xs text-[#8E8E93]">
                      مشاهده جزئیات و انتخاب ویژگی‌ها
                    </p>
                  </div>

                  <button
                    onClick={() => router.push(`/product/${product.uuid}`)}
                    className="w-full sm:w-auto flex-shrink-0 px-8 py-4 bg-[#1C2575] text-white text-sm font-semibold rounded-xl hover:bg-[#151d5f] transition-all"
                  >
                    <span>انتخاب محصول</span>
                  </button>
                </div>
              </div>
              ))}

              <div className="bg-white rounded-3xl shadow-sm border border-[#E5E5EA] p-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="text-center sm:text-right">
                    <h3 className="text-sm font-semibold text-[#3D3D4E] mb-2">محصول مورد نظرت را پیدا نکردی؟</h3>
                    <p className="text-xs text-[#8E8E93]">می‌توانی محصول جدیدی ایجاد کنی یا دوباره جستجو کن</p>
                  </div>
                  <button
                    onClick={() => router.push('/')}
                    className="w-full sm:w-auto px-8 py-4 bg-[#1C2575] text-white text-sm font-semibold rounded-xl hover:bg-[#151d5f] transition-all"
                  >
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

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-[#1C2575] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">در حال بارگذاری...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
