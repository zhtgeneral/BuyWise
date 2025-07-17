import "../styles/ProductGrid.css";
import ProductCard from './ProductCard'

export default function ProductGrid({
  showProduct,
  products = [],
  pastProducts = []
}) {
  if (!showProduct) {
    return null;
  }
  
  return (
    <div className='product-grid-container'>
      <SearchResults products={products} />
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
                    (product) => <ProductCard key={product.id} product={product} />
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