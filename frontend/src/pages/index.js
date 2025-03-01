import React from "react";
import { Link } from "gatsby";
import Layout from "../components/Layout";

// For demo purposes, using static data. In production, you might fetch from your API.
const products = [
  {
    id: 1,
    name: "Product One",
    description: "Description for Product One",
    price: 29.99,
    images: ["https://via.placeholder.com/400?text=Product+One+Image+1"],
  },
  {
    id: 2,
    name: "Product Two",
    description: "Description for Product Two",
    price: 49.99,
    images: ["https://via.placeholder.com/400?text=Product+Two+Image+1"],
  },
];

const IndexPage = () => (
  <Layout>
    <h1>Products</h1>
    {products.map((product) => (
      <div
        key={product.id}
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h2>{product.name}</h2>
        <img
          src={product.images[0]}
          alt={product.name}
          style={{ maxWidth: "100%" }}
        />
        <p>{product.description}</p>
        <p>Price: ${product.price}</p>
        <Link to={`/product/${product.id}`}>View Details</Link>
      </div>
    ))}
  </Layout>
);

export default IndexPage;
