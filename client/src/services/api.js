import api, { API_ENDPOINTS, productApi, orderApi, notificationApi } from '../config/api';
import { uploadImage } from '../config/cloudinary';
import axios from 'axios';

// Auth Service
export const loginUser = async (email, password) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    return response;
};

export const registerUser = async (userData) => {
    try {
        const response = await api.post(API_ENDPOINTS.SIGNUP, userData);
        const { data } = response.data;
        if (!data || !data.id || !data.token) {
            throw new Error('Invalid response from server');
        }
        return data;
    } catch (error) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        if (error.message) {
            throw new Error(error.message);
        }
        throw new Error('Registration failed. Please try again.');
    }
};

export const getUserProfile = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.PROFILE);
        return response.data;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

// Product Service
export const getProducts = async () => {
  try {
    const response = await productApi.get('/api/products');
    console.log('Raw API response:', response);
    
    // Validate the response structure
    if (!response.data?.data) {
      console.error('Invalid response structure:', response);
      throw new Error('Invalid response structure');
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getSellerProducts = async () => {
  try {
    const response = await productApi.get(API_ENDPOINTS.PRODUCTS_SELLER);
    return response.data;
  } catch (error) {
    console.error('Error fetching seller products:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await productApi.post('/api/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await productApi.put(`/api/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await productApi.delete(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const uploadProductImage = async (file) => {
  try {
    const imageUrl = await uploadImage(file, 'products');
    return { imageUrl };
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw error;
  }
};

export const searchProducts = async (query) => {
  try {
    console.log('Searching products with query:', query);
    const response = await productApi.get('/products/search', {
      params: { 
        name: query,  
        desc: query   
      }
    });
    console.log('Search response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Search error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    throw error;
  }
};

// Shopping Service
// export const getCart = async () => { ... }
// export const addToCart = async () => { ... }

export const getOrders = async () => {
    const response = await orderApi.get('/orders');
    return response.data;
};

export const createOrder = async (productId) => {
  try {
    const orderData = {
      productId,
      quantity: 1 // You might want to make this dynamic
    };

    const response = await orderApi.post('/orders/create', orderData);
    
    // Notify the notification service about the new order
    await notificationApi.post('/notify/order-created', {
      orderId: response.data.orderId,
      productId,
      quantity: 1
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateCartQuantity = async (productId, quantity) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!(user?.role?.toLowerCase() === 'buyer')) {
        throw new Error('Only buyers can update cart');
    }
    const response = await orderApi.patch(`${API_ENDPOINTS.CART}/${productId}`, { 
        customerId: user.id,
        quantity 
    });
    return response.data;
};

export const removeFromCart = async (productId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!(user?.role?.toLowerCase() === 'buyer')) {
        throw new Error('Only buyers can remove from cart');
    }
    const response = await orderApi.delete(`${API_ENDPOINTS.CART}/${productId}?customerId=${user.id}`);
    return response.data;
};

export const clearCart = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!(user?.role?.toLowerCase() === 'buyer')) {
        throw new Error('Only buyers can clear cart');
    }
    const response = await orderApi.delete(`${API_ENDPOINTS.CART}?customerId=${user.id}`);
    return response.data;
};