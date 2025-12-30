import React from 'react';
import { useSite } from '../context/SiteContext';

const PrivacyPolicyPage = () => {
  const { settings } = useSite();

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="card p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>
            
            <p>
              {settings.hospital_name} ("we," "our," or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard your information when you
              visit our website or use our services.
            </p>

            <h2>Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Personal identification information (name, phone number, email address)</li>
              <li>Health information for appointment bookings</li>
              <li>Demographic information (age, gender)</li>
              <li>Contact form submissions</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process and manage your appointments</li>
              <li>Send appointment confirmations and reminders</li>
              <li>Respond to your inquiries and requests</li>
              <li>Improve our services and website</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>Information Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information.
              However, no method of transmission over the Internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>

            <h2>Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to outside parties
              except as necessary to provide our services or as required by law.
            </p>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              {settings.hospital_name}<br />
              {settings.address}<br />
              Email: {settings.email}<br />
              Phone: {settings.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
