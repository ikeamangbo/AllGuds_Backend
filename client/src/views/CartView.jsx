import { useState, useEffect } from 'react';
import { useGlobalContext } from '@/components/GlobalContext/GlobalContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import OrderSummary from '../components/Cart/OrderSummary/OrderSummary';
import './CartView.css';

const CartView = () => {
  const { state, getCart, updateCartItemQuantity, removeFromCart } = useGlobalContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState('Standard');

  // Fetch cart on mount and when cart items change
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCart();
    }
  }, []);

  // Listen for cart changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const cartData = localStorage.getItem('cart');
      if (!cartData || cartData === '[]') {
        // Cart is empty, redirect to home
        navigate('/');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  // Log the cart data to debug
  console.log('Cart State:', state.cart);

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      if (newQuantity < 1) return;
      await updateCartItemQuantity(productId, newQuantity);
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Item removed from cart');
      
      // Check if cart is empty after removal
      if (state.cart.length <= 1) {
        navigate('/');
      }
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return <div className="cart-loading">Loading cart...</div>;
  }

  if (!state.cart || state.cart.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/')}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-content">
        <div className="cart-items">
          <h2>Shopping Cart ({state.cartQuantity} items)</h2>
          {state.cart.map((item) => (
            <div key={item._id} className="cart-item">
              <div className="item-image">
                <img 
                  src={item.image || 'https://placehold.co/600x400'} 
                  alt={item.name} 
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/600x400';
                  }}
                />
              </div>
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-price">GHS {parseFloat(item.price).toFixed(2)}</p>
                <div className="quantity-controls">
                  <button 
                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= (item.stock || 0)}
                  >
                    +
                  </button>
                </div>
                <button 
                  className="remove-button"
                  onClick={() => handleRemoveItem(item.productId)}
                >
                  Remove
                </button>
              </div>
              <div className="item-total">
                GHS {(parseFloat(item.price) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <OrderSummary 
            phone={phone}
            setPhone={setPhone}
            deliveryType={deliveryType}
            setDeliveryType={setDeliveryType}
          />
        </div>
      </div>
    </div>
  );
};

export default CartView;
