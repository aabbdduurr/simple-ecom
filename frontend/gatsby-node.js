require("dotenv").config();

exports.createPages = async ({ actions }) => {
  const { createPage } = actions;
  const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3000";

  // Dynamically import node-fetch
  const fetch = await import("node-fetch").then((mod) => mod.default);

  // Fetch products from the backend API
  const response = await fetch(`${backendUrl}/api/products`);
  if (!response.ok) {
    console.error("Failed to fetch products from API");
    return;
  }
  const products = await response.json();

  console.log(`Fetched ${products.length} products`);

  products.forEach((product) => {
    console.log(`Creating page for product: ${product.id}`);
    createPage({
      path: `/product/${product.id}`,
      component: require.resolve("./src/templates/product.js"),
      context: product,
    });
  });

  // Create category pages
  const categories = [...new Set(products.map((p) => p.category))];
  categories.forEach((category) => {
    console.log(`Creating page for category: ${category}`);
    const categoryProducts = products.filter((p) => p.category === category);
    createPage({
      path: `/category/${category.toLowerCase()}`,
      component: require.resolve("./src/templates/category.js"),
      context: { category, products: categoryProducts },
    });
  });
};
