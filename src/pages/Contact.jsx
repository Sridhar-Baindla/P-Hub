import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          We'd Love to Hear From You
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: '1.6' }}>
          Whether you have a question about our products, need help with your prescription, or anything else, our team is ready to answer all your questions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Send us a message</h3>
          
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--success)' }}>
              <CheckCircle size={48} style={{ margin: '0 auto 1rem' }} />
              <h3>Message Sent!</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>We will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" placeholder="John Doe" required />
              </div>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input type="email" className="input-field" placeholder="john@example.com" required />
              </div>
              <div className="input-group">
                <label className="input-label">Subject</label>
                <select className="input-field" required>
                  <option value="">Select a subject...</option>
                  <option value="order">Order Inquiry</option>
                  <option value="prescription">Prescription Help</option>
                  <option value="careers">Careers</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Message</label>
                <textarea className="input-field" placeholder="How can we help you?" rows="5" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={18} /> Send Message
              </button>
            </form>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
              <Phone size={28} />
            </div>
            <div>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Phone</h4>
              <p style={{ fontSize: '1.1rem' }}>
                <a href="tel:+916302349535" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>+91 6302349535</a>
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Mon-Fri from 8am to 5pm</p>
            </div>
          </div>
          
          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--success)' }}>
              <Mail size={28} />
            </div>
            <div>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Email</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>support@phub.com</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Online support 24/7</p>
            </div>
          </div>
          
          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', color: '#3b82f6' }}>
              <MapPin size={28} />
            </div>
            <div>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Office</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.5' }}>
                123 Health Ave, Medical District<br/>New York, NY 10001
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
