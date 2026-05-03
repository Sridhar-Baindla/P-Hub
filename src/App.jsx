import { Routes, Route, Link } from 'react-router-dom';
import { Pill } from 'lucide-react';
import './App.css';
import Header from './components/Header';
import Home from './pages/Home';
import Medicines from './pages/Medicines';
import Prescription from './pages/Prescription';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import About from './pages/About';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Returns from './pages/Returns';

function App() {

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/prescription" element={<Prescription />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/returns" element={<Returns />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-col">
              <div className="logo" style={{ marginBottom: '1rem' }}>
                <Pill size={24} color="var(--primary)" />
                P-Hub
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Your complete digital health companion. Fast, safe, and smart medicine delivery.
              </p>
            </div>
            
            <div className="footer-col">
              <h3>Services</h3>
              <div className="footer-links">
                <Link to="/medicines">Order Medicines</Link>
                <Link to="/prescription">Upload Prescription</Link>
              </div>
            </div>

            <div className="footer-col">
              <h3>Company</h3>
              <div className="footer-links">
                <Link to="/about">About Us</Link>
                <Link to="/contact">Contact</Link>
              </div>
            </div>

            <div className="footer-col">
              <h3>Contact</h3>
              <div className="footer-links">
                <p>
                  <a href="tel:+916302349535" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Mobile: +91 6302349535</a>
                </p>
              </div>
            </div>

            <div className="footer-col">
              <h3>Legal</h3>
              <div className="footer-links">
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
                <Link to="/returns">Return Policy</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} P-Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
