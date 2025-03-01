exports.createPages = async ({ actions }) => {
  const { createPage } = actions;
  // Example static product data
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

  products.forEach((product) => {
    createPage({
      path: `/product/${product.id}`,
      component: require.resolve("./src/templates/product.js"),
      context: product,
    });
  });
};
