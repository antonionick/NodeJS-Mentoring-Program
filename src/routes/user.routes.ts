import type { PassportAuthenticator } from '@authenticator/passport.authenticator';
import { logInfoMiddleware } from '@common/middlewares/log-info.middleware';
import { UserController } from '@controllers/user.controllers';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';
import { Router } from 'express';

export function getUserRoutes(
    databaseProvider: IDatabaseProvider,
    validatorProvider: IValidatorProvider,
    authenticator: PassportAuthenticator,
): Router {
    const userRouter = Router();
    const userController = new UserController(databaseProvider, validatorProvider, authenticator);

    userRouter.post(
        '/login',
        authenticator.getLocalStrategyAuthenticator(),
        userController.login.bind(userController),
    );

    userRouter.get(
        '/byId/:id',
        authenticator.getBearerStrategyAuthenticator(),
        userController.getUserById.bind(userController),
        logInfoMiddleware,
    );
    userRouter.get(
        '/autosuggest',
        authenticator.getBearerStrategyAuthenticator(),
        userController.getAutosuggest.bind(userController),
        logInfoMiddleware,
    );

    userRouter.post(
        '/',
        authenticator.getBearerStrategyAuthenticator(),
        userController.createUser.bind(userController),
        logInfoMiddleware,
    );
    userRouter.put(
        '/:id',
        authenticator.getBearerStrategyAuthenticator(),
        userController.updateUser.bind(userController),
        logInfoMiddleware,
    );
    userRouter.delete(
        '/:id',
        authenticator.getBearerStrategyAuthenticator(),
        userController.deleteUser.bind(userController),
        logInfoMiddleware,
    );

    userRouter.post(
        '/addUsersToGroup',
        authenticator.getBearerStrategyAuthenticator(),
        userController.addUsersToGroup.bind(userController),
        logInfoMiddleware,
    );

    return userRouter;
}
