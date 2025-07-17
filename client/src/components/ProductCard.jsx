
import { Link } from "react-router-dom";

export default function ProductCard({
  product
}) {
  return (
    <Link 
      target="_blank" 
      to={product.url} 
      className="product-card" 
      style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <img src={product.image} alt={product.title} />
        <div className="product-container">
          <h4>{product.title}</h4>
          <p>Price: ${product.price}</p>
          <Link target="_blank" to={product.url} className="product-link">
            Link to Product
          </Link>
        </div>
    </Link>
  )
}