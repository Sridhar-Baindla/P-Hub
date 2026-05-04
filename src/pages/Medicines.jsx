import React, { useState, useEffect, useContext } from 'react';
import { Search, Filter, Plus, Check } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './Medicines.css';

const CATEGORIES = ['All', 'Pain Relief', 'Antibiotics', 'Supplements', 'Allergy', 'Digestion', 'Heart Health'];

const Medicines = () => {
  const { user, fetchCartCount } = useContext(AppContext);
  const [medicines, setMedicines] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItems, setAddedItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/medicines')
      .then(res => res.json())
      .then(data => {
        setMedicines(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredMedicines = medicines.filter(med => {
    const matchesCategory = activeCategory === 'All' || med.category === activeCategory;
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = async (med) => {
    if (!user) {
      alert("Please login first to add items to cart.");
      return;
    }

    try {
      // Check if already in cart
      const cartRes = await fetch(`http://localhost:5000/cart?userId=${user.id}&medicineId=${med.id}`);
      const cartItems = await cartRes.json();

      if (cartItems.length > 0) {
        // Update quantity
        const cartItem = cartItems[0];
        await fetch(`http://localhost:5000/cart/${cartItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: cartItem.quantity + 1 })
        });
      } else {
        // Add new item
        await fetch('http://localhost:5000/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            medicineId: med.id,
            quantity: 1
          })
        });
      }

      fetchCartCount();
      setAddedItems(prev => ({ ...prev, [med.id]: true }));
      setTimeout(() => {
        setAddedItems(prev => ({ ...prev, [med.id]: false }));
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading medicines...</div>;
  }

  return (
    <div className="container catalog-container">
      {/* Mobile Filter Toggle */}
      <button 
        className="mobile-filter-toggle btn btn-secondary" 
        onClick={() => setShowMobileFilters(!showMobileFilters)}
      >
        <Filter size={18} /> {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      {/* Sidebar */}
      <aside className={`filters-sidebar ${showMobileFilters ? 'mobile-show' : ''}`}>
        <div className="filter-section">
          <h3>Categories <Filter size={18} className="hide-desktop" onClick={() => setShowMobileFilters(false)} /></h3>
          <div className="filter-list">
            {CATEGORIES.map(category => (
              <div 
                key={category} 
                className={`filter-item ${activeCategory === category ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(category);
                  if (window.innerWidth <= 992) setShowMobileFilters(false);
                }}
              >
                <div className="filter-checkbox">
                  {activeCategory === category && <Check size={14} />}
                </div>
                <span>{category}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3>Prescription</h3>
          <div className="filter-list">
            <div className="filter-item">
              <div className="filter-checkbox"></div>
              <span>Rx Required</span>
            </div>
            <div className="filter-item">
              <div className="filter-checkbox"></div>
              <span>Over the Counter (OTC)</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="catalog-main">
        <div className="catalog-header">
          <div className="search-bar">
            <Search size={20} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search medicines..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select className="sort-select">
            <option>Sort by: Popularity</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Name: A to Z</option>
          </select>
        </div>

        <div className="medicine-grid">
          {filteredMedicines.map(med => (
            <div key={med.id} className="medicine-card">
              {med.rxRequired && (
                <div className="medicine-badge badge badge-success" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                  Rx Required
                </div>
              )}
              
              <div className="medicine-image-container">
                <img src={med.image} alt={med.name} className="medicine-image" />
              </div>
              
              <span className="medicine-category">{med.category}</span>
              <h4 className="medicine-name">{med.name}</h4>
              <span className="medicine-manufacturer">{med.manufacturer}</span>
              
              <div className="medicine-footer">
                <span className="medicine-price">${med.price.toFixed(2)}</span>
                <button 
                  className="add-to-cart-btn" 
                  onClick={() => handleAddToCart(med)}
                  aria-label="Add to cart"
                >
                  {addedItems[med.id] ? <Check size={20} /> : <Plus size={20} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredMedicines.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
            <h3>No medicines found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Medicines;
