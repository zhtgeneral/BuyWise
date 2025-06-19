import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import "../styles/ProductGrid.css";
import { selectProducts } from "../libs/features/productsSlice";

export default function ProductGrid({
  showProduct
}) {
  const products = useSelector(selectProducts);

  if (!showProduct) {
    return (
      <></>
    )
  }
  
  return (
    <>
      <h3>Recommended Products</h3>    
      <div className="product-list">
        {products?.map((product) => (
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
    </>
  );
}
