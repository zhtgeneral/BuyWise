import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/ProductGrid.css";

export default function ProductGrid() {
  const [products, setProducts] = useState([]);

  // test products for now, delete this later
  useEffect(() => {
    fetch("http://localhost:4000/test_products")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Something went wrong getting the test products");
        }
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => console.error("Get error:", err));
  }, []);

  return (
    <div className="product-list">
      {products.map((product) => (
        <div className="product-card" key={product.id}>
          <img src={product.image} alt={product.title} />
          <div className="product-container">
            <h4>{product.title}</h4>
            <p>Price: ${product.price}</p>
            <Link to={product.url} className="product-link">
              Link to Product
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
