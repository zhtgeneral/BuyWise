import "../styles/ProductGrid.css";
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import { 
  selectProducts, 
  selectPastProducts 
} from "../libs/features/productsSlice";

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
    <div className='product-grid-container'>
      <SearchResults products={actualProducts} />
      <ConditionalPreviousResults products={pastProducts} />
    </div>
  );
}

function SearchResults({
  products
}) {
  return (
    <>
      <h1>Search Results</h1>
      <div className="product-list">
        {
          products?.map(
            (product) => <ProductCard product={product} />
          )
        }
      </div>
    </>
  )
}

function ConditionalPreviousResults({
  products
}) {
  if (!products || products.length === 0) return null;
  return (
    <>
      <h1 style={{ marginTop: '2rem' }}>Previous Results</h1>
      <div>
        {
          products.map((batch, batchIdx) => (
            <div 
              key={batchIdx} 
              style={{ 
                paddingTop: batchIdx !== 0 
                  ? '2rem' 
                  : undefined, 
              }}
            >
              <div className="product-list">
                {
                  batch.map(
                    (product) => <ProductCard product={product} />
                  )
                }
              </div>
            </div>
          ))
        }
      </div>
    </>
  )
}

function ProductCard({
  product
}) {
  return (
    <div className="product-card" key={product.id}>
      <img src={product.image} alt={product.title} />
      <div className="product-container">
        <h4>{product.title}</h4>
        <p>Price: ${product.price}</p>
        <Link target="_blank" to={product.url} className="product-link">
          Link to Product
        </Link>
      </div>
    </div>
  )
}