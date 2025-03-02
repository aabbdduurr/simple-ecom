import React, { useContext } from "react";
import Layout from "../components/Layout";
import { CartContext } from "../components/CartContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    navigate("/checkout");
  };

  return (
    <Layout>
      <h1>Your Cart</h1>
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
      <button onClick={handleProceedToCheckout}>Proceed to Checkout</button>
    </Layout>
  );
};

export default Cart;
