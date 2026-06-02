

const Returns = () => {
  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Return & Refund Policy</h1>

      <div style={{ background: 'var(--surface)', padding: '3rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', lineHeight: '1.8', color: 'var(--text-primary)' }}>
        <p style={{ marginBottom: '2rem' }}>
          At P-Hub, customer safety and satisfaction are our priorities. Due to the sensitive nature of healthcare products, our return policy is designed to maintain quality and compliance.
        </p>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>1. Return Eligibility</h3>
        <p style={{ marginBottom: '1rem' }}>Returns are accepted only under the following conditions:</p>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Wrong product delivered</li>
          <li style={{ marginBottom: '0.5rem' }}>Damaged or defective product</li>
          <li style={{ marginBottom: '0.5rem' }}>Expired product at the time of delivery</li>
        </ul>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>2. Non-Returnable Items</h3>
        <p style={{ marginBottom: '1rem' }}>The following items cannot be returned:</p>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Opened or used medicines</li>
          <li style={{ marginBottom: '0.5rem' }}>Prescription medicines once dispensed</li>
          <li style={{ marginBottom: '0.5rem' }}>Personal care and hygiene products</li>
          <li style={{ marginBottom: '0.5rem' }}>Baby care products (if opened)</li>
        </ul>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>3. Return Process</h3>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Request a return within <strong>24–48 hours</strong> of delivery</li>
          <li style={{ marginBottom: '0.5rem' }}>Provide proof (invoice and product image)</li>
          <li style={{ marginBottom: '0.5rem' }}>Our team will verify and approve eligible returns</li>
        </ul>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>4. Refund Policy</h3>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Refunds will be processed after product verification</li>
          <li style={{ marginBottom: '0.5rem' }}>Refunds are issued via original payment method or store credit</li>
          <li style={{ marginBottom: '0.5rem' }}>Processing time: <strong>5–7 business days</strong></li>
        </ul>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>5. Replacement Policy</h3>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Eligible products may be replaced instead of refunded</li>
          <li style={{ marginBottom: '0.5rem' }}>Replacement is subject to product availability</li>
        </ul>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>6. Order Cancellation</h3>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Orders can be canceled before dispatch</li>
          <li style={{ marginBottom: '0.5rem' }}>Once shipped, cancellation is not allowed</li>
        </ul>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>7. Important Notes</h3>
        <ul style={{ marginBottom: '3rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Bills are mandatory for all returns (as part of our trust policy)</li>
          <li style={{ marginBottom: '0.5rem' }}>Discounts applied during purchase will be adjusted in refunds</li>
        </ul>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />

        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Contact Us</h2>
        <p style={{ marginBottom: '2rem' }}>
          For any questions regarding Privacy Policy, Terms, or Returns, please contact P-Hub customer support through our app or visit your nearest store.
        </p>

        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
          P-Hub – Committed to Trust, Transparency, and Care.
        </p>
      </div>
    </div>
  );
};

export default Returns;
