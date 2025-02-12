import React from 'react';
import { useGlobalContext } from '../GlobalContext/GlobalContext';
import { toast } from 'react-toastify';
import './Product.css';

const Product = ({ product }) => {
  const store = useGlobalContext();
  
  // Detailed logging
  console.log('=== Product Component Debug ===');
  console.log('Full product prop:', product);

  if (!product || !product._id) {
    console.log('Product validation failed:', product);
    return null;
  }

  // Destructure and log each field
  const {
    _id,
    name,
    desc,
    type,
    price,
    img,
    stock,
    available
  } = product;

  console.log('Destructured fields:', {
    _id,
    name,
    desc,
    type,
    price,
    img,
    stock,
    available
  });

  const isInCart = store.state.cart.some(item => 
    String(item.productId) === String(_id)
  );

  const handleAddToCart = async () => {
    if (!isBuyer) return;

    const success = await addToCart(_id);
    if (!success) {
      // Toast is already handled in addToCart
      return;
    }
  };

  return (
    <div className="product-card" data-id={_id}>
      {/* Debug overlay */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        right: 0, 
        background: 'rgba(0,0,0,0.5)', 
        color: 'white', 
        padding: '5px', 
        fontSize: '12px' 
      }}>
        ID: {_id}
      </div>

      <div className="product-image-container">
        <img 
          src={img} 
          alt={name} 
          className="product-image"
          onError={(e) => {
            console.log('Image load failed:', img);
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
        {!available && <div className="out-of-stock-badge">Out of Stock</div>}
      </div>
      
      <div className="product-content">
        <div className="product-header">
          <h3 className="product-title" style={{color: name ? '#000' : '#f00'}}>
            {name || 'NO NAME'}
          </h3>
          <div className="product-type" style={{color: type ? '#000' : '#f00'}}>
            {type || 'NO TYPE'}
          </div>
        </div>

        <div className="product-body">
          <p className="product-desc" style={{color: desc ? '#000' : '#f00'}}>
            {desc || 'NO DESCRIPTION'}
          </p>
        </div>

        <div className="product-footer">
          <div className="product-details">
            <div className="price-stock">
              <span className="product-price">
                ${typeof price === 'number' ? price.toFixed(2) : 'NO PRICE'}
              </span>
              <span className="product-stock">
                Stock: {typeof stock === 'number' ? stock : 'NO STOCK'}
              </span>
            </div>
          </div>

          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={isInCart || !available || stock <= 0}
          >
            {isInCart ? 'In Cart' : 
             !available ? 'Not Available' :
             stock <= 0 ? 'Out of Stock' :
             'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product; 