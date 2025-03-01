import React, { useContext, useState } from "react";
import Layout from "../components/Layout";
import { CartContext } from "../components/CartContext";

const CheckoutPage = () => {
  const { cart, clearCart } = useContext(CartContext);
  const [identifier, setIdentifier] = useState("");
  const [orderResponse, setOrderResponse] = useState(null);

  const handleCheckout = async () => {
    if (!identifier) {
      alert("Please enter your phone or email for checkout.");
      return;
    }
    // Call the backend checkout endpoint (which creates an order from the cart)
    const response = await fetch("http://localhost:3000/api/orders/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });
    const data = await response.json();
    if (data.success) {
      clearCart();
      alert("Order placed successfully! Order ID: " + data.orderId);
    } else {
      alert("Order failed: " + data.error);
    }
    setOrderResponse(data);
  };

  return (
    <Layout>
      <h1>Checkout</h1>
      <div>
        <label>Phone or Email:</label>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
      </div>
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <li key={item.id}>
              {item.name} - ${item.price} x {item.quantity}
            </li>
          ))}
        </ul>
      )}
      <button onClick={handleCheckout}>Place Order</button>
      {orderResponse && <pre>{JSON.stringify(orderResponse, null, 2)}</pre>}
    </Layout>
  );
};

export default CheckoutPage;
