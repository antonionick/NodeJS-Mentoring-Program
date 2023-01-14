import { UserController } from '@controllers/user.controllers';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import { Router } from 'express';

export function getUserRoutes(
    databaseProvider: IDatabaseProvider,
): Router {
    UserController.databaseProvider = databaseProvider;

    const userRouter = Router();

    userRouter.get('/byId/:id', UserController.getUserById);
    userRouter.get('/autosuggest', UserController.getAutosuggest);

    userRouter.post('/', UserController.createUser);
    userRouter.put('/:id', UserController.updateUser);
    userRouter.delete('/:id', UserController.deleteUser);

    return userRouter;
}
