'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAccessToken } from '@/utils/auth';
import { trackEvent } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

interface ProductData {
  id: number;
  name: string;
  description: string;
  photo: { id: number; url: string } | null;
  photos: { id: number; url: string }[];
  attributes: { key: string; value: string }[];
  category_id: number;
  preparation_days: number;
  weight: number;
  package_weight: number;
  primary_price: number;
  stock: number;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>([]);
  const [photos, setPhotos] = useState<{ id: number; url: string }[]>([]);
  const [mainPhotoId, setMainPhotoId] = useState<number | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          alert('لطفا ابتدا وارد شوید');
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/get-product/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('خطا در دریافت اطلاعات محصول');
        }

        const data = await response.json();
        console.log('Product data received:', JSON.stringify(data, null, 2));

        setProduct(data);

        const productName = data.title || data.name || '';
        const productDesc = data.description || '';
        console.log('Setting name:', productName);
        console.log('Setting description:', productDesc);

        setName(productName);
        setDescription(productDesc);
        setAttributes(data.attributes || []);

        const allPhotos: { id: number; url: string }[] = [];

        console.log('Photo data:', data.photo);
        console.log('Photos array:', data.photos);

        // Helper function to extract URL from photo object
        const extractPhotoUrl = (photo: any): string | null => {
          if (!photo) return null;
          // Direct URL fields
          if (photo.url) return photo.url;
          if (photo.original) return photo.original;
          if (photo.md) return photo.md;
          if (photo.sm) return photo.sm;
          // Nested sizes object
          if (photo.sizes) {
            if (photo.sizes.original) return photo.sizes.original;
            if (photo.sizes.md) return photo.sizes.md;
            if (photo.sizes.sm) return photo.sizes.sm;
          }
          // Fallback using ID
          if (photo.id) {
            return `https://statics.basalam.com/public/file/${photo.id}/original`;
          }
          return null;
        };

        if (data.photo && typeof data.photo === 'object' && data.photo.id) {
          const photoUrl = extractPhotoUrl(data.photo);
          if (photoUrl) {
            setMainPhotoId(data.photo.id);
            allPhotos.push({ id: data.photo.id, url: photoUrl });
          }
        }

        if (data.photos && Array.isArray(data.photos)) {
          data.photos.forEach((p: any) => {
            if (p && p.id) {
              const photoUrl = extractPhotoUrl(p);
              if (photoUrl && !allPhotos.find(ap => ap.id === p.id)) {
                allPhotos.push({ id: p.id, url: photoUrl });
              }
            }
          });
        }

        console.log('Total photos found:', allPhotos.length);
        console.log('Photos:', allPhotos);
        setPhotos(allPhotos);

        trackEvent('product_edit_loaded', {
          product_id: params.id,
          product_name: productName,
          photos_count: allPhotos.length,
        });
      } catch (error) {
        console.error('Error fetching product:', error);
        alert('خطا در دریافت اطلاعات محصول');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  const handleAddAttribute = () => {
    setAttributes([...attributes, { key: '', value: '' }]);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = getAccessToken();
    if (!token) {
      alert('لطفا ابتدا وارد شوید');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('خطا در آپلود تصویر');
      }

      const data = await response.json();
      console.log('Uploaded image response:', data);
      console.log('Image ID:', data.id);
      console.log('Image URL:', data.url);

      if (data.id && data.url) {
        const newPhoto = { id: data.id, url: data.url };
        console.log('Adding new photo to state:', newPhoto);
        const newPhotos = [...photos, newPhoto];
        console.log('Updated photos array:', newPhotos);
        setPhotos(newPhotos);
        if (!mainPhotoId) {
          setMainPhotoId(data.id);
        }

        trackEvent('product_image_uploaded', {
          product_id: params.id,
          image_id: data.id,
          total_photos: newPhotos.length,
        });

        alert('تصویر با موفقیت آپلود شد');
      } else {
        console.error('Invalid upload response - missing id or url:', data);
        throw new Error('پاسخ نامعتبر از سرور');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('خطا در آپلود تصویر');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (photoId: number) => {
    setPhotos(photos.filter(p => p.id !== photoId));
    if (mainPhotoId === photoId) {
      const remaining = photos.filter(p => p.id !== photoId);
      setMainPhotoId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleSetMainPhoto = (photoId: number) => {
    setMainPhotoId(photoId);
  };

  const handleSave = async () => {
    const token = getAccessToken();
    if (!token) {
      alert('لطفا ابتدا وارد شوید');
      router.push('/login');
      return;
    }

    setSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        name,
        description,
        attributes: attributes.filter(a => a.key && a.value),
      };

      console.log('Current photos state:', photos);
      console.log('Current mainPhotoId:', mainPhotoId);

      if (mainPhotoId) {
        updateData.photo = mainPhotoId;
      }

      const photoIds = photos.map(p => p.id).filter(id => id !== mainPhotoId);
      console.log('Photo IDs (excluding main):', photoIds);

      if (photoIds.length > 0) {
        updateData.photos = photoIds;
      }

      console.log('Saving product with data:', updateData);

      const response = await fetch(`/api/update-product/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update error:', errorData);
        throw new Error(errorData.error || 'خطا در بروزرسانی محصول');
      }

      const responseData = await response.json();
      console.log('Update response from API:', responseData);

      trackEvent('product_updated', {
        product_id: params.id,
        product_name: name,
        has_description: !!description,
        photos_count: photos.length,
        attributes_count: attributes.filter(a => a.key && a.value).length,
      });

      alert('محصول با موفقیت بروزرسانی شد');
      router.push(`/product-success?id=${params.id}`);
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error instanceof Error ? error.message : 'خطا در بروزرسانی محصول');
    } finally {
      setSaving(false);
    }
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
          <p className="text-lg text-slate-600">محصول یافت نشد</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-6 py-3 bg-[#1C2575] text-white rounded-xl"
          >
            بازگشت به داشبورد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-[#E5E5EA] rounded-xl hover:border-[#1C2575] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">بازگشت</span>
          </button>
          <h1 className="text-xl font-bold text-[#3D3D4E]">ویرایش محصول</h1>
        </div>

        <div className="space-y-6">
          {/* Product Name */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <label className="block text-sm font-semibold text-[#3D3D4E] mb-3">
              نام محصول <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl text-sm text-right focus:border-[#1C2575] focus:outline-none transition-all"
              placeholder="نام محصول"
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <label className="block text-sm font-semibold text-[#3D3D4E] mb-3">
              توضیحات محصول
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl text-sm text-right focus:border-[#1C2575] focus:outline-none transition-all resize-none"
              placeholder="توضیحات محصول را وارد کنید..."
            />
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <label className="block text-sm font-semibold text-[#3D3D4E] mb-3">
              تصاویر محصول
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                    mainPhotoId === photo.id ? 'border-[#1C2575]' : 'border-[#E5E5EA]'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt="Product"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image load error for:', photo.url);
                      console.error('Error details:', e);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', photo.url);
                    }}
                  />
                  {mainPhotoId === photo.id && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-[#1C2575] text-white text-xs rounded-lg">
                      اصلی
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                    {mainPhotoId !== photo.id && (
                      <button
                        type="button"
                        onClick={() => handleSetMainPhoto(photo.id)}
                        className="flex-1 px-2 py-1 bg-white/90 text-[#1C2575] text-xs rounded-lg hover:bg-white transition-all"
                      >
                        اصلی
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="px-2 py-1 bg-red-500/90 text-white text-xs rounded-lg hover:bg-red-600 transition-all"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Photo Button */}
              <label className="aspect-square rounded-xl border-2 border-dashed border-[#E5E5EA] flex flex-col items-center justify-center cursor-pointer hover:border-[#1C2575] transition-all bg-[#F5F5F7]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? (
                  <div className="w-8 h-8 border-2 border-[#E5E5EA] border-t-[#1C2575] rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-[#8E8E93] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-[#8E8E93]">افزودن تصویر</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Attributes */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-[#3D3D4E]">
                ویژگی‌های محصول
              </label>
              <button
                type="button"
                onClick={handleAddAttribute}
                className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] text-[#1C2575] text-sm font-medium rounded-xl hover:bg-[#E5E5EA] transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                افزودن ویژگی
              </button>
            </div>

            {attributes.length === 0 ? (
              <p className="text-sm text-[#8E8E93] text-center py-8">
                هیچ ویژگی‌ای اضافه نشده است
              </p>
            ) : (
              <div className="space-y-3">
                {attributes.map((attr, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={attr.key}
                      onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                      className="flex-1 px-4 py-3 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl text-sm text-right focus:border-[#1C2575] focus:outline-none"
                      placeholder="نام ویژگی"
                    />
                    <input
                      type="text"
                      value={attr.value}
                      onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                      className="flex-1 px-4 py-3 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl text-sm text-right focus:border-[#1C2575] focus:outline-none"
                      placeholder="مقدار"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(index)}
                      className="p-3 bg-red-100 text-red-500 rounded-xl hover:bg-red-200 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-8 py-4 bg-white border border-[#E5E5EA] text-[#3D3D4E] font-semibold rounded-xl hover:bg-[#F5F5F7] transition-all"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex-1 px-8 py-4 bg-[#1C2575] text-white font-semibold rounded-xl hover:bg-[#151d5f] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <span>ذخیره تغییرات</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
