import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createProduct, uploadProductImage } from '@/services/api';
import { toast } from 'react-toastify';
import './AddProductModal.css';

const AddProductModal = ({ onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    type: 'Electronics',
    stock: '',
    price: '',
    img: null,
    available: true
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value, files, type: inputType } = e.target;
    if (name === 'img') {
      setFormData(prev => ({
        ...prev,
        img: files[0]
      }));
    } else if (inputType === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First upload the image
      let imageUrl = '';
      if (formData.img) {
        const { imageUrl: uploadedUrl } = await uploadProductImage(formData.img);
        imageUrl = uploadedUrl;
      }

      // Create the product data
      const productData = {
        name: formData.name,
        desc: formData.desc,
        type: formData.type,
        stock: parseInt(formData.stock),
        price: parseFloat(formData.price),
        img: imageUrl,
        available: true,
        seller: user?.id
      };

      const response = await createProduct(productData);
      console.log('API Response:', response); // Let's see the response structure
      
      // Store in localStorage with proper data
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const newProduct = {
        id: Math.random().toString(), // Generate our own ID for now
        ...productData, // Use the data we already have
        img: imageUrl || 'https://placehold.co/600x400'
      };
      
      // Filter out any null values before pushing
      const validProducts = products.filter(p => p !== null && p !== undefined);
      validProducts.push(newProduct);
      
      console.log('Storing product in localStorage:', newProduct);
      console.log('All products being stored:', validProducts);
      
      localStorage.setItem('products', JSON.stringify(validProducts));

      toast.success('Product added successfully!');
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Image</label>
            <input
              type="file"
              name="img"
              onChange={handleChange}
              accept="image/*"
            />
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Home and Kitchen">Home and Kitchen</option>
              <option value="Books">Books</option>
              <option value="Sports">Sports</option>
            </select>
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
