import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ProductContext } from "./context/productContext";

const Navbar = () => {
  const { totalCart } = useContext(ProductContext);

  return (
    <div>
      <div style={{ marginTop: "10px" }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>E-Commerce Management System</h1>
      </div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div
          className="container-fluid"
          style={{ backgroundColor: "lightgreen" }}
        >
          <Link className="navbar-brand" to="/">
            <b>ReactStore</b>
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
                  Cart <span className="badge bg-secondary">{totalCart}</span>
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