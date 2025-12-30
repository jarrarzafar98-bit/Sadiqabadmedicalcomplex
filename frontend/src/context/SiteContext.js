import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from '../services/api';

const SiteContext = createContext();

export const useSite = () => useContext(SiteContext);

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    hospital_name: 'Sadiqabad Medical Complex',
    tagline: 'Your Health, Our Priority',
    phone: '+92-300-1234567',
    whatsapp: '+92-300-1234567',
    email: 'info@sadiqabadmedical.com',
    address: 'Main Hospital Road, Sadiqabad, Punjab, Pakistan',
    working_hours: 'Mon-Sat: 8:00 AM - 10:00 PM, Sun: 9:00 AM - 5:00 PM',
    emergency_hours: '24/7 Emergency Services',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <SiteContext.Provider value={{ settings, setSettings, loading }}>
      {children}
    </SiteContext.Provider>
  );
};
