import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Image as ImageIcon, Save, Upload, Info, Hexagon, CheckCircle2, Palette, Trophy, Flame, UserIcon, ZoomOut, ZoomIn, Loader2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { apiFetch } from '../../lib/api';
import ImageFallback from '../ImageFallback';

const PRESETS = {
  elegant_gold: {
    primaryColor: { h: 43, s: 74, l: 49 },
    accentColor: { h: 45, s: 93, l: 47 },
    bgColor: { h: 36, s: 100, l: 97 },
    textColor: { h: 30, s: 8, l: 14 }
  },
  bonsai_green: {
    primaryColor: { h: 144, s: 29, l: 20 },
    accentColor: { h: 34, s: 62, l: 57 },
    bgColor: { h: 79, s: 29, l: 92 },
    textColor: { h: 144, s: 18, l: 15 }
  },
  classic_madrasah: {
    primaryColor: { h: 158, s: 64, l: 39 },
    accentColor: { h: 45, s: 93, l: 47 },
    bgColor: { h: 40, s: 33, l: 96 },
    textColor: { h: 0, s: 0, l: 15 }
  },
  deep_forest: {
    primaryColor: { h: 160, s: 40, l: 15 },
    accentColor: { h: 160, s: 60, l: 40 },
    bgColor: { h: 0, s: 0, l: 95 },
    textColor: { h: 160, s: 20, l: 10 }
  }
};

export const applyThemeColors = (settings: any) => {
  if (!settings) return;
  const applyHSL = (name: string, val: any) => {
    if (!val || typeof val !== 'object' || val.h === undefined) return;
    document.documentElement.style.setProperty(name, `hsl(${val.h}, ${val.s}%, ${val.l}%)`);
    
    if (name === '--theme-primary-600') {
      document.documentElement.style.setProperty('--theme-primary-50', `hsl(${val.h}, ${val.s}%, ${Math.min(100, val.l + 45)}%)`);
      document.documentElement.style.setProperty('--theme-primary-100', `hsl(${val.h}, ${val.s}%, ${Math.min(100, val.l + 40)}%)`);
      document.documentElement.style.setProperty('--theme-primary-200', `hsl(${val.h}, ${val.s}%, ${Math.min(100, val.l + 30)}%)`);
      document.documentElement.style.setProperty('--theme-primary-400', `hsl(${val.h}, ${val.s}%, ${Math.min(100, Math.max(0, val.l + 10))}%)`);
      document.documentElement.style.setProperty('--theme-primary-500', `hsl(${val.h}, ${val.s}%, ${Math.min(100, Math.max(0, val.l + 5))}%)`);
      document.documentElement.style.setProperty('--theme-primary-700', `hsl(${val.h}, ${val.s}%, ${Math.max(0, val.l - 10)}%)`);
      document.documentElement.style.setProperty('--theme-primary-800', `hsl(${val.h}, ${val.s}%, ${Math.max(0, val.l - 20)}%)`);
    }

    if (name === '--theme-base-50') {
      const isDark = val.l < 50;
      const sign = isDark ? 1 : -1;
      document.documentElement.style.setProperty('--theme-base-100', `hsl(${val.h}, ${val.s}%, ${Math.max(0, Math.min(100, val.l + sign * 6))}%)`);
      document.documentElement.style.setProperty('--theme-base-200', `hsl(${val.h}, ${val.s}%, ${Math.max(0, Math.min(100, val.l + sign * 14))}%)`);
      document.documentElement.style.setProperty('--theme-base-300', `hsl(${val.h}, ${val.s}%, ${Math.max(0, Math.min(100, val.l + sign * 20))}%)`);
    }
    if (name === '--theme-text-main') {
      const isDark = val.l < 50;
      const sign = isDark ? 1 : -1;
      document.documentElement.style.setProperty('--theme-text-muted', `hsl(${val.h}, ${val.s}%, ${Math.max(0, Math.min(100, val.l + sign * 20))}%)`);
      document.documentElement.style.setProperty('--theme-text-light', `hsl(${val.h}, ${val.s}%, ${Math.max(0, Math.min(100, val.l + sign * 40))}%)`);
    }
    if (name === '--theme-primary-600') {
      document.documentElement.style.setProperty('--theme-primary-50', `hsl(${val.h}, ${val.s}%, 95%)`);
      document.documentElement.style.setProperty('--theme-primary-100', `hsl(${val.h}, ${val.s}%, 90%)`);
      document.documentElement.style.setProperty('--theme-primary-200', `hsl(${val.h}, ${val.s}%, 80%)`);
      document.documentElement.style.setProperty('--theme-primary-500', `hsl(${val.h}, ${val.s}%, ${Math.min(100, val.l + 10)}%)`);
      document.documentElement.style.setProperty('--theme-primary-700', `hsl(${val.h}, ${val.s}%, ${Math.max(0, val.l - 10)}%)`);
    }
  };
  
  if (settings.primaryColor) applyHSL('--theme-primary-600', settings.primaryColor);
  if (settings.accentColor) applyHSL('--theme-accent-500', settings.accentColor);
  if (settings.bgColor) applyHSL('--theme-base-50', settings.bgColor);
  if (settings.textColor) applyHSL('--theme-text-main', settings.textColor);
};

