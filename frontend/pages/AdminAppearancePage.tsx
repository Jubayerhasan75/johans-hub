import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Upload, RotateCcw, Save, ImageIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import {
  fetchSiteSettings,
  DEFAULT_HERO_SLIDES,
  DEFAULT_CATEGORY_TILES,
} from '../data/homeContent';

interface ImageSlotProps {
  label: string;
  hint: string;
  defaultImage: string;
  value: string; // current override ('' means use default)
  uploading: boolean;
  onUpload: (file: File) => void;
  onReset: () => void;
}

const ImageSlot: React.FC<ImageSlotProps> = ({ label, hint, defaultImage, value, uploading, onUpload, onReset }) => {
  const preview = value && value.trim() ? value : defaultImage;
  const isCustom = !!(value && value.trim());

  return (
    <div className="bg-white rounded-2xl shadow-soft p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
      <div className="relative w-full sm:w-40 h-40 shrink-0 rounded-xl overflow-hidden bg-gray-100">
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageIcon size={40} />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display font-semibold text-gray-900">{label}</h3>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              isCustom ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {isCustom ? 'Custom' : 'Default'}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4">{hint}</p>

        <div className="flex flex-wrap gap-2">
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-brand-dark text-white text-sm font-medium rounded-lg hover:bg-brand-ink transition-colors cursor-pointer">
            <Upload size={16} />
            Upload image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
                e.target.value = ''; // allow re-uploading the same file
              }}
            />
          </label>
          {isCustom && (
            <button
              onClick={onReset}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Reset to default
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminAppearancePage: React.FC = () => {
  const { userInfo, showToast } = useAppContext();
  const navigate = useNavigate();

  const [heroImages, setHeroImages] = useState<string[]>(['', '', '']);
  const [categoryImages, setCategoryImages] = useState<string[]>(['', '']);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Track which slot is currently uploading: e.g. 'hero-0', 'cat-1'
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteSettings()
      .then((settings) => {
        setHeroImages([0, 1, 2].map((i) => settings.heroImages[i] || ''));
        setCategoryImages([0, 1].map((i) => settings.categoryImages[i] || ''));
      })
      .finally(() => setLoading(false));
  }, []);

  const uploadImage = async (file: File, slot: string, apply: (url: string) => void) => {
    if (!userInfo?.token) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploadingSlot(slot);
    try {
      const data = await apiFetch<{ url: string }>('/api/upload', {
        method: 'POST',
        token: userInfo.token,
        body: formData,
      });
      apply(data.url);
      showToast('Image uploaded — remember to Save changes');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed', 'error');
    } finally {
      setUploadingSlot(null);
    }
  };

  const setHeroAt = (i: number, url: string) =>
    setHeroImages((prev) => prev.map((v, idx) => (idx === i ? url : v)));
  const setCategoryAt = (i: number, url: string) =>
    setCategoryImages((prev) => prev.map((v, idx) => (idx === i ? url : v)));

  const handleSave = async () => {
    if (!userInfo?.token) return;
    setSaving(true);
    try {
      await apiFetch('/api/settings', {
        method: 'PUT',
        token: userInfo.token,
        body: JSON.stringify({ heroImages, categoryImages }),
      });
      showToast('Homepage images saved!');
      navigate('/admin/dashboard');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        <Loader2 size={40} className="animate-spin inline-block text-brand-accent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <Link to="/admin/dashboard" className="inline-flex items-center text-gray-600 hover:text-brand-dark mb-4">
        <ArrowLeft size={18} className="mr-2" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Homepage Appearance</h1>
          <p className="text-gray-500 mt-1">Change the banner images shown on your homepage.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-accent text-white font-semibold rounded-full shadow-lift hover:bg-brand-accent-dark transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save changes
        </button>
      </div>

      {/* Hero slides */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-bold mb-1">Hero Slider</h2>
        <p className="text-sm text-gray-500 mb-4">
          The big rotating banner at the very top. Use wide, high-quality photos (landscape works best).
        </p>
        <div className="space-y-4">
          {DEFAULT_HERO_SLIDES.map((slide, i) => (
            <ImageSlot
              key={i}
              label={`Slide ${i + 1} — “${slide.title}”`}
              hint={slide.kicker}
              defaultImage={slide.image}
              value={heroImages[i]}
              uploading={uploadingSlot === `hero-${i}`}
              onUpload={(file) => uploadImage(file, `hero-${i}`, (url) => setHeroAt(i, url))}
              onReset={() => setHeroAt(i, '')}
            />
          ))}
        </div>
      </section>

      {/* Category tiles */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold mb-1">“Shop by Style” Tiles</h2>
        <p className="text-sm text-gray-500 mb-4">The two category cards in the middle of the homepage.</p>
        <div className="space-y-4">
          {DEFAULT_CATEGORY_TILES.map((tile, i) => (
            <ImageSlot
              key={i}
              label={`${tile.name} tile`}
              hint={tile.tagline}
              defaultImage={tile.image}
              value={categoryImages[i]}
              uploading={uploadingSlot === `cat-${i}`}
              onUpload={(file) => uploadImage(file, `cat-${i}`, (url) => setCategoryAt(i, url))}
              onReset={() => setCategoryAt(i, '')}
            />
          ))}
        </div>
      </section>

      {/* Sticky save on mobile */}
      <div className="mt-8 sm:hidden">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-accent text-white font-semibold rounded-full shadow-lift hover:bg-brand-accent-dark transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save changes
        </button>
      </div>
    </div>
  );
};

export default AdminAppearancePage;
