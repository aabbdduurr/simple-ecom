require("dotenv").config();

exports.createPages = async ({ actions }) => {
  const { createPage } = actions;
  const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3000";
  const fetch = await import("node-fetch").then((mod) => mod.default);

  // Fetch all categories
  const categoryRes = await fetch(`${backendUrl}/api/categories`);
  if (!categoryRes.ok) {
    console.error("Failed to fetch categories");
    return;
  }
  const categories = await categoryRes.json();
  console.log(`Fetched ${categories.length} categories`);

  for (const category of categories) {
    console.log(`Fetching products for category: ${category.name}`);

    // Fetch products for this category
    const productRes = await fetch(
      `${backendUrl}/api/categories/${category.id}/products`
    );
    if (!productRes.ok) {
      console.error(`Failed to fetch products for category: ${category.name}`);
      continue;
    }
    const products = await productRes.json();
    console.log(
      `Fetched ${products.length} products for category ${category.name}`
    );

    // Create paginated category pages (fragments)
    const pageSize = 10;
    const totalPages = Math.ceil(products.length / pageSize);

    for (let i = 0; i < totalPages; i++) {
      const paginatedProducts = products.slice(
        i * pageSize,
        (i + 1) * pageSize
      );
      console.log(`Creating category page ${i + 1} for ${category.name}`);

      createPage({
        path:
          i === 0
            ? `/category/${category.name.toLowerCase()}` // First page without number
            : `/category/${category.name.toLowerCase()}/page/${i + 1}`,
        component: require.resolve("./src/templates/category.js"),
        context: {
          categoryId: category.id,
          categoryName: category.name,
          products: paginatedProducts,
          currentPage: i + 1,
          totalPages,
        },
      });
    }

    // Create product pages for each product
    products.forEach((product) => {
      console.log(`Creating product page: ${product.id}`);

      createPage({
        path: `/product/${product.id}`,
        component: require.resolve("./src/templates/product.js"),
        context: product,
      });
    });
  }
};
