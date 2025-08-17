import { ReservationStatus } from '@prisma/client';
import { CreateReservationInput, UpdateReservationInput } from '../dto/reservationDto';

export interface ReservationDetails {
  id: number;
  status: ReservationStatus;
  specialRequests?: string;
  capacity: number;
  timeslot: {
    startAt: Date;
    endAt: Date;
  };
  items?: {
    itemId: number;
    name: string;
    quantity: number;
    price: number; // Conversion explicite de Decimal -> number
  }[];
}

export interface ReservationServiceInterface {
  create(data: CreateReservationInput): Promise<ReservationDetails>;
  getById(id: number): Promise<ReservationDetails>;
  updateStatus(id: number, status: 'CONFIRMED' | 'CANCELED'): Promise<ReservationDetails>;
  getUserReservations(userId: number): Promise<ReservationDetails[]>;
  getRestaurantReservations(restaurantId: number): Promise<ReservationDetails[]>;
}