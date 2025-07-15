import { reservation } from "@prisma/client";

export interface ReservationInput {
  userId: number;
  restaurantId: number;
  timeslotId: number;
  specialRequests?: string;
  items: {
    itemId: number;
    quantity: number;
  }[];
}

export interface ReservationUpdateInput {
  status?: 'CONFIRMED' | 'CANCELED';
  specialRequests?: string;
}

export interface ReservationWithDetails extends reservation {
  restaurant: {
    name: string;
    address?: string;
  };
  timeslot: {
    date: Date;
    start_at: Date;
    end_at: Date;
  };
  items: {
    name: string;
    quantity: number;
    item_price: number;
  }[];
}