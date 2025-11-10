'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('basalam_token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleLogin = () => {
    const CLIENT_ID = '1594';
    const REDIRECT_URI = encodeURIComponent(window.location.origin + '/auth/callback');
    const SCOPES = 'vendor.profile.read+vendor.product.write';
    const STATE = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    sessionStorage.setItem('oauth_state', STATE);

    const authUrl = `https://basalam.com/accounts/sso?client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}&state=${STATE}&response_type=code`;

    console.log('OAuth Login Details:', {
      client_id: CLIENT_ID,
      redirect_uri: window.location.origin + '/auth/callback',
      redirect_uri_encoded: REDIRECT_URI,
      scopes: SCOPES,
      state: STATE,
      full_url: authUrl
    });

    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden p-12 max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#1C2575] via-[#2a3699] to-[#3b47bd] rounded-3xl shadow-xl shadow-blue-900/20">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">ورود به باسلام</h1>
            <p className="text-sm text-slate-600">برای استفاده از ابزار افزودن محصول، وارد شوید</p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full px-8 py-4 bg-gradient-to-r from-[#1C2575] to-[#2a3699] text-white text-base font-bold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            ورود با حساب باسلام
          </button>
        </div>
      </div>
    </div>
  );
}
