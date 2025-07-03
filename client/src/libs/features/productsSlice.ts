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
  pastProducts: Product[];
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
      // Move current products to pastProducts, avoiding duplicates
      const currentIds = new Set(state.products.map(p => p.id));
      const newPast = state.products.filter(p => !state.pastProducts.some(pp => pp.id === p.id));
      state.pastProducts = [...state.pastProducts, ...newPast];
      state.products = action.payload;
    },
    clearProducts: (state) => {
      state.products = [];
      state.pastProducts = [];
    },
  },
});

export const { setProducts, clearProducts } = productsSlice.actions;
export const selectProducts = (state) => state.products?.products || [];
export const selectPastProducts = (state) => state.products?.pastProducts || [];
export default productsSlice.reducer;