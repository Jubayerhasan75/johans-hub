import { Product } from '../types';
import { apiFetch } from '../lib/api';

/** Fetches all products from the backend API. */
export const fetchProducts = async (): Promise<Product[]> => {
  return apiFetch<Product[]>('/api/products');
};

/** Fetches a single product by ID. */
export const fetchProductById = async (id: string): Promise<Product> => {
  return apiFetch<Product>(`/api/products/${id}`);
};
