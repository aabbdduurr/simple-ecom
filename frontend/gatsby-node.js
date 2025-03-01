exports.createPages = async ({ actions }) => {
  const { createPage } = actions;

  const products = [
    {
      id: 1,
      name: "Product One",
      description: "Description for Product One",
      price: 29.99,
      category: "Electronics",
      images: ["https://via.placeholder.com/400?text=Product+One+Image+1"],
    },
    {
      id: 2,
      name: "Product Two",
      description: "Description for Product Two",
      price: 49.99,
      category: "Books",
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
