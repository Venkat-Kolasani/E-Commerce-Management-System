import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import './Product.css';
import { ProductContext } from "./context/productContext";
import { API_BASE_URL } from "../config/api";
import axios from 'axios';

const Product = () => {
  const { products, handleIncrement } = useContext(ProductContext);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Filter products based on search input and category
  const filterProducts = products.filter((item) => {
    if (!item.ProductName || !item.MRP) return false;
    
    const matchesSearch = 
      item.ProductName.toLowerCase().includes(search.toLowerCase()) ||
      item.MRP.toString().includes(search) ||
      (item.Brand && item.Brand.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = 
      selectedCategory === "all" || 
      item.CategoryId === parseInt(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Product Catalog</h1>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        marginBottom: "20px"
      }}>
        <div>
          <span style={{ marginRight: "10px" }}>Category: </span>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: "5px", minWidth: "150px" }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.CategoryId} value={cat.CategoryId}>
                {cat.CategoryName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span style={{ marginRight: "10px" }}>Search: </span>
          <input
            type="text"
            placeholder="Search by name, price, or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "5px", width: "300px" }}
          />
        </div>
      </div>

      <br/>
      <br/>
      <div className="products-container">
        {(search === "" ? products : filterProducts).map((product) => (
          <div key={product.ProductId} className="product-card">
            <img 
              src={product.ImageUrl || '/images/placeholder.jpg'} 
              alt={product.ProductName} 
              className="product-image"
              onError={(e) => {e.target.src = '/images/placeholder.jpg'}}
            />
            <div className="product-details">
              <div><strong>ID:</strong> {product.ProductId}</div>
              <div><strong>NAME:</strong> {product.ProductName}</div>
              <div><strong>BRAND:</strong> {product.Brand}</div>
              <div><strong>PRICE:</strong> ₹{product.MRP}</div>
              <div><strong>STOCK:</strong> {product.Stock} available</div>
            </div>
            <div className="product-actions">
              <button>
                <Link to={`/productDetails/${product.ProductId}`} style={{ textDecoration: 'none', color: '#000' }}>View Details</Link>
              </button>
              <button onClick={() => handleIncrement(product.ProductId)} style={{ backgroundColor: 'orange' }}>Add To Cart</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Product;
