import React, { useContext } from "react";
import { ProductContext } from "./context/productContext";
import { FaTrash, FaPlus, FaMinus, FaShoppingBag } from 'react-icons/fa';
import "./Cart.css";

const Cart = () => {

  const{
    cartItems,
    getProductName,
    getProductPrice,
    handleDecrement,
    handleIncrement,
    handleDelete,
    totalPrice,
    getImage,
    handleOrder
  } = useContext(ProductContext);
  

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <FaShoppingBag className="empty-cart-icon" />
        <h2>Your Cart is Empty</h2>
        <p>Add items to your cart to see them here</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">Shopping Cart</h1>
      
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="item-image">
                <img src={getImage(item.productId)} alt={getProductName(item.productId)} />
              </div>
              
              <div className="item-details">
                <h3>{getProductName(item.productId)}</h3>
                <div className="item-price">₹{getProductPrice(item.productId, 1)}</div>
                
                <div className="item-controls">
                  <div className="quantity-control">
                    <button 
                      className="quantity-btn"
                      onClick={() => handleDecrement(item.productId)}
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => handleIncrement(item.productId)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(item.productId)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <div className="item-total">
                ₹{getProductPrice(item.productId, item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{totalPrice}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₹{totalPrice}</span>
          </div>
          <button
            className="checkout-btn"
            onClick={handleOrder}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
