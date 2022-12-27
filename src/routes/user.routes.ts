import { UserController } from '@controllers/user.controllers';
import { Router } from 'express';

export function getUserRoutes(): Router {
    const userRouter = Router();

    // TODO: Remove, development purpose
    userRouter.get('/', UserController.getUsers);

    userRouter.post('/', UserController.createUser);
    userRouter.put('/:id', UserController.updateUser);

    return userRouter;
}
