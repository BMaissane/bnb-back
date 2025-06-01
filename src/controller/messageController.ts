// import { Request, Response } from 'express';
// import * as MessageService from '../service/messageService';

// export const MessageController = {
//   async create(req: Request, res: Response) {
//     try {
//       const message = await MessageService.createMessage(req.body);
//       res.status(201).json(message);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   async getAll(req: Request, res: Response) {
//     try {
//       const userId = parseInt(req.params.userId);
//       const messages = await MessageService.getMessagesByUser(userId);
//       res.json(messages);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   async delete(req: Request, res: Response) {
//     try {
//       const id = parseInt(req.params.id);
//       await MessageService.deleteMessage(id);
//       res.status(204).send();
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// };