import { UserController } from '@controllers/user.controllers';
import { Router } from 'express';

export function getUserRoutes(): Router {
    const userRouter = Router();

    userRouter.get('/byId/:id', UserController.getUserById);
    userRouter.get('/autosuggest', UserController.getAutosuggest);

    userRouter.post('/', UserController.createUser);
    userRouter.put('/:id', UserController.updateUser);
    userRouter.delete('/:id', UserController.deleteUser);

    return userRouter;
}
