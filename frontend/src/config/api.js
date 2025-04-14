// API Configuration

// Base URL for API requests
export const API_BASE_URL = 'http://localhost:5001/api';

// API Endpoints
export const ENDPOINTS = {
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id) => `/products/${id}`,
  PRODUCTS_BY_CATEGORY: (categoryId) => `/products/category/${categoryId}`,
  
  // Users
  REGISTER: '/users/register',
  LOGIN: '/users/login',
  USER_PROFILE: (id) => `/users/profile/${id}`,
  
  // Cart
  CART: (userId) => `/cart/${userId}`,
  ADD_TO_CART: '/cart/add',
  UPDATE_CART: '/cart/update',
  REMOVE_FROM_CART: '/cart/remove',
  CLEAR_CART: (userId) => `/cart/clear/${userId}`,
  
  // Orders
  CREATE_ORDER: '/orders',
  USER_ORDERS: (userId) => `/orders/user/${userId}`,
  ORDER_DETAILS: (id) => `/orders/${id}`,
  
  // Admin
  ADMIN_TABLES: '/admin/tables',
  ADMIN_TABLE: (tableName) => `/admin/table/${tableName}`,
  ADMIN_TABLE_SCHEMA: (tableName) => `/admin/schema/${tableName}`,
  ADMIN_TABLE_UPDATE: (tableName) => `/admin/table/${tableName}`,
  ADMIN_TABLE_DELETE: (tableName, id) => `/admin/table/${tableName}/${id}`,
  ADMIN_SALES_BY_CATEGORY: '/admin/sales/category',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_SELLERS: '/admin/sellers'
};

// Helper function for making API requests
export const fetchApi = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };
    
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
