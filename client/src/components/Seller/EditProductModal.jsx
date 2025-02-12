import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './EditProductModal.css';

const EditProductModal = ({ isOpen, onClose, onSubmit, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    type: '',
    stock: '',
    price: '',
    available: true
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        desc: product.desc || '',
        type: product.type || 'Electronics',
        stock: product.stock || '',
        price: product.price || '',
        available: product.available ?? true
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Product</h2>
        <form onSubmit={handleSubmit}>
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
            <button type="submit" className="save-btn">Save Changes</button>
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal; 