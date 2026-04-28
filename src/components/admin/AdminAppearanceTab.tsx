import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Save, CheckCircle2, Palette, Trophy, Flame, UserIcon, ZoomOut, ZoomIn, Loader2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { apiFetch } from '../../lib/api';
import ImageFallback from '../ImageFallback';

type HSLColor = { h: number; s: number; l: number };

type ThemeVariant = {
  background: HSLColor;
  foreground: HSLColor;
  card: HSLColor;
  'card-foreground': HSLColor;
  popover: HSLColor;
  'popover-foreground': HSLColor;
  primary: HSLColor;
  'primary-foreground': HSLColor;
  secondary: HSLColor;
  'secondary-foreground': HSLColor;
  muted: HSLColor;
  'muted-foreground': HSLColor;
  accent: HSLColor;
  'accent-foreground': HSLColor;
  destructive: HSLColor;
  'destructive-foreground': HSLColor;
  border: HSLColor;
  input: HSLColor;
  ring: HSLColor;
};

export const PRESETS: Record<string, { name: string; light: ThemeVariant, dark: ThemeVariant }> = {
  fresh_majestic: {
    name: 'Fresh & Majestic (Default)',
    light: {
      background: { h: 144, s: 33, l: 97 },
      foreground: { h: 166, s: 100, l: 20 },
      card: { h: 0, s: 0, l: 100 },
      'card-foreground': { h: 166, s: 100, l: 20 },
      popover: { h: 0, s: 0, l: 100 },
      'popover-foreground': { h: 166, s: 100, l: 20 },
      primary: { h: 166, s: 100, l: 20 },
      'primary-foreground': { h: 0, s: 0, l: 100 },
      secondary: { h: 148, s: 49, l: 52 },
      'secondary-foreground': { h: 0, s: 0, l: 100 },
      muted: { h: 144, s: 33, l: 90 },
      'muted-foreground': { h: 160, s: 20, l: 45 },
      accent: { h: 46, s: 65, l: 52 },
      'accent-foreground': { h: 0, s: 0, l: 100 },
      destructive: { h: 0, s: 84, l: 60 },
      'destructive-foreground': { h: 0, s: 0, l: 100 },
      border: { h: 144, s: 33, l: 85 },
      input: { h: 144, s: 33, l: 85 },
      ring: { h: 46, s: 65, l: 52 }
    },
    dark: {
      background: { h: 164, s: 40, l: 7 },
      foreground: { h: 177, s: 47, l: 91 },
      card: { h: 162, s: 36, l: 12 },
      'card-foreground': { h: 177, s: 47, l: 91 },
      popover: { h: 162, s: 36, l: 12 },
      'popover-foreground': { h: 177, s: 47, l: 91 },
      primary: { h: 145, s: 63, l: 49 },
      'primary-foreground': { h: 164, s: 40, l: 7 },
      secondary: { h: 166, s: 100, l: 20 },
      'secondary-foreground': { h: 177, s: 47, l: 91 },
      muted: { h: 162, s: 36, l: 18 },
      'muted-foreground': { h: 177, s: 20, l: 60 },
      accent: { h: 45, s: 100, l: 50 },
      'accent-foreground': { h: 164, s: 40, l: 7 },
      destructive: { h: 0, s: 84, l: 60 },
      'destructive-foreground': { h: 177, s: 47, l: 91 },
      border: { h: 166, s: 100, l: 20 },
      input: { h: 166, s: 100, l: 20 },
      ring: { h: 45, s: 100, l: 50 }
    }
  }
};

export const applyThemeColors = (settings: any) => {
  if (!settings) return;

  const presetId = settings.activePresetId || 'fresh_majestic';
  const preset = PRESETS[presetId] || PRESETS['fresh_majestic'];

  let styleEl = document.getElementById('dynamic-theme');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamic-theme';
    document.head.appendChild(styleEl);
  }

  let css = ":root {\n";
  Object.entries(preset.light).forEach(([key, val]) => {
    css += `  --${key}: ${val.h} ${val.s}% ${val.l}%;\n`;
  });
  css += "}\n";

  css += ".dark {\n";
  Object.entries(preset.dark).forEach(([key, val]) => {
    css += `  --${key}: ${val.h} ${val.s}% ${val.l}%;\n`;
  });
  css += "}\n";

  styleEl.innerHTML = css;
};

