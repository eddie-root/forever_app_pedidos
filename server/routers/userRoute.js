import express from 'express';
import { createUser, getUsers, updateUser, deleteUser } from '../controllers/userController.js';
import { loginUser } from '../controllers/authController.js';

const userRouter = express.Router();

userRouter.post('/register', createUser)
userRouter.post('/login', loginUser)

userRouter.get('/', getUsers)
userRouter.put('/:id', updateUser)
userRouter.delete('/:id', deleteUser)

export default userRouter;