function HSLPicker({ label, value, onChange }: any) {
  if (!value || typeof value !== 'object' || value.h === undefined) return null;
  return (
    <div className="space-y-2 mb-4 p-4 bg-base-100/50 rounded-xl border border-base-200">
      <div className="flex justify-between items-center mb-4">
        <label className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</label>
        <div className="flex gap-2 items-center">
           <div className="w-6 h-6 rounded-md shadow-inner border border-base-200" style={{ backgroundColor: `hsl(${value.h}, ${value.s}%, ${value.l}%)` }} />
           <span className="text-[10px] font-mono bg-base-200/50 px-2 py-1 rounded text-text-muted">hsl({value.h}, {value.s}%, {value.l}%)</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-text-light w-4">H</span>
          <input type="range" min="0" max="360" value={value.h} onChange={e => onChange({...value, h: parseInt(e.target.value)})} className="flex-1 h-2 rounded-lg appearance-none bg-gradient-to-r from-red-500 via-green-500 to-blue-500 cursor-pointer" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-text-light w-4">S</span>
          <input type="range" min="0" max="100" value={value.s} onChange={e => onChange({...value, s: parseInt(e.target.value)})} className="flex-1 h-2 rounded-lg appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, hsl(${value.h}, 0%, ${value.l}%), hsl(${value.h}, 100%, ${value.l}%))` }} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-text-light w-4">L</span>
          <input type="range" min="0" max="100" value={value.l} onChange={e => onChange({...value, l: parseInt(e.target.value)})} className="flex-1 h-2 rounded-lg appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, hsl(${value.h}, ${value.s}%, 0%), hsl(${value.h}, ${value.s}%, 100%))` }} />
        </div>
      </div>
    </div>
  );
}

