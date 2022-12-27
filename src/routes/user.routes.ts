import { UserController } from '@controllers/user.controllers';
import { Router } from 'express';

export function getUserRoutes(): Router {
    const userRouter = Router();

    userRouter.post('/', UserController.createUser);

    return userRouter;
}
