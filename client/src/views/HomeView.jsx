import { useState, useEffect } from 'react';
import * as api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import './HomeView.css';
import { useGlobalContext } from '@/components/GlobalContext/GlobalContext';

function HomeView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { getCart, addToCart } = useGlobalContext();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.getProducts();
      if (response.data && response.data.data) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product._id, 1);
      // toast.success('Added to cart!');
    } catch (error) {
      console.error('Add to cart error:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to add items to cart');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add to cart');
      }
    }
  };

  const filteredProducts = searchQuery
    ? products.filter(product =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.desc?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <div>
      <main>
        {/* <section className="hero-section">
          <Banner />
        </section> */}

        {/* <section className="benefits-section">
          <Benefits />
        </section> */}

        <section className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        </section>

        <section className="products-section">
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product._id} className="product-card">
                  <div className="product-image">
                    <img
                      src={product.img}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/600x400';
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>{product.desc}</p>
                    <div className="product-details">
                      <span className="price">${product.price.toFixed(2)}</span>
                      <span className="stock">Stock: {product.stock}</span>
                    </div>
                    {user?.role?.toUpperCase() === 'BUYER' && (
                      <button
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.available || product.stock <= 0}
                      >
                        {!product.available ? 'Not Available' :
                         product.stock <= 0 ? 'Out of Stock' :
                         'Add to Cart'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default HomeView;
