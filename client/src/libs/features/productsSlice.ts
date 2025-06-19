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
  items: Product[];
}

const initialState: ProductsState = {
  items: [],
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    },
    clearProducts: (state) => {
      state.items = [];
    },
  },
});

export const { setProducts, clearProducts } = productsSlice.actions;
export const selectProducts = (state) => {
  return state.products?.items;
}
export default productsSlice.reducer;