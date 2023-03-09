import type { GroupServiceResult, IGroupDataToCreate, IGroupDataToUpdate } from '@components/group/group.models';
import type { GroupService } from '@components/group/group.service';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ErrorHandlerData } from '@common/models/error-handler-data.models';
import type { GroupServiceProvider } from '@components/group/group-service.provider';

export class GroupController {
    constructor(
        private readonly databaseProvider: IDatabaseProvider,
        private readonly validatorProvider: IValidatorProvider,
        private readonly groupServiceProvider: GroupServiceProvider,
    ) { }

    public async getGroupById(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const groupService = this.getGroupService();
        const id = request.params.id;

        try {
            const groupServiceResult = await groupService.getGroupById(id);
            if (groupServiceResult.hasError!()) {
                const errorHandlerData = this.getErrorHandlerData(groupServiceResult)
                next(errorHandlerData);
            }

            const group = groupServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .json(group);

            response.locals.logInfo = groupServiceResult.logInfo;
            next();
        } catch (error) {
            next(new ErrorHandlerData({ error }));
        }
    }

    private getErrorHandlerData(groupServiceResult: GroupServiceResult): ErrorHandlerData {
        return new ErrorHandlerData({
            error: groupServiceResult.error,
            logInfo: groupServiceResult.logInfo,
        });
    }

    public async getAllGroups(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const groupService = this.getGroupService();

        try {
            const groupServiceResult = await groupService.getAllGroups();
            if (groupServiceResult.hasError!()) {
                const errorHandlerData = this.getErrorHandlerData(groupServiceResult)
                next(errorHandlerData);
            }

            const groups = groupServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .json(groups);

            response.locals.logInfo = groupServiceResult.logInfo;
            next();
        } catch (error) {
            next(new ErrorHandlerData({ error }));
        }
    }

    public async createGroup(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const groupService = this.getGroupService();
        const groupDataToCreate = this.getGroupDataToCreate(request);

        try {
            const groupServiceResult = await groupService.createGroup(groupDataToCreate);
            if (groupServiceResult.hasError!()) {
                const errorHandlerData = this.getErrorHandlerData(groupServiceResult)
                next(errorHandlerData);
            }

            const createdGroup = groupServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .json(createdGroup);

            response.locals.logInfo = groupServiceResult.logInfo;
            next();
        } catch (error) {
            next(new ErrorHandlerData({ error }));
        }
    }

    private getGroupDataToCreate({ body }: Request): IGroupDataToCreate {
        return {
            name: body.name,
            permissions: body.permissions,
        };
    }

    public async updateGroup(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const groupService = this.getGroupService();
        const groupDataToUpdate = this.getGroupDataToUpdate(request);
        const groupIdToUpdate = request.params.id;

        try {
            const groupServiceResult = await groupService.updateGroup(groupIdToUpdate, groupDataToUpdate);
            if (groupServiceResult.hasError!()) {
                const errorHandlerData = this.getErrorHandlerData(groupServiceResult)
                next(errorHandlerData);
            }

            const updatedGroup = groupServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .json(updatedGroup);

            response.locals.logInfo = groupServiceResult.logInfo;
            next();
        } catch (error) {
            next(new ErrorHandlerData({ error }));
        }
    }

    private getGroupDataToUpdate({ body }: Request): IGroupDataToUpdate {
        return {
            permissions: body.permissions,
        };
    }

    public async deleteGroup(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const groupService = this.getGroupService();
        const groupIdToDelete = request.params.id;

        try {
            const groupServiceResult = await groupService.deleteGroup(groupIdToDelete);
            if (groupServiceResult.hasError!()) {
                const errorHandlerData = this.getErrorHandlerData(groupServiceResult)
                next(errorHandlerData);
            }

            const isDeleted = groupServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .send(isDeleted);

            response.locals.logInfo = groupServiceResult.logInfo;
            next();
        } catch (error) {
            next(new ErrorHandlerData({ error }));
        }
    }

    private getGroupService(): GroupService {
        return this.groupServiceProvider
            .provideGroupService(this.databaseProvider, this.validatorProvider);
    }
}
