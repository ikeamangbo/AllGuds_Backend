import React, { useEffect } from 'react';
import { useGlobalContext } from '../GlobalContext/GlobalContext';
import Product from '../Home/Products/Product/Product';
import './Products.css';

const Products = () => {
  const { state, fetchProducts } = useGlobalContext();
  
  useEffect(() => {
    fetchProducts();
  }, []);

  console.log('Products Component - state:', state);
  console.log('Products Component - products:', state.products);

  return (
    <div className="products-container">
      {state.products && state.products.map((product) => {
        // Map the backend fields to frontend expected fields
        const mappedProduct = {
          id: product._id,
          title: product.name,
          description: product.desc,
          price: product.price,
          imageUrl: product.img,
          stockQuantity: product.stock,
          sellerId: product.seller,
          available: product.available
        };
        
        console.log('Mapped product:', mappedProduct);
        return <Product key={mappedProduct.id} product={mappedProduct} />;
      })}
    </div>
  );
};

export default Products;
