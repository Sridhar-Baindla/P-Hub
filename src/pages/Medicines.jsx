import React, { useState, useEffect, useContext } from 'react';
import { Search, Filter, Plus, Check } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './Medicines.css';
import { API_URL } from '../config';

const CATEGORIES = ['All', 'Pain Relief', 'Antibiotics', 'Supplements', 'Allergy', 'Digestion', 'Heart Health'];

const Medicines = () => {
  const { user, fetchCartCount } = useContext(AppContext);
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItems, setAddedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const [stockLevels, setStockLevels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medRes, stockRes] = await Promise.all([
          fetch(`${API_URL}/medicines`),
          fetch(`${API_URL}/stock`)
        ]);
        
        const medData = await medRes.json();
        const stockData = await stockRes.json();
        
        setMedicines(medData);
        setStockLevels(stockData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getStockCount = (medicineId) => {
    return stockLevels
      .filter(s => s.medicineId === medicineId)
      .reduce((acc, curr) => acc + curr.quantity, 0);
  };

  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || med.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = async (med) => {
    if (!user) {
      alert("Please login first to add items to cart.");
      return;
    }

    try {
      // 1. Check and decrement stock
      const stockRes = await fetch(`${API_URL}/stock?medicineId=${med.id}`);
      const stockEntries = await stockRes.json();
      
      // Find the first location that has stock
      const availableStock = stockEntries.find(s => s.quantity > 0);

      if (!availableStock) {
        alert("Sorry, this medicine is currently out of stock in all locations.");
        return;
      }

      // Decrement stock at that location
      await fetch(`${API_URL}/stock/${availableStock.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: availableStock.quantity - 1 })
      });

      // 2. Add to cart (existing logic)
      const cartRes = await fetch(`${API_URL}/cart?userId=${user.id}&medicineId=${med.id}`);
      const cartItems = await cartRes.json();

      if (cartItems.length > 0) {
        // Update quantity
        const cartItem = cartItems[0];
        await fetch(`${API_URL}/cart/${cartItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: cartItem.quantity + 1 })
        });
      } else {
        // Add new item
        await fetch(`${API_URL}/cart`, {
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
      alert("An error occurred while adding to cart.");
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading medicines...</div>;
  }

  return (
    <div className="container catalog-container no-sidebar">
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
          {filteredMedicines.map(med => {
            const totalStock = getStockCount(med.id);
            const isOutOfStock = totalStock === 0;

            return (
              <div key={med.id} className={`medicine-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
                {med.rxRequired && (
                  <div className="medicine-badge badge badge-success" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                    Rx Required
                  </div>
                )}
                
                <div className="medicine-image-container">
                  <img src={med.image} alt={med.name} className="medicine-image" />
                  {isOutOfStock && (
                    <div className="out-of-stock-overlay">Out of Stock</div>
                  )}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="medicine-category">{med.category}</span>
                  <span className={`stock-status ${isOutOfStock ? 'text-danger' : 'text-success'}`}>
                    {isOutOfStock ? 'Out of Stock' : `${totalStock} units available`}
                  </span>
                </div>

                <h4 className="medicine-name">{med.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <span>{med.manufacturer}</span>
                  {med.expiryDate && (
                    <span style={{ color: 'var(--danger)', fontWeight: 500 }}>
                      Exp: {new Date(med.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
                
                <div className="medicine-footer">
                  <div className="price-container" style={{ display: 'flex', flexDirection: 'column' }}>
                    {med.discountedPrice ? (
                      <>
                        <span className="medicine-price" style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{parseFloat(med.discountedPrice).toFixed(2)}</span>
                        <span className="original-price" style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>₹{parseFloat(med.price).toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="medicine-price">₹{(med.price || 0).toFixed(2)}</span>
                    )}
                  </div>
                  <button 
                    className="add-to-cart-btn" 
                    onClick={() => handleAddToCart(med)}
                    aria-label="Add to cart"
                    disabled={isOutOfStock}
                  >
                    {addedItems[med.id] ? <Check size={20} /> : <Plus size={20} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMedicines.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
            <h3>No medicines found</h3>
            <p>Try adjusting your search query</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Medicines;
