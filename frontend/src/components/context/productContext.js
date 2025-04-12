import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [userId, setUserId] = useState("1");
  const [totalCart, setTotalCart] = useState(0);
  const [user, setUser] = useState({ id: "1", firstName: "Default", lastName: "User" });
  const [products, setProducts] = useState([]);
  const [cartId, setCartId] = useState();
  const [userCart, setUserCart] = useState();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Store the userId in session storage for persistence
  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      sessionStorage.setItem("userId", userId);
    }
  }, []);

  // Fetch all data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, cartRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/products`),
          axios.get(`${API_BASE_URL}/cart/${userId}`)
        ]);

        setProducts(productsRes.data);
        setUserCart(cartRes.data);
        setCartId(cartRes.data.cartId);
        setCartItems(cartRes.data.items || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Update cart totals when cart items change
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const { totalItems, totalAmount } = cartItems.reduce(
        (acc, item) => ({
          totalItems: acc.totalItems + item.Quantity,
          totalAmount: acc.totalAmount + (item.Price * item.Quantity)
        }),
        { totalItems: 0, totalAmount: 0 }
      );
      setTotalCart(totalItems);
      setTotalPrice(totalAmount);
    } else {
      setTotalCart(0);
      setTotalPrice(0);
    }
  }, [cartItems]);

  // Helper functions for product data
  const getImage = (id) => {
    const product = products.find((item) => item.ProductId === parseInt(id));
    // Fallback to a placeholder image if product not found or no image available
    return product ? product.ImageURL : "https://placehold.co/200x200?text=No+Image";
  };

  const getProductName = (id) => {
    const product = products.find((item) => item.ProductId === parseInt(id));
    return product ? product.ProductName : "Product Not Found";
  };

  const getProductPrice = (id, quantity) => {
    const product = products.find((item) => item.ProductId === parseInt(id));
    return product ? product.MRP * quantity : 0;
  };

  // Cart operations
  const handleIncrement = async (id) => {
    const productId = parseInt(id);
    const currentItem = cartItems.find(item => item.ProductId === productId);
    
    try {
      if (currentItem) {
        // If item exists in cart, update quantity
        await axios.put(`${API_BASE_URL}/cart/update`, {
          userId,
          productId,
          quantity: currentItem.Quantity + 1
        });
      } else {
        // If item doesn't exist, add it to cart
        await axios.post(`${API_BASE_URL}/cart/add`, {
          userId,
          productId,
          quantity: 1
        });
      }
      
      // Fetch updated cart
      const cartRes = await axios.get(`${API_BASE_URL}/cart/${userId}`);
      setCartItems(cartRes.data.items || []);
      
    } catch (err) {
      console.error("Error updating cart:", err);
      alert(err.response?.data?.message || "Failed to add item to cart. Please try again.");
    }
  };

  const handleDecrement = (id) => {
    const productId = parseInt(id);
    const currentItem = cartItems.find(item => item.ProductId === productId);
    
    if (!currentItem || currentItem.Quantity <= 1) {
      return; // Don't decrement below 1
    }
    
    axios
      .put(`${API_BASE_URL}/cart/update`, {
        userId,
        productId,
        quantity: currentItem.Quantity - 1
      })
      .then(() => {
        // Update cart items locally
        const updatedCartItems = cartItems.map((item) =>
          item.ProductId === productId ? { ...item, Quantity: item.Quantity - 1 } : item
        );
        setCartItems(updatedCartItems);
      })
      .catch((err) => console.log(err));
  };

  const handleDelete = (id) => {
    const productId = parseInt(id);
    
    axios
      .delete(`${API_BASE_URL}/cart/remove`, {
        data: { userId, productId }
      })
      .then(() => {
        // Update cart items locally
        const updatedCartItems = cartItems.filter((item) => item.ProductId !== productId);
        setCartItems(updatedCartItems);
      })
      .catch((err) => console.log(err));
  };

  const handleOrder = () => {
    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }
    
    axios
      .post(`${API_BASE_URL}/orders`, {
        userId,
        paymentMode: "Credit Card" // Default payment method
      })
      .then((res) => {
        alert(`Order placed successfully! Order ID: ${res.data.orderId}`);
        // Clear cart after successful order
        setCartItems([]);
        setTotalCart(0);
        setTotalPrice(0);
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to place order. Please try again.");
      });
  };

  return (
    <ProductContext.Provider
      value={{
        user,
        setUser,
        userId,
        setUserId,
        products,
        setProducts,
        cartItems,
        setCartItems,
        getProductName,
        getProductPrice,
        handleIncrement,
        handleDecrement,
        handleDelete,
        totalCart,
        totalPrice,
        handleOrder,
        getImage,
        isLoading,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};