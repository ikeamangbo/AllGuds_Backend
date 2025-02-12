import { createContext, useContext, useReducer, useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as api from '../../services/api';
import axios from 'axios';

const GlobalContext = createContext();

const saveCartToLocalStorage = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

const initialState = {
  products: [],
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  cartQuantity: JSON.parse(localStorage.getItem('cart') || '[]').reduce(
    (total, item) => total + item.quantity, 
    0
  ),
  orders: [],
  loading: false,
  error: null,
  user: null
};

const reducer = (state, action) => {
  let newState;
  switch (action.type) {
    case "GET_PRODUCTS":
      return {
        ...state,
        products: Array.isArray(action.payload) ? action.payload : []
      };
    case "GET_CART":
      console.log('Reducer: Handling GET_CART action', action.payload);
      newState = {
        ...state,
        cart: action.payload.items || [],
        cartQuantity: action.payload.items ? 
          action.payload.items.reduce((total, item) => total + item.quantity, 0) : 0
      };
      console.log('Reducer: New state after GET_CART', newState);
      localStorage.setItem('cart', JSON.stringify(newState.cart));
      return newState;
    case "ADD_TO_CART":
      newState = { 
        ...state, 
        cart: action.payload.items,
        cartQuantity: action.payload.items.reduce((total, item) => total + item.quantity, 0)
      };
      saveCartToLocalStorage(newState.cart);
      return newState;
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_CART_QUANTITY":
      return {
        ...state,
        cartQuantity: action.payload
      };
    case "UPDATE_CART_ITEM":
      const updatedCart = state.cart.map(item => 
        item.productId === action.payload.productId 
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      newState = {
        ...state,
        cart: updatedCart,
        cartQuantity: updatedCart.reduce((total, item) => total + item.quantity, 0)
      };
      saveCartToLocalStorage(newState.cart);
      return newState;
    case "REMOVE_CART_ITEM":
      const filteredCart = state.cart.filter(item => item.productId !== action.payload);
      newState = {
        ...state,
        cart: filteredCart,
        cartQuantity: filteredCart.reduce((total, item) => total + item.quantity, 0)
      };
      saveCartToLocalStorage(newState.cart);
      return newState;
    default:
      return state;
  }
};

export const GlobalContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Add a Set to track removed items
  const [removedItems] = useState(new Set());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('user'));
      dispatch({ type: "SET_USER", payload: user });
      
      // Temporarily disable cart fetching
      dispatch({ type: "GET_CART", payload: { items: [] } });
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.getProducts();
      console.log('Raw API response:', response);
      
      if (response.data && Array.isArray(response.data.data)) {
        const products = response.data.data;
        console.log('Products from backend:', products);
        dispatch({ type: 'SET_PRODUCTS', payload: products });
      } else {
        console.error('Invalid products data structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const getCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const cartResponse = await axios.get('http://localhost:3002/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Raw cart response:', cartResponse.data);

      if (cartResponse.data && cartResponse.data.items) {
        const cartItemsWithDetails = await Promise.all(
          cartResponse.data.items.map(async (item) => {
            try {
              // Debug the item structure
              console.log('Processing cart item:', item);

              // Check for nested productId object
              const productId = item.productId?._id || item.productId;
              
              if (!productId) {
                console.log('Invalid item - missing productId:', item);
                // Remove invalid item from cart
                try {
                  await axios.delete(`http://localhost:3002/api/cart/remove/${item._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  console.log('Removed invalid item from cart:', item._id);
                } catch (removeError) {
                  console.error('Failed to remove invalid item:', removeError);
                }
                return null;
              }

              // Fetch product details
              const productResponse = await axios.get(
                `http://localhost:3002/api/products/${productId}`
              );
              
              // Handle nested data structure
              const product = productResponse.data.data || productResponse.data;
              console.log('Product details:', product);

              if (!product) {
                console.log('Product not found:', productId);
                return null;
              }

              // Map the fields correctly
              return {
                _id: item._id,
                productId: productId,
                quantity: item.quantity,
                name: product.name,
                price: parseFloat(product.price),
                image: product.img,
                description: product.desc,
                stock: product.stock,
                available: product.available
              };
            } catch (error) {
              console.error(`Error processing cart item:`, error);
              return null;
            }
          })
        );

        // Filter out null items
        const finalCartItems = cartItemsWithDetails.filter(item => item !== null);
        console.log('Final processed cart items:', finalCartItems);

        // if (finalCartItems.length < cartResponse.data.items.length) {
        //   toast.info('Some invalid items were removed from your cart');
        // }

        dispatch({ 
          type: "GET_CART", 
          payload: {
            items: finalCartItems,
            cartQuantity: finalCartItems.length
          }
        });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      dispatch({ type: "GET_CART", payload: { items: [], cartQuantity: 0 } });
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      // Check if item already in cart
      const existingItem = state.cart.find(item => 
        item.productId === (productId?._id || productId)
      );
      
      if (existingItem) {
        toast.info('Item is already in your cart');
        return false; // Return false to indicate item wasn't added
      }

      // Extract ID if it's an object
      const id = productId?._id || productId;

      // Verify product exists before adding
      const productResponse = await axios.get(
        `http://localhost:3002/api/products/${id}`
      );

      const product = productResponse.data.data || productResponse.data;
      if (!product) {
        toast.error('Product not found');
        return false;
      }

      // Create new item
      const newItem = {
        _id: Date.now().toString(),
        productId: id,
        quantity: quantity,
        name: product.name,
        price: parseFloat(product.price),
        image: product.img,
        description: product.desc,
        stock: product.stock,
        available: product.available
      };

      // Update state
      dispatch({
        type: "ADD_TO_CART",
        payload: {
          items: [...state.cart, newItem],
        }
      });

      toast.success('Added to cart successfully');
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
      return false;
    }
  };

  const updateCartItemQuantity = async (productId, newQuantity) => {
    try {
      // Validate quantity
      if (newQuantity < 1) return;

      // Find item and check stock limit
      const item = state.cart.find(item => item.productId === productId);
      if (item && item.stock && newQuantity > item.stock) {
        toast.warning(`Only ${item.stock} items available`);
        return;
      }

      // Update local state
      dispatch({
        type: "UPDATE_CART_ITEM",
        payload: { productId, quantity: newQuantity }
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update quantity');
    }
  };

  const addQuantity = (productId) => {
    const item = state.cart.find(item => item.productId === productId);
    if (item) {
      updateCartItemQuantity(productId, item.quantity + 1);
    }
  };

  const reduceQuantity = (productId) => {
    const item = state.cart.find(item => item.productId === productId);
    if (item && item.quantity > 1) {
      updateCartItemQuantity(productId, item.quantity - 1);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      // Update local state first
      dispatch({ type: "REMOVE_CART_ITEM", payload: productId });

      // Try to sync with backend
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axios.delete(`http://localhost:3002/api/cart/remove/${productId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (error) {
          console.error('Backend sync failed:', error);
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.delete(`http://localhost:3002/api/cart/clear`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      // Clear local storage
      localStorage.removeItem('cart');
      
      // Update state with empty cart
      dispatch({ 
        type: "GET_CART", 
        payload: { 
          items: [], 
          cartQuantity: 0 
        } 
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const createOrder = async () => {
    try {
      const response = await api.createOrder();
      if (response) {
        await clearCart();
        toast.success('Order placed successfully!');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create order';
      toast.error(errorMessage);
    }
  };

  // Load cart on mount and when user changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCart();
    }
  }, []);

  const value = {
    state,
    fetchProducts,
    getCart,
    addToCart,
    addQuantity,
    reduceQuantity,
    removeFromCart,
    clearCart,
    createOrder,
    updateCartItemQuantity
  };

  // Add back the products fetch effect
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalContextProvider");
  }
  return context;
};

export { useGlobalContext };
