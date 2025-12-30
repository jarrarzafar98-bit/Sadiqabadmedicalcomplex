import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/api';
import { Save, CheckCircle } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettings();
        setSettings(res.data || {});
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Site Settings</h2>
        {saved && (
          <span className="text-green-600 flex items-center gap-1 text-sm">
            <CheckCircle size={16} /> Saved successfully
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">General Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
              <input type="text" value={settings.hospital_name || ''} onChange={(e) => setSettings({...settings, hospital_name: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input type="text" value={settings.tagline || ''} onChange={(e) => setSettings({...settings, tagline: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About Text</label>
              <textarea value={settings.about_text || ''} onChange={(e) => setSettings({...settings, about_text: e.target.value})} className="input-field" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mission Statement</label>
              <textarea value={settings.mission_text || ''} onChange={(e) => setSettings({...settings, mission_text: e.target.value})} className="input-field" rows={2} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={settings.phone || ''} onChange={(e) => setSettings({...settings, phone: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input type="tel" value={settings.whatsapp || ''} onChange={(e) => setSettings({...settings, whatsapp: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={settings.email || ''} onChange={(e) => setSettings({...settings, email: e.target.value})} className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={settings.address || ''} onChange={(e) => setSettings({...settings, address: e.target.value})} className="input-field" />
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Working Hours</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
              <input type="text" value={settings.working_hours || ''} onChange={(e) => setSettings({...settings, working_hours: e.target.value})} className="input-field" placeholder="Mon-Sat: 8 AM - 10 PM" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Hours</label>
              <input type="text" value={settings.emergency_hours || ''} onChange={(e) => setSettings({...settings, emergency_hours: e.target.value})} className="input-field" placeholder="24/7 Emergency" />
            </div>
          </div>
        </div>

        {/* Social & Map */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Social & Map</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed URL</label>
              <input type="url" value={settings.google_maps_embed || ''} onChange={(e) => setSettings({...settings, google_maps_embed: e.target.value})} className="input-field" placeholder="https://www.google.com/maps/embed?pb=..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                <input type="url" value={settings.facebook_url || ''} onChange={(e) => setSettings({...settings, facebook_url: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
                <input type="url" value={settings.twitter_url || ''} onChange={(e) => setSettings({...settings, twitter_url: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                <input type="url" value={settings.instagram_url || ''} onChange={(e) => setSettings({...settings, instagram_url: e.target.value})} className="input-field" />
              </div>
            </div>
          </div>
        </div>

        {/* AdSense */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">AdSense (Future)</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="adsense" checked={settings.adsense_enabled || false} onChange={(e) => setSettings({...settings, adsense_enabled: e.target.checked})} className="rounded" />
              <label htmlFor="adsense" className="text-sm text-gray-700">Enable AdSense</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AdSense Client ID</label>
              <input type="text" value={settings.adsense_client_id || ''} onChange={(e) => setSettings({...settings, adsense_client_id: e.target.value})} className="input-field" placeholder="ca-pub-xxxxx" disabled={!settings.adsense_enabled} />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