export function AdminAppearanceTab({ refreshData, appSettings, setAppSettings }: any) {
  // Alias for compatibility within this component
  const settings = appSettings || {};
  const setSettings = setAppSettings;
  
  const [saving, setSaving] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState('');

  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const [cropImage, setCropImage] = React.useState<string | null>(null);
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<any>(null);

  // Live CSS Injection
  React.useEffect(() => {
    if (settings) applyThemeColors(settings);
  }, [settings?.primaryColor, settings?.accentColor, settings?.bgColor, settings?.textColor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCropImage(event.target?.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      if (logoInputRef.current) logoInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = React.useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const confirmCrop = () => {
    if (!cropImage || !croppedAreaPixels) return;
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 512;
      canvas.width = MAX_SIZE;
      canvas.height = MAX_SIZE;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          image,
          croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height,
          0, 0, MAX_SIZE, MAX_SIZE
        );
        const compressedDataUrl = canvas.toDataURL('image/webp', 0.8);
        setSettings((prev: any) => ({ ...prev, logoUrl: compressedDataUrl }));
        setCropImage(null);
      }
    };
    image.src = cropImage;
  };

  const handleColorChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (presetKey: keyof typeof PRESETS) => {
    setSettings((prev: any) => ({
      ...prev,
      ...PRESETS[presetKey]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings || {})
      });
      if (res.ok) {
        setSuccessMsg('Appearance settings and branding applied successfully!');
        if (refreshData) {
          refreshData();
        }
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        alert('Failed to save settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!settings || Object.keys(settings).length === 0) {
     return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600"/></div>;
  }

  return (
    <div className="p-8 relative">
      <h3 className="text-2xl font-black text-text-main underline decoration-primary-500 decoration-4 underline-offset-8 mb-8">
        Appearance & Branding Manager
      </h3>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl flex items-center gap-3 font-bold">
          <CheckCircle2 className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* TEMPLATES */}
          <div className="p-6 bg-base-50 rounded-2xl border border-base-200 shadow-sm">
            <h4 className="font-bold text-text-main mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary-500" /> Preset Templates
            </h4>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => applyPreset('classic_madrasah')} 
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-sm font-bold active:scale-95 transition-transform shadow-lg hover:bg-emerald-600"
              >
                Classic Madrasah
              </button>
              <button 
                onClick={() => applyPreset('elegant_gold')} 
                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold active:scale-95 transition-transform shadow-lg hover:bg-amber-500"
              >
                Elegant Gold
              </button>
              <button 
                onClick={() => applyPreset('deep_forest')} 
                className="px-4 py-2 bg-slate-800 text-emerald-100 rounded-xl text-sm font-bold active:scale-95 transition-transform shadow-lg hover:bg-slate-700"
              >
                Deep Forest
              </button>
            </div>
            <p className="text-xs text-text-muted mt-3">Clicking a preset instantly updates the live preview. Don't forget to push "Save & Publish" to lock it in.</p>
          </div>

          <div className="p-6 bg-base-50 rounded-2xl border border-base-200 shadow-sm">
            <h4 className="font-bold text-text-main mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary-500" /> Advanced Color Editor (HSL)
            </h4>
            <HSLPicker label="Primary Color" value={settings.primaryColor} onChange={(v:any) => handleColorChange('primaryColor', v)} />
            <HSLPicker label="Accent Color" value={settings.accentColor} onChange={(v:any) => handleColorChange('accentColor', v)} />
            <HSLPicker label="Background Base" value={settings.bgColor} onChange={(v:any) => handleColorChange('bgColor', v)} />
            <HSLPicker label="Main Text Color" value={settings.textColor} onChange={(v:any) => handleColorChange('textColor', v)} />
          </div>

          <div className="p-6 bg-base-50 rounded-2xl border border-base-200 shadow-sm">
            <h4 className="font-bold text-text-main mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary-500" /> Dynamic Branding
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text-main mb-1">Application Name</label>
                <input type="text" name="appName" value={settings.appName} onChange={handleChange} className="w-full bg-base-100 border border-base-200 rounded-xl px-4 py-3 text-sm" placeholder="e.g. Mamba'ul Huda Student Portal" />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-main mb-1">Badge Title</label>
                <input type="text" name="badgeTitle" value={settings.badgeTitle} onChange={handleChange} className="w-full bg-base-100 border border-base-200 rounded-xl px-4 py-3 text-sm" placeholder="e.g. Season 2 Active" />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-main mb-1">Hero Headline</label>
                <input type="text" name="heroTitle" value={settings.heroTitle} onChange={handleChange} className="w-full bg-base-100 border border-base-200 rounded-xl px-4 py-3 text-sm" placeholder="e.g. Global Leaderboard" />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-main mb-1">Hero Subtitle</label>
                <textarea rows={3} name="heroSubtitle" value={settings.heroSubtitle} onChange={(e:any) => handleChange(e)} className="w-full bg-base-100 border border-base-200 rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-main mb-2">Logo</label>
                <div className="flex gap-4 items-center">
                  <div className="relative inline-block group">
                    {settings.logoUrl ? (
                      <ImageFallback src={settings.logoUrl} alt="Logo" variant="logo" className="w-20 h-20 rounded-2xl border-4 border-base-100 bg-base-200 shadow-sm object-cover" wrapperClassName="w-20 h-20" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl border-4 border-base-100 bg-base-200 shadow-sm flex items-center justify-center text-primary-500">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                    <button type="button" onClick={() => logoInputRef.current?.click()} className="absolute inset-0 bg-base-900/60 rounded-2xl flex items-center justify-center text-base-50 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm" title="Upload Logo">
                      <ImageIcon className="w-6 h-6" />
                    </button>
                    <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                  </div>
                  <div className="flex-1">
                    <input type="text" name="logoUrl" value={settings.logoUrl} onChange={handleChange} className="w-full bg-base-100 border border-base-200 rounded-xl px-4 py-3 text-sm mb-2" placeholder="https://example.com/logo.png" />
                    <p className="text-[10px] text-text-light font-bold">Square image recommended. Max size 512x512, compressed via WebP.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full bg-primary-600 text-base-50 px-8 py-5 rounded-2xl font-black shadow-lg shadow-primary-200 flex justify-center items-center gap-2 hover:bg-primary-700 active:scale-95 transition-all text-lg"
          >
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            {saving ? 'Synchronizing to Firebase...' : 'Save & Publish Theme Engine'}
          </button>
        </div>

        {/* LIVE PREVIEW PANE */}
        <div className="space-y-6">
          <div className="sticky top-8">
             <h4 className="font-black text-text-main mb-4 uppercase tracking-widest text-sm">Live Sandbox Preview</h4>
             
             {/* Preview: Navbar mini */}
             <div className="bg-base-50 border border-base-200 rounded-2xl p-4 mb-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settings.logoUrl ? (
                    <ImageFallback src={settings.logoUrl} alt="" variant="logo" className="w-8 h-8 rounded-lg object-contain" wrapperClassName="w-8 h-8" />
                  ) : (
                    <div className="bg-primary-600 p-2 rounded-lg"><Trophy className="w-4 h-4 text-base-50" /></div>
                  )}
                  <span className="font-bold text-text-main">{settings.appName}</span>
                </div>
                <div className="w-8 h-8 bg-base-200 rounded-full" />
             </div>

             {/* Preview: Hero */}
             <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 rounded-[2rem] text-base-50 shadow-2xl relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 opacity-20 transform translate-x-1/4 -translate-y-1/4 rotate-12 mix-blend-overlay">
                  {settings.logoUrl ? <ImageFallback src={settings.logoUrl} alt="" variant="logo" className="w-48 h-48" wrapperClassName="w-48 h-48" /> : <Trophy className="w-48 h-48" />}
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-base-100/10 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                    <Flame className="w-3 h-3 text-accent-500" /> {settings.badgeTitle}
                  </div>
                  <h1 className="text-3xl font-black tracking-tight leading-tight">{settings.heroTitle}</h1>
                  <p className="text-sm opacity-80 leading-relaxed max-w-sm">
                    {settings.heroSubtitle}
                  </p>
                </div>
             </div>

             {/* Preview: Card */}
             <div className="bg-base-50 rounded-2xl p-6 border border-base-200 shadow-sm transition-all hover:border-primary-300 hover:shadow-lg">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-base-200 rounded-full flex items-center justify-center font-bold text-text-muted">
                    1
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-200 to-primary-100 rounded-full flex justify-center items-center overflow-hidden">
                     <UserIcon className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h5 className="font-bold text-text-main text-lg">Student Example</h5>
                    <p className="text-xs font-bold text-text-light uppercase tracking-widest">Web Dev Track</p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-xl font-black text-accent-500">1,250</div>
                    <div className="text-[10px] text-text-light font-bold uppercase tracking-widest">PTS</div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Cropper Overlay */}
      {cropImage && (
        <div className="fixed inset-0 bg-base-900 z-[100] flex flex-col mt-0 border-t-0 p-0 shadow-none">
          <div className="flex-1 relative">
            <Cropper
              image={cropImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="p-4 bg-base-900 border-t border-slate-700 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full sm:w-1/2">
              <ZoomOut className="text-slate-400 w-5 h-5 flex-shrink-0" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <ZoomIn className="text-slate-400 w-5 h-5 flex-shrink-0" />
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setCropImage(null);
                  if (logoInputRef.current) logoInputRef.current.value = '';
                }} 
                className="px-6 py-2 rounded-xl font-bold text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmCrop} 
                className="bg-primary-600 px-6 py-2 rounded-xl text-white font-black hover:bg-primary-700 transition-colors"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


