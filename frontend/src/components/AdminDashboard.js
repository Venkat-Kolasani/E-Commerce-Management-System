import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';

const AdminDashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch sales by category
      const categoryResponse = await axios.get(`${API_BASE_URL}/admin/sales/category`);
      setCategoryData(categoryResponse.data);

      // Fetch product stock levels
      const productResponse = await axios.get(`${API_BASE_URL}/admin/products/stock`);
      setProductData(productResponse.data);

      // Fetch monthly sales data
      const salesResponse = await axios.get(`${API_BASE_URL}/admin/sales/monthly`);
      setSalesData(salesResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const renderOverview = () => (
    <div className="row">
      <div className="col-md-6 mb-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Sales by Category</h5>
            <PieChart width={400} height={300}>
              <Pie
                data={categoryData}
                cx={200}
                cy={150}
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>

      <div className="col-md-6 mb-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Product Stock Levels</h5>
            <BarChart width={400} height={300} data={productData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock" fill="#8884d8" />
            </BarChart>
          </div>
        </div>
      </div>

      <div className="col-md-12">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Monthly Sales Trend</h5>
            <LineChart width={800} height={300} data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" />
            </LineChart>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
        </li>
      </ul>

      {activeTab === 'overview' && renderOverview()}
    </div>
  );
};

export default AdminDashboard;
