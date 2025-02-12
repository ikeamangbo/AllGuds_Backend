import React, { useEffect } from 'react';
import { useGlobalContext } from '@/components/GlobalContext/GlobalContext';
import Product from './Product/Product';
import './Products.css';

const Products = ({ searchQuery }) => {
  const { state, fetchProducts } = useGlobalContext();

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search query
  const filteredProducts = state.products?.filter(product => 
    !searchQuery || 
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.desc?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('Products before mapping:', filteredProducts);

  return (
    <div className="products-grid">
      {filteredProducts?.map(product => {
        // Map the backend data structure to the frontend structure
        const mappedProduct = {
          id: product._id,
          title: product.name,        // Changed from undefined
          description: product.desc,   // Changed from undefined
          price: product.price,
          imageUrl: product.img,      // Changed from undefined
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
