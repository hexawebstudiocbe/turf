import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { useTurf } from '../../context/TurfContext';
import { Settings, MapPin, Phone, Clock, Plus, Trash2, Save, Image, CheckCircle } from 'lucide-react';

const AdminTurfPage = () => {
  const { turf, refreshTurf } = useTurf();
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    address: '',
    city: '',
    state: '',
    googleMapsUrl: '',
    openingTime: '06:00',
    closingTime: '23:00',
    contactPhone: '',
    whatsappNumber: '',
    sports: [],
    amenities: [],
    gallery: [],
  });
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    if (turf) {
      setFormData({
        name: turf.name || '',
        tagline: turf.tagline || '',
        description: turf.description || '',
        address: turf.address || '',
        city: turf.city || '',
        state: turf.state || '',
        googleMapsUrl: turf.googleMapsUrl || '',
        openingTime: turf.openingTime || '06:00',
        closingTime: turf.closingTime || '23:00',
        contactPhone: turf.contactPhone || '',
        whatsappNumber: turf.whatsappNumber || '',
        sports: turf.sports || ['Football (5v5 / 7v7)', 'Box Cricket'],
        amenities: turf.amenities || [],
        gallery: turf.gallery || [],
      });
    }
  }, [turf]);

  const handleAddGalleryImage = () => {
    setFormData({
      ...formData,
      gallery: [
        ...formData.gallery,
        {
          url: 'https://images.unsplash.com/photo-1529900240041-22f1ad31846c?auto=format&fit=crop&w=800&q=80',
          caption: 'Turf Pitch View',
        },
      ],
    });
  };

  const handleGalleryChange = (index, field, value) => {
    const updated = [...formData.gallery];
    updated[index][field] = value;
    setFormData({ ...formData, gallery: updated });
  };

  const handleRemoveGallery = (index) => {
    const updated = formData.gallery.filter((_, i) => i !== index);
    setFormData({ ...formData, gallery: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setActionMessage(null);

    try {
      const res = await adminApi.updateTurf(formData);
      if (res.success) {
        setActionMessage('Turf profile updated successfully!');
        refreshTurf();
      }
    } catch (err) {
      setActionMessage(err.message || 'Failed to update turf');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            TURF PROFILE
          </span>
          <h1 className="text-3xl font-black text-white font-display mt-1">Facility Details & Settings</h1>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary text-xs py-3 px-6 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Turf Details'}
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-pitch-950 border border-pitch-500/40 text-xs text-pitch-300 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Identity */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" />
            General Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Turf Brand Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="input-field text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field text-xs"
            />
          </div>
        </div>

        {/* Operating Hours & Contact */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-pitch-400" />
            Operating Hours & Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Opening Time</label>
              <input
                type="time"
                value={formData.openingTime}
                onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Closing Time</label>
              <input
                type="time"
                value={formData.closingTime}
                onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="input-field text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="input-field text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-pitch-400" />
            Location & Map Link
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Google Maps URL</label>
            <input
              type="text"
              value={formData.googleMapsUrl}
              onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
              className="input-field text-xs font-mono text-slate-300"
            />
          </div>
        </div>

        {/* Gallery Image URLs */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Image className="w-4 h-4 text-blue-400" />
              Turf Photo Gallery
            </h3>
            <button
              type="button"
              onClick={handleAddGalleryImage}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-pitch-400" />
              Add Photo
            </button>
          </div>

          <div className="space-y-3">
            {formData.gallery.map((img, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <input
                  type="text"
                  placeholder="Image URL"
                  value={img.url}
                  onChange={(e) => handleGalleryChange(i, 'url', e.target.value)}
                  className="input-field text-xs py-1.5 flex-1 font-mono"
                />
                <input
                  type="text"
                  placeholder="Caption"
                  value={img.caption}
                  onChange={(e) => handleGalleryChange(i, 'caption', e.target.value)}
                  className="input-field text-xs py-1.5 w-1/3"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveGallery(i)}
                  className="p-1.5 text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminTurfPage;
