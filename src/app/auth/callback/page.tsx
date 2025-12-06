'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('🚀 OAuth Callback Page Loaded');

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('📋 Callback URL params:', {
      code: code ? `${code.substring(0, 30)}...` : '❌ NOT RECEIVED',
      state: state || '❌ NOT RECEIVED',
      error: errorParam || 'none',
      error_description: errorDescription || 'none',
      all_params: Object.fromEntries(searchParams.entries())
    });

    if (errorParam) {
      console.error('❌ OAuth error from Basalam:', errorParam, errorDescription);
      setError(`خطا در احراز هویت: ${errorParam} - ${errorDescription || ''}`);
      return;
    }

    if (!code) {
      console.error('❌ No authorization code received');
      setError('کد احراز هویت دریافت نشد');
      return;
    }
    console.log('✅ Authorization code received');

    const savedState = sessionStorage.getItem('oauth_state');
    console.log('🔐 Verifying state:', {
      received: state,
      expected: savedState,
      match: state === savedState ? '✅ MATCH' : '❌ MISMATCH'
    });

    if (state !== savedState) {
      console.error('❌ State mismatch - possible CSRF attack!');
      setError('خطای امنیتی: state نامعتبر است');
      return;
    }
    console.log('✅ State verified successfully');

    sessionStorage.removeItem('oauth_state');

    const exchangeCodeForToken = async () => {
      try {
        console.log('🔄 STEP 1: Starting token exchange');
        console.log('📤 Sending authorization code:', code);

        const response = await fetch('/api/auth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        console.log('📥 STEP 2: Received response from token API');
        console.log('Status:', response.status, response.ok ? '✅ OK' : '❌ FAILED');

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ STEP 3: Token exchange FAILED:', errorData);
          setError(`خطا در دریافت توکن: ${errorData.error || response.status}`);
          return;
        }

        const data = await response.json();
        console.log('✅ STEP 3: Token data received successfully');
        console.log('Token data:', {
          has_access_token: !!data.access_token,
          has_refresh_token: !!data.refresh_token,
          token_type: data.token_type,
          expires_in: data.expires_in,
          access_token_preview: data.access_token ? data.access_token.substring(0, 20) + '...' : null
        });

        if (data.access_token) {
          console.log('💾 STEP 4: Saving tokens to localStorage');
          localStorage.setItem('basalam_token', data.access_token);
          console.log('✅ Access token saved');

          if (data.refresh_token) {
            localStorage.setItem('basalam_refresh_token', data.refresh_token);
            console.log('✅ Refresh token saved');
          }

          console.log('🔄 STEP 5: Fetching vendor profile');
          try {
            const profileResponse = await fetch('/api/vendor-profile', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${data.access_token}`,
              },
            });

            console.log('Profile API response status:', profileResponse.status);

            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              console.log('✅ Vendor profile received:', profileData);

              if (profileData.vendor && profileData.vendor.id) {
                localStorage.setItem('basalam_vendor_id', profileData.vendor.id.toString());
                console.log('✅ Vendor ID saved:', profileData.vendor.id);
              } else {
                console.error('⚠️ Vendor ID not found in profile response');
              }
            } else {
              const errorText = await profileResponse.text();
              console.error('⚠️ Failed to fetch vendor profile:', profileResponse.status, errorText);
            }
          } catch (profileError) {
            console.error('⚠️ Error fetching vendor profile:', profileError);
          }

          console.log('🔄 STEP 6: Redirecting to main page');
          router.push('/dashboard');
        } else {
          console.error('❌ STEP 4: No access_token in response:', data);
          setError('توکن دریافت نشد');
        }
      } catch (err) {
        console.error('❌ CRITICAL ERROR in token exchange:', err);
        console.error('Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : null
        });
        setError('خطا در احراز هویت');
      }
    };

    exchangeCodeForToken();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden p-12 max-w-md w-full mx-4 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-4">{error}</h1>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-gradient-to-r from-[#1C2575] to-[#2a3699] text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-[#1C2575] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg text-slate-600">در حال احراز هویت...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-[#1C2575] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">در حال بارگذاری...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
