import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../../config/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editedValues, setEditedValues] = useState({});

  // Fetch list of tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        console.log('Fetching tables from:', `${API_BASE_URL}${ENDPOINTS.ADMIN_TABLES}`);
        const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.ADMIN_TABLES}`);
        console.log('Tables response:', response.data);
        setTables(response.data);
        if (response.data.length > 0) {
          console.log('Setting selected table to:', response.data[0]);
          setSelectedTable(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };
    fetchTables();
  }, []);

  // Fetch table data when selected table changes
  useEffect(() => {
    if (selectedTable) {
      fetchTableData();
    }
  }, [selectedTable]);

  const fetchTableData = async () => {
    try {
      console.log('Fetching data for table:', selectedTable);
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.ADMIN_TABLE(selectedTable)}`);
      console.log('Table data response:', response.data);
      setTableData(response.data);
    } catch (error) {
      console.error('Error fetching table data:', error);
    }
  };

  const handleEdit = (row) => {
    setEditingRow(row);
    setEditedValues(row);
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_BASE_URL}${ENDPOINTS.ADMIN_TABLE_UPDATE(selectedTable)}`, {
        id: editingRow.id,
        data: editedValues
      });
      setEditingRow(null);
      fetchTableData();
    } catch (error) {
      console.error('Error updating row:', error);
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm('Are you sure you want to delete this row?')) {
      try {
        await axios.delete(`${API_BASE_URL}${ENDPOINTS.ADMIN_TABLE_DELETE(selectedTable, row.id)}`);
        fetchTableData();
      } catch (error) {
        console.error('Error deleting row:', error);
      }
    }
  };

  const handleInputChange = (column, value) => {
    setEditedValues(prev => ({
      ...prev,
      [column]: value
    }));
  };

  if (tables.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="table-selector">
        <label>Select Table:</label>
        <select 
          value={selectedTable || ''} 
          onChange={(e) => setSelectedTable(e.target.value)}
        >
          <option value="">Select a table...</option>
          {tables.map((table, index) => (
            <option key={`${table}-${index}`} value={table}>{table}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        {tableData.length > 0 ? (
          <table>
            <thead>
              <tr>
                {Object.keys(tableData[0]).map(column => (
                  <th key={column}>{column}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  {Object.entries(row).map(([column, value]) => (
                    <td key={column}>
                      {editingRow === row ? (
                        <input
                          type="text"
                          value={editedValues[column] || ''}
                          onChange={(e) => handleInputChange(column, e.target.value)}
                        />
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                  <td className="actions">
                    {editingRow === row ? (
                      <>
                        <button onClick={handleSave}>Save</button>
                        <button onClick={() => setEditingRow(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(row)}>Edit</button>
                        <button onClick={() => handleDelete(row)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No data available for the selected table</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
