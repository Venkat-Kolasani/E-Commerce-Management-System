import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import Navigation from './components/Navigation';
import Product from './components/Product';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import ProductDetails from './components/ProductDetails';
import AdminDashboard from './components/admin/AdminDashboard';
import Cart from './components/cart';
import OrderHistory from './components/OrderHistory';
import { ProductProvider } from './components/context/productContext'; 

function App() {
  return (
    <BrowserRouter>
      <ProductProvider>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Product />} />
              <Route path="/product" element={<Product />} />
              <Route path="/productDetails/:id" element={<ProductDetails />} />
              <Route path='/cartItems' element={<Cart />}/>
              <Route path='/orders' element={<OrderHistory />}/>
              <Route path='/admin' element={<AdminDashboard />}/>
            </Routes>
          </main>
        </div>
      </ProductProvider>
    </BrowserRouter>
  );
}

export default App;
