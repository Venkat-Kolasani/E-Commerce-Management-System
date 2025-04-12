import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ProductContext } from "./context/productContext";

const Navbar = () => {
  const { totalCart } = useContext(ProductContext);

  return (
    <div>
      <div style={{ marginTop: "10px" }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '30px', 
          background: 'linear-gradient(45deg, #FF9933 15%, #FFFFFF 50%, #138808 85%)',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ 
            margin: 0,
            fontFamily: 'Righteous, cursive',
            fontSize: '2.5rem',
            color: '#1a237e',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)'
          }}>IndiaKart</h1>
          <p style={{ 
            margin: '5px 0 0 0',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '1.2rem',
            color: '#333',
            fontWeight: '500'
          }}>Your One Stop Shop</p>
        </div>
      </div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div
          className="container-fluid"
          style={{ 
            background: 'linear-gradient(45deg, #FF9933, #FFFFFF, #138808)', 
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <Link className="navbar-brand" to="/">
            <b style={{ 
              fontFamily: 'Righteous, cursive',
              background: 'linear-gradient(45deg, #FF9933, #138808)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.4rem',
              letterSpacing: '1px'
            }}>IndiaKart</b>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/">Products</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/cartItems">
                  Cart <span className="badge">{totalCart}</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/orders">Orders</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin">Admin Dashboard</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;