import "./OrderSummary.css";
import { useGlobalContext } from "../../GlobalContext/GlobalContext";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from '@/context/AuthContext';

const OrderSummary = ({ phone, setPhone, deliveryType, setDeliveryType }) => {
  const store = useGlobalContext();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getSubtotal = () => {
    return store.state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDeliveryCost = () => {
    return deliveryType === "Standard" ? 5 : 10;
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryCost();
  };

  const clearCartAndRedirect = () => {
    try {
      // Clear frontend immediately
      localStorage.clear(); // Clear everything including cart and auth
      
      // Force a hard reload to clear all state
      window.location.href = '/';
      window.location.reload(true);
    } catch (error) {
      console.error('Error in clearCartAndRedirect:', error);
      // Force reload anyway
      window.location.reload(true);
    }
  };

  const handleCheckout = () => {
    if (!phone || !user?.email || store.state.cart.length === 0) {
      toast.error('Please check all required fields');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: 'pk_test_6bc057784a33038b8d507c3e7b2b51e4556aa28a',
      email: user.email,
      amount: Math.round(getTotal() * 100),
      currency: 'GHS',
      ref: new Date().getTime().toString(),
      metadata: {
        custom_fields: [
          {
            display_name: "Phone Number",
            variable_name: "phone_number",
            value: phone
          },
          {
            display_name: "Delivery Type",
            variable_name: "delivery_type",
            value: deliveryType
          }
        ]
      },
      callback: function(response) {
        // Force immediate clear and reload
        clearCartAndRedirect();
      },
      onClose: function() {
        setIsProcessing(false);
        toast.info('Payment cancelled');
      }
    });

    handler.openIframe();
  };

  return (
    <div className="is-order-summary">
      <div className="sub-container">
        <div className="contains-order">
          <div className="total-cost">
            <h4>Subtotal ({store.state.cartQuantity} items)</h4>
            <h4>GHS {getSubtotal().toFixed(2)}</h4>
          </div>

          <div className="shipping">
            <h4>Shipping</h4>
            <select
              className="select-dropdown"
              value={deliveryType}
              onChange={(e) => setDeliveryType(e.target.value)}
            >
              <option value="Standard">Standard (GHS 5)</option>
              <option value="Express">Express (GHS 10)</option>
            </select>
          </div>

          <div className="phone-number">
            <h4>Phone Number</h4>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="phone-input"
              required
            />
          </div>

          <div className="total">
            <h4>Total</h4>
            <h4>GHS {getTotal().toFixed(2)}</h4>
          </div>

          <button
            className={`checkout-button ${isProcessing ? 'processing' : ''}`}
            onClick={handleCheckout}
            disabled={
              store.state.cart.length === 0 || 
              isLoading || 
              isProcessing || 
              getTotal() <= 0 || 
              !phone || 
              !user?.email
            }
          >
            {isProcessing ? 'Processing Payment...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
