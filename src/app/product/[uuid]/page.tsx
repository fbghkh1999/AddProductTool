'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface Attribute {
  key: string;
  values: string[];
  possible_values: string[];
}

interface ProductDetails {
  id: number;
  uuid: string;
  title: string;
  image_urls: string[] | null;
  attributes: Attribute[];
  description: string;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product with UUID:', params.uuid);
        const response = await fetch(`/api/product/${params.uuid}`);

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error('خطا در دریافت اطلاعات محصول');
        }

        const data = await response.json();
        console.log('Product data received:', data);
        setProduct(data);

        const initialValues: { [key: string]: string } = {};
        if (data.attributes && Array.isArray(data.attributes)) {
          data.attributes.forEach((attr: Attribute) => {
            initialValues[attr.key] = attr.values[0] || '';
          });
        }
        setSelectedValues(initialValues);
      } catch (error) {
        console.error('Error fetching product:', error);
        alert('خطا در دریافت اطلاعات محصول');
      } finally {
        setLoading(false);
      }
    };

    if (params.uuid) {
      fetchProduct();
    }
  }, [params.uuid]);

  const handleValueChange = (key: string, value: string) => {
    setSelectedValues(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!product) return;

    const attributes = Object.entries(selectedValues).map(([key, value]) => ({
      key,
      value,
    }));

    const productData = {
      name: product.title,
      imageUrl: product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : null,
      attributes,
      description: product.description || '',
      pgp_uuid: product.uuid,
    };

    const dataParam = encodeURIComponent(JSON.stringify(productData));
    router.push(`/product-form?data=${dataParam}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-[#1C2575] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600">محصولی یافت نشد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="flex flex-col items-start gap-5 max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-[#1C2575] hover:bg-slate-50 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">بازگشت</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden p-6 sm:p-8 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 pb-6 sm:pb-8 border-b border-slate-200 mb-6 sm:mb-8">
            {product.image_urls && product.image_urls.length > 0 && product.image_urls[0] ? (
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={product.image_urls[0]}
                  alt={product.title}
                  fill
                  className="object-contain p-4"
                />
              </div>
            ) : (
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            <div className="flex-1 text-center sm:text-right">
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">{product.title}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>محصول انتخاب شده</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {(!product.attributes || product.attributes.length === 0) && (!product.description || product.description.trim() === '') ? (
              <div className="p-8 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-100 rounded-full mb-4">
                  <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15s1.5-2 4-2 4 2 4 2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={2} strokeLinecap="round" />
                    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={2} strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-base text-slate-600">مشخصات محصولت رو پیدا نکردیم</p>
              </div>
            ) : (
              <>
                {product.attributes && product.attributes.length > 0 && (
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6">ویژگی‌های محصول</h2>
                    <div className="flex flex-col gap-4 sm:gap-5">
                      {product.attributes.map((attr, index) => (
                        <div
                          key={index}
                          className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl"
                        >
                          <label className="block text-sm sm:text-base font-bold text-slate-800 mb-3 sm:mb-4">
                            {attr.key}
                          </label>

                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                            {attr.possible_values.map((value, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleValueChange(attr.key, value)}
                                className={`
                                  px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-300
                                  ${selectedValues[attr.key] === value
                                    ? 'bg-[#1C2575] border-[#1C2575] text-white shadow-lg shadow-blue-900/30 transform scale-105'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-[#1C2575] hover:bg-blue-50'
                                  }
                                `}
                              >
                                {value}
                              </button>
                            ))}
                          </div>

                          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>انتخاب شده: <strong className="text-[#1C2575]">{selectedValues[attr.key]}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {product.description && (
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <h2 className="text-base sm:text-lg font-bold text-slate-800">توضیحات محصول</h2>
                      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-[10px] sm:text-xs font-semibold text-purple-700">تولید شده با هوش مصنوعی</span>
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-right">
                      {product.description}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={handleSubmit}
              className="w-full px-8 py-5 bg-gradient-to-r from-[#1C2575] to-[#2a3699] text-white text-base font-bold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              <span>تایید و ادامه</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
