export interface Icategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt?: string;
}

export interface IcategoriesResponse {
  success: boolean;
  count?: number;
  data: Icategory[];
}

export interface IcategoryResponse {
  success: boolean;
  data: Icategory;
}