export function AdminAppearanceTab({ refreshData, appSettings, setAppSettings }: any) {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (appSettings) {
      setSettings({
        ...appSettings,
        activePresetId: appSettings.activePresetId || 'fresh_majestic'
      });
    }
  }, [JSON.stringify(appSettings)]);
  
  const [saving, setSaving] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState('');

  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const [cropImage, setCropImage] = React.useState<string | null>(null);
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<any>(null);

  React.useEffect(() => {
    if (settings) {
       applyThemeColors(settings);
    }
  }, [settings?.activePresetId]);

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

  const applyPreset = (presetKey: string) => {
    setSettings((prev: any) => ({
      ...prev,
      activePresetId: presetKey
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
        setSuccessMsg('Appearance settings and themes applied successfully!');
        if (refreshData) {
          refreshData();
        }
        if (setAppSettings) {
          setAppSettings();
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
     return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary"/></div>;
  }

  return (
    <div className="p-4 md:p-8 relative">
      <h3 className="text-xl md:text-2xl font-black text-foreground underline decoration-primary decoration-4 underline-offset-8 mb-8">
        Appearance & Styling Engine
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
          <div className="p-6 bg-card rounded-2xl border border-border shadow-soft">
            <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" /> Global Presets
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button 
                  key={key}
                  onClick={() => applyPreset(key)} 
                  className={`px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-soft border ${settings.activePresetId === key ? 'bg-primary text-primary-foreground border-primary scale-105' : 'bg-background text-foreground border-border hover:border-primary/50'}`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-card rounded-2xl border border-border shadow-soft">
            <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" /> Dynamic Branding
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-1">Application Name</label>
                <input type="text" name="appName" value={settings.appName} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring focus:ring-primary/50" placeholder="e.g. Mamba'ul Huda Student Portal" />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1">Badge Title</label>
                <input type="text" name="badgeTitle" value={settings.badgeTitle} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring focus:ring-primary/50" placeholder="e.g. Season 2 Active" />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1">Hero Headline</label>
                <input type="text" name="heroTitle" value={settings.heroTitle} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring focus:ring-primary/50" placeholder="e.g. Global Leaderboard" />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1">Hero Subtitle</label>
                <textarea rows={3} name="heroSubtitle" value={settings.heroSubtitle} onChange={(e:any) => handleChange(e)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Logo</label>
                <div className="flex gap-4 items-center">
                  <div className="relative inline-block group">
                    {settings.logoUrl ? (
                      <ImageFallback src={settings.logoUrl} alt="Logo" variant="logo" className="w-20 h-20 rounded-2xl border-4 border-border bg-secondary shadow-soft object-cover" wrapperClassName="w-20 h-20" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl border-4 border-border bg-secondary shadow-soft flex items-center justify-center text-primary">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                    <button type="button" onClick={() => logoInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm" title="Upload Logo">
                      <ImageIcon className="w-6 h-6" />
                    </button>
                    <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                  </div>
                  <div className="flex-1">
                    <input type="text" name="logoUrl" value={settings.logoUrl || ''} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm mb-2" placeholder="https://example.com/logo.png" />
                    <p className="text-[10px] text-muted-foreground font-bold">Square image recommended. Max size 512x512, compressed via WebP.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full bg-primary text-primary-foreground px-8 py-5 rounded-2xl font-black shadow-primary-glow flex justify-center items-center gap-2 hover:opacity-90 active:scale-95 transition-all text-lg"
          >
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            {saving ? 'Synchronizing to Firebase...' : 'Save & Publish Theme Engine'}
          </button>
        </div>

        {/* LIVE PREVIEW PANE */}
        <div className="space-y-6">
          <div className="sticky top-8">
             <h4 className="font-black text-foreground mb-4 uppercase tracking-widest text-sm">Live Sandbox Preview</h4>
             
             <div className="bg-background border border-border rounded-xl p-6 mb-4 shadow-soft">
                {/* Preview: Navbar mini */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    {settings.logoUrl ? (
                      <ImageFallback src={settings.logoUrl} alt="" variant="logo" className="w-10 h-10 rounded-xl object-contain" wrapperClassName="w-10 h-10" />
                    ) : (
                      <div className="bg-primary p-2.5 rounded-xl shadow-soft"><Trophy className="w-5 h-5 text-primary-foreground" /></div>
                    )}
                    <span className="font-black text-foreground text-lg">{settings.appName || 'Your App'}</span>
                  </div>
                  <div className="w-10 h-10 bg-secondary border-2 border-background shadow-soft rounded-full" />
                </div>

                {/* Preview: Hero */}
                <div className="bg-card border border-border p-8 rounded-xl shadow-soft relative overflow-hidden mb-6 flex flex-col justify-center min-h-[220px]">
                  <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 rotate-12">
                    {settings.logoUrl ? <ImageFallback src={settings.logoUrl} alt="" variant="logo" className="w-48 h-48 drop-shadow-md" wrapperClassName="w-48 h-48" /> : <Trophy className="w-48 h-48 text-foreground" />}
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary text-secondary-foreground rounded-full text-xs font-bold uppercase tracking-widest">
                      <Flame className="w-4 h-4 text-destructive" /> {settings.badgeTitle || 'Badge'}
                    </div>
                    <h1 className="text-3xl font-black tracking-tight leading-tight text-card-foreground">{settings.heroTitle || 'Headline'}</h1>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-sm">
                      {settings.heroSubtitle || 'Subtitle about your application.'}
                    </p>
                    <button className="bg-accent text-accent-foreground px-6 py-3 rounded-xl font-bold shadow-soft active:scale-95 transition-transform mt-2">
                       Explore Now
                    </button>
                  </div>
                </div>

                {/* Preview: Card */}
                <div className="bg-card rounded-xl p-5 border border-border shadow-soft transition-all hover:border-primary/50 hover:shadow-primary-glow cursor-pointer group">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center font-bold text-muted-foreground group-hover:text-primary transition-colors">
                      1
                    </div>
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex justify-center items-center overflow-hidden border border-primary/20">
                       <UserIcon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-bold text-card-foreground text-lg mb-0.5">Student Example</h5>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Web Dev Track</p>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-2xl font-black text-foreground">1,250</div>
                      <div className="text-[10px] text-primary font-bold uppercase tracking-widest">PTS</div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Cropper Overlay */}
      {cropImage && (
        <div className="fixed inset-0 bg-background/90 z-[100] flex flex-col mt-0 border-t-0 p-0 shadow-none backdrop-blur-md">
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
          <div className="p-4 bg-card border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between shadow-t-2xl">
            <div className="flex items-center gap-4 w-full sm:w-1/2">
              <ZoomOut className="text-muted-foreground w-5 h-5 flex-shrink-0" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <ZoomIn className="text-muted-foreground w-5 h-5 flex-shrink-0" />
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setCropImage(null);
                  if (logoInputRef.current) logoInputRef.current.value = '';
                }} 
                className="px-6 py-2 rounded-xl font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmCrop} 
                className="bg-primary px-6 py-2 rounded-xl text-primary-foreground font-black hover:opacity-90 shadow-soft transition-opacity"
              >
                Apply Custom Crop
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
