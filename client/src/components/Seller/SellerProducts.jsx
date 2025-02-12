import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { productApi } from '@/config/api';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../common/ConfirmModal';
import EditProductModal from './EditProductModal';
import { updateProduct } from '@/services/api';
import './SellerProducts.css';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    console.log('Products from localStorage:', products);
    setProducts(products);
    setLoading(false);
  }, []);

  const handleEdit = (product) => {
    console.log('Editing product:', product);
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (formData) => {
    try {
      // Update in localStorage
      const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const updatedProducts = allProducts.map(p => 
        p.id === selectedProduct.id ? { ...p, ...formData } : p
      );
      
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      
      toast.success('Product updated successfully');
      setShowEditModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDelete = () => {
    if (!selectedProduct?.id) return;

    try {
      // Remove from localStorage
      const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const filteredProducts = allProducts.filter(p => p.id !== selectedProduct.id);
      
      localStorage.setItem('products', JSON.stringify(filteredProducts));
      setProducts(filteredProducts);
      
      toast.success('Product deleted successfully');
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const confirmDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  if (loading) {
    return <div className="seller-loading">Loading your products...</div>;
  }

  if (!user) {
    return <div className="seller-loading">Please login to view your products</div>;
  }

  return (
    <div className="seller-products">
      <h2>My Products</h2>
      {products.length === 0 ? (
        <div className="seller-no-products">
          <p>You haven't posted any products yet</p>
          <button className="seller-add-product-btn">Add Your First Product</button>
        </div>
      ) : (
        <div className="seller-products-grid">
          {products.map((product) => (
            <div key={product?.id || Math.random()} className="seller-product-card">
              <img 
                src={product?.img || 'https://placehold.co/600x400'} 
                alt={product?.name || 'Product'} 
                className="seller-product-image"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/600x400';
                  e.target.onerror = null;
                }}
              />
              <div className="seller-product-details">
                <h3>{product?.name || 'Unnamed Product'}</h3>
                <p>{product?.desc || 'No description available'}</p>
                <div className="seller-product-info">
                  <span className="seller-price">${product?.price || 0}</span>
                  <span className="seller-stock">Stock: {product?.stock || 0}</span>
                </div>
                <div className="seller-product-status">
                  <span className={`seller-status ${product?.available ? 'active' : 'inactive'}`}>
                    {product?.available ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
                <div className="seller-product-actions">
                  <button 
                    className="seller-edit-btn"
                    onClick={() => handleEdit(product)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button 
                    className="seller-delete-btn"
                    onClick={() => confirmDelete(product)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditProductModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleEditSubmit}
        product={selectedProduct}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete ${selectedProduct?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default SellerProducts;
