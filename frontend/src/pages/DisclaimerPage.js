import React from 'react';
import { useSite } from '../context/SiteContext';

const DisclaimerPage = () => {
  const { settings } = useSite();

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="card p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Medical Disclaimer</h1>
          
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>General Information Only</h2>
            <p>
              The information provided on this website is for general informational and educational
              purposes only. It is not intended to be a substitute for professional medical advice,
              diagnosis, or treatment.
            </p>

            <h2>Not Medical Advice</h2>
            <p>
              The content on our website, including health articles and blog posts, should not be
              construed as medical advice. Always seek the advice of your physician or other
              qualified health provider with any questions you may have regarding a medical condition.
            </p>

            <h2>Emergency Situations</h2>
            <p>
              If you think you may have a medical emergency, call your doctor or emergency services
              immediately. {settings.hospital_name} does not recommend or endorse any specific tests,
              physicians, products, procedures, opinions, or other information that may be mentioned
              on this website.
            </p>

            <h2>No Doctor-Patient Relationship</h2>
            <p>
              Using this website or contacting us through the website does not create a
              doctor-patient relationship. A doctor-patient relationship is only established
              through in-person consultation.
            </p>

            <h2>Accuracy of Information</h2>
            <p>
              While we strive to keep the information on our website accurate and up-to-date,
              we make no representations or warranties of any kind about the completeness,
              accuracy, reliability, or availability of the information.
            </p>

            <h2>External Links</h2>
            <p>
              Our website may contain links to external websites. We are not responsible for
              the content or privacy practices of these external sites.
            </p>

            <h2>Contact</h2>
            <p>
              If you have questions about this disclaimer, please contact us at {settings.email}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;
