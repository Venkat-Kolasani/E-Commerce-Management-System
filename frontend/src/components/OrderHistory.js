import React, { useContext, useEffect, useState } from 'react';
import { ProductContext } from './context/productContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import './OrderHistory.css';

const OrderHistory = () => {
  const { userId } = useContext(ProductContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/orders/user/${userId}`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="order-history">
      <h2>Order History</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order.OrderId} className="order-card">
            <div className="order-header">
              <h3>Order #{order.OrderId}</h3>
              <span className="order-date">
                {new Date(order.OrderDate).toLocaleDateString()}
              </span>
            </div>
            <div className="order-details">
              <p><strong>Total Amount:</strong> ₹{order.OrderAmount}</p>
              <p><strong>Shipping Date:</strong> {new Date(order.ShippingDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {order.Status || 'Processing'}</p>
            </div>
            {order.items && order.items.length > 0 && (
              <div className="order-items">
                <h4>Items</h4>
                <div className="items-list">
                  {order.items.map((item, index) => (
                    <div key={index} className="item">
                      <p><strong>{item.ProductName}</strong> ({item.Brand})</p>
                      <p>Quantity: {item.Quantity}</p>
                      <p>Price: ₹{item.MRP}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default OrderHistory; 