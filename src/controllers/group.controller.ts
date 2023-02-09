import type { IGroupDataToCreate, IGroupDataToUpdate } from '@components/group/group.models';
import { GroupService } from '@components/group/group.service';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class GroupController {
    private groupService: GroupService;

    constructor(
        private readonly databaseProvider: IDatabaseProvider,
        private readonly validatorProvider: IValidatorProvider,
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
                next(groupServiceResult.error);
                return;
            }

            const group = groupServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .json(group);
        } catch (error) {
            next(error);
        }
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
                next(groupServiceResult.error);
                return;
            }

            const groups = groupServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .json(groups);
        } catch (error) {
            next(error);
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
                next(groupServiceResult.error);
                return;
            }

            const createdGroup = groupServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .json(createdGroup);
        } catch (error) {
            next(error);
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
                next(groupServiceResult.error);
                return;
            }

            const updatedGroup = groupServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .json(updatedGroup);
        } catch (error) {
            next(error);
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
                next(groupServiceResult.error);
                return;
            }

            const isDeleted = groupServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .send(isDeleted);
        } catch (error) {
            next(error);
        }
    }

    private getGroupService(): GroupService {
        if (!this.groupService) {
            const database = this.databaseProvider.getGroupDatabase();
            const validator = this.validatorProvider.getGroupValidator();
            this.groupService = new GroupService(database, validator);
        }
        return this.groupService;
    }
}
