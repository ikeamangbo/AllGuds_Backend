import React, { useEffect } from 'react';
import { useGlobalContext } from '../GlobalContext/GlobalContext';
import Product from './Product';
import './ProductList.css';

const ProductList = () => {
  const { state, fetchProducts } = useGlobalContext();
  const { products } = state;

  useEffect(() => {
    fetchProducts();
  }, []);

  console.log('Products in list:', products);

  return (
    <div className="product-list">
      {products.map(product => (
        <Product key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductList; 