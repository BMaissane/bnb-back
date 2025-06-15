export interface IRestaurant {
  id: number;
  owner_id: number;
  name: string;
  address?: string;
  opening_hours?: string;
  genre?: string;
  siret: string;
  description?: string;
  image_url: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateRestaurantDto {
  owner_id: number;
  name: string;
  address?: string;
  opening_hours?: string;
  genre?: string;
  siret: string;
  description?: string;
  image_url?: string;
}

export interface UpdateRestaurantDto {
  name?: string;
  address?: string;
  opening_hours?: string;
  genre?: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
}