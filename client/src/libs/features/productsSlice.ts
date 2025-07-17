import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
  id: string,
  source: string,
  title: string,
  image: string,
  price: number,
  url: string,
  rating: number,
  reviews: number,
}

interface ProductsState {
  products: Product[];
  pastProducts: Product[][];
}

const initialState: ProductsState = {
  products: [],
  pastProducts: [],
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      if (state.products.length > 0) {
        state.pastProducts.unshift(state.products);
      }
      state.products = action.payload;
    },
    clearProducts: (state) => {
      state.products = [];
      state.pastProducts = [];
    },
    loadPastProducts: (state, action: PayloadAction<{ products: Product[]; pastProducts?: Product[][] }>) => {
      const { products, pastProducts = [] } = action.payload;
      state.products = products;
      state.pastProducts = pastProducts;
    },
  },
});

export const { setProducts, clearProducts, loadPastProducts } = productsSlice.actions;
export const selectProducts = (state) => state.products?.products || [];
export const selectPastProducts = (state) => state.products?.pastProducts || [];
export default productsSlice.reducer;