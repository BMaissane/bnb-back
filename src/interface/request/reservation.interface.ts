import { CreateReservationInput, UpdateReservationInput } from '../dto/reservationDto';

export interface ReservationDetails {
  id: number;
  userId: number;
  restaurantId: number;
  timeslotId: number;
  status: 'CONFIRMED' | 'CANCELED';
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    firstName: string;
    lastName?: string;
    email: string;
  };
  restaurant: {
    name: string;
    address?: string;
  };
  timeslot: {
    date: Date;
    startAt: Date;
    endAt: Date;
  };
  items: {
    itemId: number;
    name: string;
    quantity: number;
    itemPrice: number;
  }[];
}

export interface ReservationServiceInterface {
  create(data: CreateReservationInput): Promise<ReservationDetails>;
  getById(id: number): Promise<ReservationDetails>;
  updateStatus(id: number, status: 'CONFIRMED' | 'CANCELED'): Promise<ReservationDetails>;
  getUserReservations(userId: number): Promise<ReservationDetails[]>;
  getRestaurantReservations(restaurantId: number): Promise<ReservationDetails[]>;
}