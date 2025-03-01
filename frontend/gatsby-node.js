const fetch = require("node-fetch");
require("dotenv").config();

exports.createPages = async ({ actions }) => {
  const { createPage } = actions;
  const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3000";

  // Fetch products from the backend API
  const response = await fetch(`${backendUrl}/api/products`);
  if (!response.ok) {
    console.error("Failed to fetch products from API");
    return;
  }
  const products = await response.json();

  products.forEach((product) => {
    createPage({
      path: `/product/${product.id}`,
      component: require.resolve("./src/templates/product.js"),
      context: product,
    });
  });

  // Optionally, create category pages
  const categories = [...new Set(products.map((p) => p.category))];
  categories.forEach((category) => {
    createPage({
      path: `/category/${category.toLowerCase()}`,
      component: require.resolve("./src/templates/category.js"),
      context: { category },
    });
  });
};
