'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { isAuthenticated, clearTokens } from '@/utils/auth';

export default function Home() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    console.log('🔍 Checking authentication on main page');
    const token = localStorage.getItem('basalam_token');
    console.log('Token status:', {
      exists: !!token,
      preview: token ? token.substring(0, 20) + '...' : null,
      isAuthenticated: isAuthenticated()
    });

    if (!isAuthenticated()) {
      console.log('❌ Not authenticated - redirecting to login');
      router.push('/login');
    } else {
      console.log('✅ Authenticated - showing main page');
      setCheckingAuth(false);
    }
  }, [router]);

  const handleLogout = () => {
    clearTokens();
    router.push('/login');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-[#1C2575] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title && !image) {
      alert('لطفا حداقل عنوان یا تصویر را وارد کنید');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      if (image) {
        formData.append('image_file', image);
      }
      formData.append('image_id', '0');
      formData.append('image_reference_id', '0');
      formData.append('product_id', '0');
      formData.append('size', '6');
      formData.append('offset', '0');

      const response = await fetch('/api/search', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`خطا در دریافت اطلاعات از سرور: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      const encodedData = encodeURIComponent(JSON.stringify(data));
      router.push(`/results?data=${encodedData}`);
    } catch (error) {
      console.error('Error:', error);
      alert('خطا در جستجو محصول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOHpNNjAgMzZjMC05Ljk0LTguMDYtMTgtMTgtMThzLTE4IDguMDYtMTggMTggOC4wNiAxOCAxOCAxOCAxOC04LjA2IDE4LTE4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>

      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/60 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1C2575] to-[#4a5bcf] rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">ابزار افزودن محصول</h2>
                <p className="text-xs text-slate-500">باسلام</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200/60 shadow-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#1C2575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-700">فروشنده</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      {loading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-start gap-5 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center w-full gap-6 sm:gap-8">
              <div className="relative">
                <div className="w-32 h-32 border-8 border-slate-200 border-t-[#1C2575] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-16 h-16 text-[#1C2575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 animate-pulse">
                  <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="absolute -bottom-2 -left-2 animate-pulse" style={{ animationDelay: '0.3s' }}>
                  <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="absolute -top-3 -left-3 animate-pulse" style={{ animationDelay: '0.6s' }}>
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>

              <div className="text-center space-y-2 sm:space-y-3 px-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">هوش مصنوعی در حال تحلیل...</h2>
                <p className="text-sm sm:text-base text-slate-600">دستیار هوشمند در حال یافتن بهترین محصولات مشابه است</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#1C2575] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-[#1C2575] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-[#1C2575] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/20 overflow-hidden hover:shadow-[0_8px_48px_0_rgba(31,38,135,0.25)] transition-all duration-500">
          <div className="px-6 sm:px-12 lg:px-16 py-12 sm:py-16 lg:py-20 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-3xl -z-10"></div>
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="text-center space-y-8">
                <div className="relative inline-flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-[#1C2575] via-[#2a3699] to-[#4a5bcf] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(28,37,117,0.5)] transform hover:scale-105 hover:rotate-2 transition-all duration-500 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 text-white relative z-10 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <div className="absolute -bottom-3 -right-3 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-white to-indigo-50 rounded-full flex items-center justify-center shadow-[0_8px_24px_-6px_rgba(28,37,117,0.4)] transform group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#1C2575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                </div>

                <div className="space-y-4 max-w-2xl mx-auto">
                  <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-l from-[#1C2575] via-[#2a3699] to-[#4a5bcf] bg-clip-text text-transparent leading-tight tracking-tight">
                    افزودن محصول با دستیار هوشمند
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
                    دستیار هوش مصنوعی با بررسی نام یا عکس محصولی که وارد کردی بهت کمک میکنه محصولت رو سریع تر بسازی و به باسلام اد کنی
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-l from-green-50 to-emerald-50 border border-green-200/60 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-green-700">هوش مصنوعی آنلاین</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
                  <div className="relative">
                    <label className="group relative flex flex-col items-center justify-center w-48 h-48 sm:w-56 sm:h-56 bg-white/60 backdrop-blur-md border-2 border-dashed border-slate-300/60 rounded-[1.5rem] cursor-pointer hover:border-[#1C2575] hover:bg-gradient-to-br hover:from-indigo-50/80 hover:to-purple-50/80 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-xl hover:shadow-indigo-200/50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      {imagePreview && imagePreview.trim() !== '' ? (
                        <div className="relative w-full h-full p-3">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-contain rounded-xl"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-xl" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4 p-6">
                          <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:from-[#1C2575] group-hover:to-[#2a3699] transition-all duration-500 shadow-md group-hover:shadow-lg group-hover:scale-110 group-hover:-rotate-6">
                            <svg className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md group-hover:bg-green-400 transition-all duration-300">
                              <svg className="w-4 h-4 text-indigo-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-slate-700 group-hover:text-[#1C2575] transition-colors duration-300">افزودن عکس</span>
                          <span className="text-xs text-slate-500">JPG, PNG یا WEBP</span>
                        </div>
                      )}
                    </label>
                    {imagePreview && imagePreview.trim() !== '' && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-10"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center">
                    <div className="px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-50 rounded-full">
                      <span className="text-lg font-medium text-slate-500">یا</span>
                    </div>
                  </div>

                  <div className="w-full lg:flex-1 lg:max-w-md space-y-4 p-8 bg-white/60 backdrop-blur-md border border-white/20 rounded-[1.5rem] shadow-[0_8px_24px_-4px_rgba(31,38,135,0.1)] hover:shadow-[0_8px_32px_-4px_rgba(31,38,135,0.2)] transition-all duration-500">
                    <label className="flex items-center gap-2 text-base font-bold text-slate-800">
                      <svg className="w-5 h-5 text-[#1C2575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      عنوان محصول
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="مثلا: گوشی موبایل سامسونگ گلکسی"
                      className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200/60 rounded-xl text-sm text-right placeholder:text-slate-400 focus:border-[#1C2575] focus:ring-4 focus:ring-indigo-100/50 focus:outline-none focus:bg-white transition-all duration-300 shadow-inner hover:border-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-200/60">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full sm:w-auto min-w-[320px] mx-auto flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-[#1C2575] via-[#2a3699] to-[#4a5bcf] text-white text-base font-bold rounded-2xl shadow-[0_20px_50px_-10px_rgba(28,37,117,0.5)] hover:shadow-[0_25px_60px_-10px_rgba(28,37,117,0.7)] transform hover:scale-105 active:scale-95 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
                  {loading ? (
                    <>
                      <svg className="animate-spin w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="relative z-10">در حال جستجو...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="relative z-10">جستجو با هوش مصنوعی</span>
                      <svg className="w-4 h-4 relative z-10 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-6 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>تشخیص هوشمند</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>سریع و دقیق</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>امن و مطمئن</span>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            با استفاده از هوش مصنوعی، محصولات خود را سریع‌تر اضافه کنید
          </p>
        </div>
      </div>
    </div>
  );
}
