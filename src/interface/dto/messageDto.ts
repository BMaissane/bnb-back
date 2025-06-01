import { z } from 'zod';

export interface IMessage {
    id: number;
    senderId: number;
    receiverId: number;
    reservationId?: number;
    content: string;
    createdAt: Date;
    readAt?: Date;
  }
  
  export interface CreateMessageDto {
    senderId: number;
    receiverId: number;
    reservationId?: number;
    content: string;
  }