import type { PassportAuthenticator } from '@authenticator/passport.authenticator';
import { logInfoMiddleware } from '@common/middlewares/log-info.middleware';
import { GroupController } from '@controllers/group.controller';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';
import { Router } from 'express';

export function getGroupRoutes(
    databaseProvider: IDatabaseProvider,
    validatorProvider: IValidatorProvider,
    authenticator: PassportAuthenticator,
): Router {
    const groupRouter = Router();
    const groupController = new GroupController(databaseProvider, validatorProvider);

    groupRouter.use(authenticator.getBearerStrategyAuthenticator());

    groupRouter.get(
        '/',
        groupController.getAllGroups.bind(groupController),
        logInfoMiddleware,
    );
    groupRouter.get(
        '/byId/:id',
        groupController.getGroupById.bind(groupController),
        logInfoMiddleware,
    );

    groupRouter.post(
        '/',
        groupController.createGroup.bind(groupController),
        logInfoMiddleware,
    );
    groupRouter.put(
        '/:id',
        groupController.updateGroup.bind(groupController),
        logInfoMiddleware,
    );
    groupRouter.delete(
        '/:id',
        groupController.deleteGroup.bind(groupController),
        logInfoMiddleware,
    );

    return groupRouter;
}
