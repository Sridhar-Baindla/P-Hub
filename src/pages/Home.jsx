import { Link } from 'react-router-dom';
import { Search, ShieldCheck, FileText, Truck, Activity } from 'lucide-react';
import './Home.css';
import heroImage from '../assets/hero_pharmacy.png';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-content">
          <div className="hero-text-area">
            <h1>
              Healthcare <br/>
              <span className="text-gradient">Faster. Safer. Smarter.</span>
            </h1>
            <p>
              Your complete digital health companion. Order medicines, upload prescriptions, and track your health from a single, seamless platform.
            </p>
            
            <div className="hero-search">
              <Search size={20} color="var(--text-secondary)" style={{ marginLeft: '1rem', alignSelf: 'center' }} />
              <input type="text" placeholder="Search for medicines, health products..." />
              <button>Search</button>
            </div>

            <div className="hero-actions">
              <Link to="/medicines" className="btn btn-primary">Order Now</Link>
              <Link to="/prescription" className="btn btn-secondary">Upload Prescription</Link>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">50k+</span>
                <span className="stat-label">Happy Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">10k+</span>
                <span className="stat-label">Medicines</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </div>
          </div>
          
          <div className="hero-image-area">
            <img 
              src={heroImage} 
              alt="P-Hub Digital Healthcare" 
              className="hero-image"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1587854692152-cbe668df9731?q=80&w=1000&auto=format&fit=crop'; }}
            />
            <div className="floating-card">
              <div className="floating-icon">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>100% Genuine</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Verified Pharmacies</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose <span className="text-gradient">P-Hub?</span></h2>
            <p>We combine cutting-edge technology with genuine healthcare to provide you the best experience possible.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon-wrapper">
                <Truck size={32} />
              </div>
              <h3>Express Delivery</h3>
              <p>Get your essential medicines delivered to your doorstep in record time. Track your order in real-time.</p>
            </div>
            
            <div className="feature-card card">
              <div className="feature-icon-wrapper">
                <FileText size={32} />
              </div>
              <h3>Smart Prescriptions</h3>
              <p>Upload your prescription once and let our AI handle the rest. Auto-refills and dosage reminders included.</p>
            </div>
            
            <div className="feature-card card">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={32} />
              </div>
              <h3>Verified Genuine</h3>
              <p>All our partner pharmacies are strictly verified to ensure you receive only 100% genuine medications.</p>
            </div>
            
            <div className="feature-card card">
              <div className="feature-icon-wrapper">
                <Activity size={32} />
              </div>
              <h3>Health Tracking</h3>
              <p>Maintain your personal health profile, store lab reports securely, and get AI-powered health insights.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
