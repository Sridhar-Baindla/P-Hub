import React from 'react';

const Terms = () => {
  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Terms of Service</h1>
      
      <div style={{ background: 'var(--surface)', padding: '3rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', lineHeight: '1.8', color: 'var(--text-primary)' }}>
        <p style={{ marginBottom: '2rem' }}>
          These Terms of Service govern your use of P-Hub’s website, mobile application, and in-store services. By using our services, you agree to these terms.
        </p>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>1. Use of Services</h3>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>You must be at least 18 years old or use the service under supervision</li>
          <li style={{ marginBottom: '0.5rem' }}>Information provided must be accurate and complete</li>
          <li style={{ marginBottom: '0.5rem' }}>Misuse of services or fraudulent activity is strictly prohibited</li>
        </ul>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>2. Product Information</h3>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>We strive to ensure accurate product descriptions and pricing</li>
          <li style={{ marginBottom: '0.5rem' }}>Availability of medicines and products may vary</li>
          <li style={{ marginBottom: '0.5rem' }}>Certain medicines require valid prescriptions</li>
        </ul>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>3. Orders & Payments</h3>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Orders are confirmed only after successful payment or verification</li>
          <li style={{ marginBottom: '0.5rem' }}>P-Hub reserves the right to cancel or refuse any order</li>
          <li style={{ marginBottom: '0.5rem' }}>Prices and discounts may change without prior notice</li>
        </ul>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>4. Prescription Medicines</h3>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Prescription drugs will only be dispensed upon verification of a valid prescription</li>
          <li style={{ marginBottom: '0.5rem' }}>Customers are responsible for providing accurate prescription details</li>
        </ul>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>5. Membership & Offers</h3>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Discounts (minimum 10%) and offers are subject to terms and availability</li>
          <li style={{ marginBottom: '0.5rem' }}>Membership benefits, if applicable, may change or be discontinued</li>
        </ul>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>6. Limitation of Liability</h3>
        <p style={{ marginBottom: '1rem' }}>P-Hub is not liable for:</p>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Misuse of products</li>
          <li style={{ marginBottom: '0.5rem' }}>Delays due to external factors</li>
          <li style={{ marginBottom: '0.5rem' }}>Any indirect or incidental damages</li>
        </ul>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>7. Intellectual Property</h3>
        <p style={{ marginBottom: '2rem' }}>
          All content, branding, and materials on P-Hub platforms are the property of P-Hub and may not be reused without permission.
        </p>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>8. Termination</h3>
        <p style={{ marginBottom: '0' }}>
          We reserve the right to suspend or terminate access to our services in case of policy violations.
        </p>
      </div>
    </div>
  );
};

export default Terms;
