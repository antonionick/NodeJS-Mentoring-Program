import { GroupController } from '@controllers/group.controller';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';
import { Router } from 'express';

export function getGroupRoutes(
    databaseProvider: IDatabaseProvider,
    validatorProvider: IValidatorProvider,
): Router {
    const groupRouter = Router();
    const groupController = new GroupController(databaseProvider, validatorProvider);

    groupRouter.get('/', groupController.getAllGroups.bind(groupController));
    groupRouter.get('/byId/:id', groupController.getGroupById.bind(groupController));

    groupRouter.post('/', groupController.createGroup.bind(groupController));
    groupRouter.put('/:id', groupController.updateGroup.bind(groupController));
    groupRouter.delete('/:id', groupController.deleteGroup.bind(groupController));

    return groupRouter;
}