import React from "react";
import { Link } from "gatsby";
import Layout from "../components/Layout";

const Category = ({ pageContext }) => {
  const { category, products } = pageContext;

  return (
    <Layout>
      <h1>Category: {category}</h1>
      <div>
        {products.map((product) => (
          <div key={product.id} style={{ marginBottom: "20px" }}>
            <Link to={`/product/${product.id}`}>
              <h2>{product.name}</h2>
            </Link>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Category;
