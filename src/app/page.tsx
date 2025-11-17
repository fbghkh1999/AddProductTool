'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { isAuthenticated, clearTokens, getAccessToken } from '@/utils/auth';

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
      const token = getAccessToken();
      if (!token) {
        alert('لطفا ابتدا وارد شوید');
        router.push('/login');
        return;
      }

      let imageId = '0';

      if (image) {
        console.log('Uploading image to uploadio first...');
        const uploadFormData = new FormData();
        uploadFormData.append('file', image);

        const uploadResponse = await fetch('/api/upload-search-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('خطا در آپلود تصویر');
        }

        const uploadData = await uploadResponse.json();
        imageId = uploadData.id || '0';
        console.log('Image uploaded to uploadio, ID:', imageId);
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('image_id', imageId);
      formData.append('image_reference_id', '0');
      formData.append('product_id', '0');
      formData.append('size', '6');
      formData.append('offset', '0');

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all duration-300 shadow-md hover:shadow-lg group"
        >
          <svg className="w-4 h-4 text-slate-600 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-sm font-medium text-slate-700 group-hover:text-red-600">خروج</span>
        </button>
      </div>

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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="px-6 sm:px-12 lg:px-16 py-12 sm:py-16 lg:py-20">
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="text-center space-y-8">
                <div className="relative inline-flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-[#1C2575] via-[#2a3699] to-[#3b47bd] rounded-3xl shadow-xl shadow-blue-900/20 transform hover:scale-105 transition-transform duration-300">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#1C2575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-4 max-w-2xl mx-auto">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 leading-tight">
                    افزودن محصول با دستیار هوشمند
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    دستیار هوش مصنوعی با بررسی نام یا عکس محصولی که وارد کردی بهت کمک میکنه محصولت رو سریع تر بسازی و به باسلام اد کنی
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
                  <div className="relative">
                    <label className="group relative flex flex-col items-center justify-center w-48 h-48 sm:w-56 sm:h-56 bg-gradient-to-br from-slate-50 to-slate-100/50 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-[#1C2575] hover:from-blue-50 hover:to-purple-50/30 transition-all duration-300 overflow-hidden">
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
                          <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                            <svg className="w-8 h-8 text-slate-600 group-hover:text-[#1C2575] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-slate-600 group-hover:text-[#1C2575] transition-colors">افزودن عکس</span>
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

                  <div className="w-full lg:flex-1 lg:max-w-md space-y-4 p-8 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                    <label className="block text-base font-semibold text-slate-800">
                      عنوان محصول
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="مثلا: گوشی موبایل سامسونگ گلکسی"
                      className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-xl text-sm text-right placeholder:text-slate-400 focus:border-[#1C2575] focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto min-w-[280px] mx-auto flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-[#1C2575] via-[#2a3699] to-[#1C2575] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white text-base font-bold rounded-xl shadow-lg shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-900/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>در حال جستجو...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>جستجو محصول</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            با استفاده از هوش مصنوعی، محصولات خود را سریع‌تر اضافه کنید
          </p>
        </div>
      </div>
    </div>
  );
}
