import { useGlobalContext } from '@/components/GlobalContext/GlobalContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import './Product.css';

const Product = ({ product }) => {
  const { addToCart } = useGlobalContext();
  const { user } = useAuth();
  
  console.log('Raw product data:', product);

  if (!product) return null;

  const {
    id,
    title,
    description,
    price,
    imageUrl,
    stockQuantity,
    available = true
  } = product;

  const isBuyer = user?.role?.toUpperCase() === 'BUYER';

  const handleAddToCart = () => {
    if (!isBuyer) return;

    const cartItem = {
      productId: id,
      name: title,
      price,
      quantity: 1,
      image: imageUrl
    };
    
    console.log('Adding to cart:', cartItem);
    addToCart(cartItem)
      .then(() => toast.success('Added to cart'))
      .catch(err => toast.error('Failed to add to cart'));
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img 
          src={imageUrl} 
          alt={title || 'Product Image'} 
          onError={(e) => {
            console.log('Image load error, using placeholder');
            e.target.src = "https://placehold.co/600x400";
          }}
        />
      </div>
      <div className="product-info">
        <h3>{title || 'Untitled Product'}</h3>
        <p>{description || 'No description available'}</p>
        <div className="product-details">
          <span className="price">${Number(price).toFixed(2)}</span>
          <span className="stock">Stock: {stockQuantity || 0}</span>
        </div>
        {isBuyer && (
          <button 
            onClick={handleAddToCart} 
            className="add-to-cart"
            disabled={!available || stockQuantity <= 0}
          >
            {!available ? 'Not Available' : 
             stockQuantity <= 0 ? 'Out of Stock' : 
             'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Product;
