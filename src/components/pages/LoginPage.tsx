import React, { useState } from 'react';
import { Settings, Loader2 } from 'lucide-react';
import { apiFetch, setLocalToken } from '../../lib/api';
import { ImageFallback } from '../ImageFallback';

export // --- LOGIN PAGE ---
function LoginPage({ onLogin, appSettings }: { onLogin: () => void, appSettings?: any }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await apiFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) setLocalToken(data.token);
        onLogin();
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setError(`An error occurred: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-12">
      <div className="bg-base-100 rounded-3xl p-8 shadow-xl border border-base-200">
        <div className="text-center mb-8">
          {appSettings?.logoUrl ? (
            <ImageFallback src={appSettings.logoUrl} alt="Logo" variant="logo" className="w-20 h-20 object-contain mx-auto mb-4" wrapperClassName="w-20 h-20 mx-auto mb-4 block" />
          ) : (
            <div className="w-16 h-16 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
              <Settings className="w-8 h-8 text-base-50" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-text-main">{appSettings?.appName || 'Admin Login'}</h1>
          <p className="text-text-muted mt-1">Access restricted to authorized educators only.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-text-muted mb-2">Access Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-base-200 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
              placeholder="••••••••"
              required
            />
            {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-600 py-3 rounded-2xl text-base-50 font-bold text-lg shadow-lg shadow-primary-100 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authorize Access"}
          </button>
        </form>
      </div>
    </div>
  );
}
