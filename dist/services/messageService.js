"use strict";
// import { PrismaClient } from '@prisma/client';
// import { CreateMessageDto } from '../interface/dto/messageDto';
// const prisma = new PrismaClient();
// export const MessageService = {
//   async createMessage(data: CreateMessageDto) {
//     return prisma.message.create({ data });
//   },
//   async getMessagesByUser(userId: number) {
//     return prisma.message.findMany({
//       where: {
//         OR: [
//           { senderId: userId },
//           { receiverId: userId }
//         ]
//       },
//       orderBy: { createdAt: 'desc' }
//     });
//   },
//   async deleteMessage(id: number) {
//     return prisma.message.delete({ where: { id } });
//   }
// };
// export function createMessage(body: any) {
//     throw new Error('Function not implemented.');
// }
