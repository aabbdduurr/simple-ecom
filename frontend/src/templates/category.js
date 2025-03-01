import React from "react";
import { Link } from "gatsby";

const CategoryPage = ({ pageContext }) => {
  const { categoryName, products, currentPage, totalPages } = pageContext;

  return (
    <div>
      <h1>Category: {categoryName}</h1>
      <div className="product-list">
        {products.map((product) => (
          <div key={product.id} className="product-item">
            <h3>
              <Link to={`/product/${product.id}`}>{product.name}</Link>
            </h3>
            <p>{product.description}</p>
            <p>${product.price}</p>
          </div>
        ))}
      </div>

      {/* Pagination Links */}
      <div className="pagination">
        {currentPage > 1 && (
          <Link
            to={
              currentPage === 2
                ? `/category/${categoryName.toLowerCase()}`
                : `/category/${categoryName.toLowerCase()}/page/${
                    currentPage - 1
                  }`
            }
          >
            Previous
          </Link>
        )}

        {currentPage < totalPages && (
          <Link
            to={`/category/${categoryName.toLowerCase()}/page/${
              currentPage + 1
            }`}
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
