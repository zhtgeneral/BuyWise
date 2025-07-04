import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import "../styles/ProductGrid.css";
import { selectProducts, selectPastProducts } from "../libs/features/productsSlice";

export default function ProductGrid({
  products,
  showProduct
}) {
  // Use products prop if provided, otherwise use selector
  const selectorProducts = useSelector(selectProducts);
  const actualProducts = products || selectorProducts;
  const pastProducts = useSelector(selectPastProducts);

  if (!showProduct) {
    return (
      <></>
    )
  }
  
  return (
    <>
      <h3>Recommended Products</h3>    
      <div className="product-list">
        {actualProducts?.map((product) => (
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
      {pastProducts && pastProducts.length > 0 && (
        <>
          <h4 style={{marginTop: '2rem'}}>Previously Recommended</h4>
          <div>
            {pastProducts.map((batch, batchIdx) => (
              <div key={batchIdx} style={{ borderTop: batchIdx !== 0 ? '2px solid #e0e0e0' : undefined, paddingTop: batchIdx !== 0 ? '1rem' : undefined, marginTop: batchIdx !== 0 ? '1.5rem' : undefined }}>
                <div className="product-list">
                  {batch.map((product) => (
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
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
