import React from 'react';

const Privacy = () => {
  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Privacy Policy</h1>
      
      <div style={{ background: 'var(--surface)', padding: '3rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', lineHeight: '1.8', color: 'var(--text-primary)' }}>
        <p style={{ marginBottom: '2rem' }}>
          At <strong>P-Hub</strong>, we are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website, mobile application, and physical store services.
        </p>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>1. Information We Collect</h3>
        <p style={{ marginBottom: '1rem' }}>We may collect the following types of information:</p>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}><strong>Personal Information:</strong> Name, phone number, email address, delivery address</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Health-Related Information:</strong> Prescription details, medicine orders (only when voluntarily provided)</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Payment Information:</strong> Billing details (processed securely via third-party payment gateways)</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Usage Data:</strong> App activity, browsing behavior, preferences</li>
        </ul>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>2. How We Use Your Information</h3>
        <p style={{ marginBottom: '1rem' }}>Your information is used to:</p>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Process orders and deliver products</li>
          <li style={{ marginBottom: '0.5rem' }}>Verify prescriptions where required</li>
          <li style={{ marginBottom: '0.5rem' }}>Improve our services and customer experience</li>
          <li style={{ marginBottom: '0.5rem' }}>Send order updates, offers, and important notifications</li>
          <li style={{ marginBottom: '0.5rem' }}>Maintain legal and regulatory compliance</li>
        </ul>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>3. Data Protection & Security</h3>
        <p style={{ marginBottom: '2rem' }}>
          We implement industry-standard security measures to protect your data from unauthorized access, misuse, or disclosure. Sensitive information such as payment details is encrypted and handled through secure systems.
        </p>
        
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>4. Sharing of Information</h3>
        <p style={{ marginBottom: '1rem' }}>We do not sell or rent your personal data. Information may be shared only with:</p>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Delivery partners for order fulfillment</li>
          <li style={{ marginBottom: '0.5rem' }}>Payment gateways for transaction processing</li>
          <li style={{ marginBottom: '0.5rem' }}>Regulatory authorities when required by law</li>
        </ul>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>5. User Rights</h3>
        <p style={{ marginBottom: '1rem' }}>You have the right to:</p>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Access and review your data</li>
          <li style={{ marginBottom: '0.5rem' }}>Request corrections or updates</li>
          <li style={{ marginBottom: '0.5rem' }}>Request deletion of your data (subject to legal requirements)</li>
        </ul>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>6. Cookies & Tracking</h3>
        <p style={{ marginBottom: '2rem' }}>
          Our website and app may use cookies to enhance user experience, analyze traffic, and personalize content.
        </p>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>7. Policy Updates</h3>
        <p style={{ marginBottom: '0' }}>
          P-Hub reserves the right to update this Privacy Policy at any time. Changes will be communicated via the app or website.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
