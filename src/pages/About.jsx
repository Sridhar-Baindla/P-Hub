import React from 'react';
import { Target, Users, Shield, Star, MapPin } from 'lucide-react';

const About = () => {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          About P-Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: '1.6' }}>
          <strong>P-Hub Medicine Store</strong> is a modern, customer-focused healthcare retail brand designed to redefine the way people access medicines and wellness products. Built on the foundation of trust, availability, and affordability, P-Hub aims to become a one-stop destination for all healthcare needs—both in-store and through digital platforms.
        </p>
      </div>

      {/* Who We Are, Mission, Vision */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
        <div style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', transition: 'transform var(--transition-fast)' }} className="hover-lift">
          <div style={{ width: '48px', height: '48px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#3b82f6' }}>
            <Users size={24} />
          </div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Who We Are</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            P-Hub is more than just a pharmacy. We are a healthcare partner committed to improving everyday well-being by ensuring that essential medicines, healthcare products, and wellness solutions are always within reach. Our stores are thoughtfully designed with a clean, organized, and professional environment, supported by trained staff who prioritize customer care and guidance.
          </p>
        </div>

        <div style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', transition: 'transform var(--transition-fast)' }} className="hover-lift">
          <div style={{ width: '48px', height: '48px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
            <Target size={24} />
          </div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Our Mission</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Our mission is simple: <br/><br/><strong>To provide reliable, accessible, and affordable healthcare solutions while building long-term trust with every customer.</strong>
          </p>
        </div>

        <div style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', transition: 'transform var(--transition-fast)' }} className="hover-lift">
          <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--success)' }}>
            <Star size={24} />
          </div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Our Vision</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            We envision creating a strong network of smart pharmacies that combine physical stores with digital convenience—making P-Hub a trusted healthcare brand across communities.
          </p>
        </div>
      </div>

      {/* What Makes Us Different */}
      <div style={{ marginBottom: '5rem' }}>
        <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem' }}>What Makes P-Hub Different</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <div style={{ padding: '2rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <span style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>1</span>
              Wide Availability of Medicines
            </h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              We address one of the biggest challenges customers face—medicine availability. P-Hub ensures a comprehensive stock covering treatments for a wide range of health conditions.
            </p>
          </div>

          <div style={{ padding: '2rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <span style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>2</span>
              Transparent & Trustworthy Service
            </h4>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6', paddingLeft: '1.5rem', listStyleType: 'disc' }}>
              <li>Printed bills for every purchase</li>
              <li>Clear pricing with mandatory discounts (minimum 10%)</li>
              <li>Professional staff in uniform to maintain a clinical and reliable environment</li>
            </ul>
          </div>

          <div style={{ padding: '2rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', gridRow: 'span 2' }}>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <span style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>3</span>
              Complete Healthcare Range
            </h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>Beyond medicines, P-Hub offers a full spectrum of healthcare and lifestyle products, including:</p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6', paddingLeft: '1.5rem', listStyleType: 'disc' }}>
              <li>Health supplements & protein powders</li>
              <li>Personal care & hygiene products</li>
              <li>Baby care essentials</li>
              <li>Skin care & beauty products</li>
              <li>Surgical and home care supplies</li>
              <li>Medical devices like BP monitors, glucometers, and thermometers</li>
              <li>Fitness and wellness products</li>
            </ul>
          </div>

          <div style={{ padding: '2rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <span style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>4</span>
              Focus on Preventive Health
            </h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              We actively promote wellness through supplements, immunity boosters, and health-focused products to help customers maintain a healthier lifestyle—not just treat illness.
            </p>
          </div>

          <div style={{ padding: '2rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <span style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>5</span>
              Customer-Centric Experience
            </h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              From store layout to service quality, everything is designed to provide a smooth, quick, and comfortable shopping experience—whether offline or online.
            </p>
          </div>

        </div>
      </div>

      {/* Presence */}
      <div style={{ marginBottom: '5rem', background: 'var(--surface)', padding: '4rem 2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', textAlign: 'center' }}>
        <MapPin size={48} color="var(--primary)" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Our Presence</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          P-Hub strategically operates in high-demand, healthcare-focused areas chosen near clinics, hospitals, and residential communities to maximize accessibility and convenience.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
          {['Kukatpally', 'Miyapur', 'Kompally', 'Nizampet'].map(location => (
            <div key={location} style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--primary)', padding: '0.75rem 1.5rem', borderRadius: '2rem', fontWeight: 'bold' }}>
              {location}
            </div>
          ))}
        </div>
      </div>

      {/* Commitment & Promise */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--surface)', padding: '3rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--success)' }}>Our Commitment</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>At P-Hub, we are committed to:</p>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '1.5rem', listStyleType: 'disc', fontSize: '1.1rem' }}>
            <li>Delivering genuine and high-quality products</li>
            <li>Maintaining consistent stock availability</li>
            <li>Offering fair pricing and discounts</li>
            <li>Building long-term relationships based on trust</li>
          </ul>
        </div>

        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', padding: '3rem', borderRadius: 'var(--radius-xl)' }}>
          <Shield size={48} style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>The P-Hub Promise</h3>
          <p style={{ lineHeight: '1.8', fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>
            Whether you visit our store or use our app, P-Hub guarantees a seamless healthcare experience—where quality meets affordability, and care meets convenience.
          </p>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
            P-Hub – Your Trusted Health Partner.
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;
