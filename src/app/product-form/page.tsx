'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getAccessToken, getVendorId } from '@/utils/auth';

export const dynamic = 'force-dynamic';

interface Category {
  cat_id: number;
  cat_title: string;
  cat_parent: {
    cat_id: number;
    cat_title: string;
    cat_parent: {
      cat_id: number;
      cat_title: string;
      cat_parent: null;
    } | null;
  } | null;
}

function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productName, setProductName] = useState('');
  const [nameError, setNameError] = useState('');
  const [formData, setFormData] = useState({
    category_id: '',
    preparation_days: '1',
    weight: '',
    package_weight: '',
    primary_price: '10000',
    stock: '1',
  });

  const [productData, setProductData] = useState<any>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        setProductData(parsed);
        setProductName(parsed.name);
      } catch (error) {
        console.error('Error parsing product data:', error);
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [searchParams, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!productData?.name) {
        console.log('Product name is empty, skipping category detection');
        return;
      }

      console.log('Fetching categories for product name:', productData.name);
      setLoadingCategories(true);
      try {
        const response = await fetch(`/api/detect-category?title=${encodeURIComponent(productData.name)}`);
        console.log('Category detection response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Category detection failed:', errorText);
          throw new Error('خطا در دریافت دسته‌بندی‌ها');
        }

        const data = await response.json();
        console.log('Category detection data:', data);

        if (data.status === 'OK' && data.result && Array.isArray(data.result)) {
          console.log('Found categories:', data.result.length);
          setCategories(data.result);
          if (data.result.length > 0) {
            setFormData(prev => ({ ...prev, category_id: data.result[0].cat_id.toString() }));
          }
        } else {
          console.log('No categories found in response or unexpected format');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [productData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productData) return;

    if (parseInt(formData.primary_price) < 10000) {
      alert('قیمت نمیتواند کمتر از 10000 تومان باشد.');
      return;
    }

    setSubmitting(true);

    try {
      let photoId = null;

      if (productData.imageUrl) {
        // OAuth disabled - using hardcoded token in API
        // const token = getAccessToken();
        // if (!token) {
        //   alert('لطفا ابتدا وارد شوید');
        //   router.push('/login');
        //   return;
        // }

        const uploadFormData = new FormData();
        uploadFormData.append('imageUrl', productData.imageUrl);

        const token = getAccessToken();
        if (!token) {
          alert('لطفا ابتدا وارد شوید');
          router.push('/login');
          return;
        }

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'خطا در آپلود تصویر');
        }

        const uploadData = await uploadResponse.json();
        console.log('Upload response:', uploadData);
        console.log('Photo ID extracted:', uploadData?.id);
        photoId = uploadData?.id || null;

        if (!photoId) {
          alert('خطا: شناسه تصویر دریافت نشد');
          console.error('Upload data:', uploadData);
          setSubmitting(false);
          return;
        }
      }

      const token = getAccessToken();
      if (!token) {
        alert('لطفا ابتدا وارد شوید');
        router.push('/login');
        return;
      }

      const vendorId = getVendorId();
      if (!vendorId) {
        alert('شناسه فروشنده یافت نشد. لطفا دوباره وارد شوید');
        router.push('/login');
        return;
      }

      const createData = {
        name: productName,
        photoId,
        attributes: productData.attributes,
        description: productData.description || '',
        category_id: parseInt(formData.category_id),
        preparation_days: parseInt(formData.preparation_days),
        package_weight: parseInt(formData.package_weight),
        weight: parseInt(formData.weight),
        primary_price: formData.primary_price ? parseInt(formData.primary_price) * 10 : null,
        stock: formData.stock ? parseInt(formData.stock) : null,
        vendor_id: parseInt(vendorId),
      };

      console.log('Create data to send:', createData);

      const createResponse = await fetch('/api/create-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(createData),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error('Create product error:', errorData);

        if (createResponse.status === 422 && errorData.messages) {
          const nameErrorMsg = errorData.messages.find((msg: any) =>
            msg.fields && msg.fields.includes('name')
          );

          if (nameErrorMsg) {
            setNameError(nameErrorMsg.message || 'نام کالا تکراری است');
            alert(`${nameErrorMsg.message}\n\nلطفا نام محصول را ویرایش کنید.`);
            setSubmitting(false);
            return;
          }
        }

        const errorMessage = errorData.error || 'خطا در ایجاد محصول';
        alert(errorMessage);
        setSubmitting(false);
        return;
      }

      const result = await createResponse.json();
      console.log('Product created successfully:', result);

      const productId = result.id || result.product_id || result.data?.id || null;

      // Add product to PGP group if uuid exists
      if (productId && productData.pgp_uuid) {
        console.log('Adding product to PGP group:', productData.pgp_uuid);
        try {
          const addToGroupResponse = await fetch('/api/add-to-group', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              pgp_uuid: productData.pgp_uuid,
              product_id: productId
            }),
          });

          if (!addToGroupResponse.ok) {
            console.error('Failed to add product to group, but product was created');
          } else {
            console.log('✅ Product added to PGP group successfully');
          }
        } catch (error) {
          console.error('Error adding to group:', error);
          // Don't fail the whole flow if adding to group fails
        }
      }

      if (productId) {
        router.push(`/product-success?id=${productId}`);
      } else {
        alert('محصول شما با موفقیت اضافه شد و به صفحه گروه این محصول نیز اضافه شد');
        router.push('/');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('خطا در ایجاد محصول');
    } finally {
      setSubmitting(false);
    }
  };

  if (!productData) {
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">تکمیل اطلاعات محصول</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border-2 border-slate-200">
              <h2 className="text-base font-bold text-[#1C2575] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                مشخصات اصلی محصول
              </h2>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                نام محصول <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => {
                  setProductName(e.target.value);
                  setNameError('');
                }}
                placeholder="نام محصول"
                className={`w-full px-4 py-3 bg-white border-2 ${
                  nameError ? 'border-red-500' : 'border-slate-200'
                } rounded-xl text-sm text-right focus:border-[#1C2575] focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all`}
              />
              {nameError && (
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {nameError}
                </p>
              )}
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border-2 border-slate-200">
              <h2 className="text-base font-bold text-[#1C2575] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                دسته‌بندی محصول
              </h2>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                دسته‌بندی <span className="text-red-500">*</span>
              </label>
              {loadingCategories ? (
                <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl">
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-[#1C2575] rounded-full animate-spin"></div>
                  <span className="text-sm text-slate-600">در حال تشخیص دسته‌بندی...</span>
                </div>
              ) : categories.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {categories.map((cat) => {
                    const getCategoryPath = (category: Category): string => {
                      const path = [category.cat_title];
                      let parent = category.cat_parent;
                      while (parent) {
                        path.unshift(parent.cat_title);
                        parent = parent.cat_parent;
                      }
                      return path.join(' > ');
                    };

                    return (
                      <button
                        key={cat.cat_id}
                        type="button"
                        onClick={() => setFormData({ ...formData, category_id: cat.cat_id.toString() })}
                        className={`
                          p-4 rounded-xl border-2 text-right transition-all duration-300 w-full
                          ${formData.category_id === cat.cat_id.toString()
                            ? 'bg-[#1C2575] border-[#1C2575] text-white shadow-lg'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-[#1C2575] hover:bg-blue-50'
                          }
                        `}
                      >
                        <div className="font-bold text-sm mb-1">{cat.cat_title}</div>
                        <div className={`text-xs ${formData.category_id === cat.cat_id.toString() ? 'text-blue-100' : 'text-slate-500'}`}>
                          {getCategoryPath(cat)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="number"
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  placeholder="شناسه دسته‌بندی"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-right focus:border-[#1C2575] focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                />
              )}
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border-2 border-slate-200">
              <h2 className="text-base font-bold text-[#1C2575] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                اطلاعات تکمیلی محصول
              </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  وزن (گرم) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.weight ? parseInt(formData.weight).toLocaleString('en-US') : ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    setFormData({ ...formData, weight: value });
                  }}
                  placeholder="1,000"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-right focus:border-[#1C2575] focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  وزن با بسته‌بندی (گرم) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.package_weight ? parseInt(formData.package_weight).toLocaleString('en-US') : ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    setFormData({ ...formData, package_weight: value });
                  }}
                  placeholder="1,000"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-right focus:border-[#1C2575] focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  مدت آماده‌سازی (روز) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.preparation_days}
                  onChange={(e) => setFormData({ ...formData, preparation_days: e.target.value })}
                  placeholder="تعداد روز"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-right focus:border-[#1C2575] focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  قیمت (تومان) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.primary_price ? parseInt(formData.primary_price).toLocaleString('en-US') : ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    setFormData({ ...formData, primary_price: value });
                  }}
                  placeholder="10,000"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-right focus:border-[#1C2575] focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                />
                <p className="text-xs text-slate-500 mt-1">حداقل قیمت: 10,000 تومان</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  موجودی <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="تعداد موجودی"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-right focus:border-[#1C2575] focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>
            </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-8 py-5 bg-gradient-to-r from-[#1C2575] to-[#2a3699] text-white text-base font-bold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>در حال ایجاد محصول...</span>
                  </>
                ) : (
                  <span>ایجاد محصول</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProductFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-[#1C2575] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">در حال بارگذاری...</p>
        </div>
      </div>
    }>
      <ProductFormContent />
    </Suspense>
  );
}
