import React, { useContext } from "react";
import { navigate } from "gatsby";
import { CartContext } from "../components/CartContext";
import Layout from "../components/Layout";

const Product = ({ pageContext }) => {
  const { id, name, description, price, images } = pageContext;
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = () => {
    addToCart({ id, name, price, quantity: 1 });
    alert("Added to cart");
  };

  const handleBuyNow = () => {
    addToCart({ id, name, price, quantity: 1 });
    navigate("/checkout");
  };

  return (
    <Layout>
      <h1>{name}</h1>
      {images &&
        images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`${name} - ${index}`}
            style={{ maxWidth: "100%" }}
          />
        ))}
      <p>{description}</p>
      <p>Price: ${price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <button onClick={handleBuyNow}>Buy Now</button>
    </Layout>
  );
};

export default Product;
