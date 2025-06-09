export interface Hotel {
  id: number;
  name: string;
  address: string;
  city: string;
  featuredImage: string;
  price: number;
  category?: string;
  rooms?: any[];
}
