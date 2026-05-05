import { useState, useEffect, useContext } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './Medicines.css';
import { API_URL } from '../config';

const CATEGORIES = ['All', 'Pain Relief', 'Antibiotics', 'Supplements', 'Allergy', 'Digestion', 'Heart Health'];

const Medicines = () => {
  const { user, token, fetchCartCount, authenticatedFetch } = useContext(AppContext);
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItems, setAddedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [stockLevels, setStockLevels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const medRes = await fetch(`${API_URL}/medicines`);
        const medData = await medRes.json();
        setMedicines(Array.isArray(medData) ? medData : []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || med.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = async (med) => {
    if (!user || !token) {
      alert("Please login first to add items to cart.");
      return;
    }

    try {
      // 1. Check if item already in cart
      const cartRes = await authenticatedFetch(`${API_URL}/cart`);
      const cartItems = await cartRes.json();
      const existingItem = cartItems.find(item => item.medicineId === med.id);

      if (existingItem) {
        await authenticatedFetch(`${API_URL}/cart/${existingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: existingItem.quantity + 1 })
        });
      } else {
        await authenticatedFetch(`${API_URL}/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ medicineId: med.id, quantity: 1 })
        });
      }

      fetchCartCount();
      setAddedItems(prev => ({ ...prev, [med.id]: true }));
      setTimeout(() => setAddedItems(prev => ({ ...prev, [med.id]: false })), 2000);
    } catch (err) {
      console.error(err);
      alert("An error occurred while adding to cart.");
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading medicines...</div>;

  return (
    <div className="container catalog-container no-sidebar">
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
          
          <div className="category-filters" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 0', scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: 'var(--radius-full)', 
                  border: '1px solid var(--border)',
                  background: activeCategory === cat ? 'var(--primary)' : 'var(--surface)',
                  color: activeCategory === cat ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="medicine-grid">
          {filteredMedicines.map(med => (
            <div key={med.id} className="medicine-card">
              <div className="medicine-image-container">
                <img src={med.image} alt={med.name} className="medicine-image" />
              </div>
              <span className="medicine-category">{med.category}</span>
              <h4 className="medicine-name">{med.name}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{med.manufacturer}</p>
              
              <div className="medicine-footer">
                <div className="price-container">
                  <span className="medicine-price">₹{(med.price || 0).toFixed(2)}</span>
                </div>
                <button 
                  className="add-to-cart-btn" 
                  onClick={() => handleAddToCart(med)}
                >
                  {addedItems[med.id] ? <Check size={20} /> : <Plus size={20} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Medicines;
