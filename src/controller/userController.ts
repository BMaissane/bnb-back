import { Request, Response } from 'express';
import { CreateUserDto, UpdateUserDto } from '../interface/dto/userDto';
import { UserService } from '../service/UserService';

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData: CreateUserDto = req.body;
    const user = await UserService.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'error.message' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await UserService.getUserById(parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
      const user = await UserService.getUserById(parseInt(req.params.id));
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };

  export const deleteUser = async (req: Request, res: Response) => {
    try {
      const user = await UserService.getUserById(parseInt(req.params.id));
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };

