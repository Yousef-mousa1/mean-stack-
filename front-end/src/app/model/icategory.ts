export interface Icategory {
  _id: string;
  name: string;
}

export interface IcategoriesResponse {
  success: boolean;
  data: Icategory[];
}