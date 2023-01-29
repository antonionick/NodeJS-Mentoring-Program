import { UserController } from '@controllers/user.controllers';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';
import { Router } from 'express';

export function getUserRoutes(
    databaseProvider: IDatabaseProvider,
    validatorProvider: IValidatorProvider,
): Router {
    const userRouter = Router();
    const userController = new UserController(databaseProvider, validatorProvider);

    userRouter.get('/byId/:id', userController.getUserById.bind(userController));
    userRouter.get('/autosuggest', userController.getAutosuggest.bind(userController));

    userRouter.post('/', userController.createUser.bind(userController));
    userRouter.put('/:id', userController.updateUser.bind(userController));
    userRouter.delete('/:id', userController.deleteUser.bind(userController));

    userRouter.post('/addUsersToGroup', userController.addUsersToGroup.bind(userController));

    return userRouter;
}
