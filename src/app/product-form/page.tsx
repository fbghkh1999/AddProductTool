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
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
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
        router.push('/dashboard');
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
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#1C2575] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="flex flex-col items-start gap-6 max-w-3xl mx-auto py-12 px-4">
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

            {/* Step 2 - انتخاب محصول */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1C2575] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-[#1C2575]">انتخاب محصول</span>
            </div>

            {/* Line */}
            <div className="flex-1 h-0.5 bg-[#1C2575] mx-2"></div>

            {/* Step 3 - تکمیل اطلاعات (Current) */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1C2575] flex items-center justify-center">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <span className="text-sm font-semibold text-[#1C2575]">تکمیل اطلاعات</span>
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

        <div className="w-full bg-white rounded-3xl shadow-sm p-8 sm:p-10">
          <h1 className="text-xl sm:text-2xl font-bold text-[#3D3D4E] mb-8 text-right">تکمیل اطلاعات محصول</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* نام محصول Section */}
            <div className="flex flex-col gap-5 p-6 bg-[#F5F5F7] rounded-2xl border border-[#E5E5EA]">
              <div>
                <label className="block text-sm font-semibold text-[#3D3D4E] mb-3 text-right">
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
                  className={`w-full px-4 py-3 bg-white border ${
                    nameError ? 'border-red-500' : 'border-[#E5E5EA]'
                  } rounded-xl text-sm text-right focus:border-[#1C2575] focus:outline-none transition-all`}
                />
                {nameError && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1 justify-end">
                    <span>{nameError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* دسته‌بندی Section */}
            <div className="flex flex-col gap-5 p-6 bg-[#F5F5F7] rounded-2xl border border-[#E5E5EA]">
              <div>
                <label className="block text-sm font-semibold text-[#3D3D4E] mb-3 text-right">
                  دسته‌بندی <span className="text-red-500">*</span>
                </label>
              {loadingCategories ? (
                <div className="flex items-center gap-3 p-4 bg-[#F5F5F7] rounded-xl justify-end">
                  <span className="text-sm text-[#3D3D4E]">در حال تشخیص دسته‌بندی...</span>
                  <div className="w-5 h-5 border-2 border-[#E5E5EA] border-t-[#1C2575] rounded-full animate-spin"></div>
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
                          p-4 rounded-xl border text-right transition-all w-full
                          ${formData.category_id === cat.cat_id.toString()
                            ? 'bg-[#1C2575] border-[#1C2575] text-white'
                            : 'bg-white border-[#E5E5EA] text-[#3D3D4E] hover:border-[#1C2575]'
                          }
                        `}
                      >
                        <div className="font-semibold text-sm mb-1">{cat.cat_title}</div>
                        <div className={`text-xs ${formData.category_id === cat.cat_id.toString() ? 'text-white/70' : 'text-[#8E8E93]'}`}>
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
                  className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-sm text-right focus:border-[#1C2575] focus:outline-none transition-all"
                />
              )}
              </div>
            </div>

            {/* سایر اطلاعات Section */}
            <div className="flex flex-col gap-5 p-6 bg-[#F5F5F7] rounded-2xl border border-[#E5E5EA]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#3D3D4E] mb-3 text-right">
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
                  className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-sm text-right focus:border-[#1C2575] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3D3D4E] mb-3 text-right">
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
                  className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-sm text-right focus:border-[#1C2575] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3D3D4E] mb-3 text-right">
                  مدت آماده‌سازی (روز) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.preparation_days}
                  onChange={(e) => setFormData({ ...formData, preparation_days: e.target.value })}
                  placeholder="1"
                  className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-sm text-right focus:border-[#1C2575] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3D3D4E] mb-3 text-right">
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
                  className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-sm text-right focus:border-[#1C2575] focus:outline-none transition-all"
                />
                <p className="text-xs text-[#8E8E93] mt-2 text-right">حداقل قیمت: 10,000 تومان</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3D3D4E] mb-3 text-right">
                  موجودی <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="1"
                  className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-sm text-right focus:border-[#1C2575] focus:outline-none transition-all"
                />
              </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-8 py-4 bg-white text-[#3D3D4E] border border-[#E5E5EA] rounded-xl hover:bg-[#F5F5F7] transition-all text-sm font-semibold"
              >
                بازگشت
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-8 py-4 bg-[#1C2575] text-white text-base font-semibold rounded-xl hover:bg-[#151d5f] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  <span>ادامه</span>
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
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#1C2575] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-600">در حال بارگذاری...</p>
        </div>
      </div>
    }>
      <ProductFormContent />
    </Suspense>
  );
}
