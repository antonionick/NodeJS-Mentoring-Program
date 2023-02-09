import { ServiceError } from '@common/models/service.error';
import type { IGroupDatabaseAPI } from '@components/group/api/group-database.api';
import type { IGroupValidatorAPI } from '@components/group/api/group-validator.api';
import { Group, IGroupDatabaseModel, IGroupDataToCreate, IGroupDataToUpdate } from '@components/group/group.models';
import { GroupServiceResult } from './group.models';

export class GroupService {
    constructor(
        private readonly database: IGroupDatabaseAPI,
        private readonly validator: IGroupValidatorAPI,
    ) { }

    public async getGroupById(
        id: string,
    ): Promise<GroupServiceResult<Group>> {
        try {
            const groupDatabaseResult = await this.database.getGroupById(id);
            if (groupDatabaseResult.hasError!()) {
                return new GroupServiceResult({ error: groupDatabaseResult.error });
            }

            const groupDatabaseModel = groupDatabaseResult.data!;
            if (!groupDatabaseModel) {
                const serviceError = new ServiceError({
                    message: `Group with id: ${id} does not exist`,
                });
                return new GroupServiceResult({ error: serviceError });
            }

            const group = this.convertDatabaseModelToGroup(groupDatabaseModel);
            return new GroupServiceResult({ data: group });
        } catch (error: unknown) {
            return new GroupServiceResult({ error });
        }
    }

    private convertDatabaseModelToGroup(groupModel: IGroupDatabaseModel): Group {
        return new Group({
            id: groupModel.id,
            name: groupModel.name,
            permissions: groupModel.permissions,
        });
    }

    public async getAllGroups(): Promise<GroupServiceResult<Group[]>> {
        try {
            const groupDatabaseResult = await this.database.getAllGroups();
            if (groupDatabaseResult.hasError!()) {
                return new GroupServiceResult({ error: groupDatabaseResult.error });
            }

            const groupsDatabaseModels = groupDatabaseResult.data!;
            const groups = groupsDatabaseModels.map(this.convertDatabaseModelToGroup.bind(this));
            return new GroupServiceResult({ data: groups });
        } catch (error: unknown) {
            return new GroupServiceResult({ error });
        }
    }

    public async createGroup(
        dataToCreate: IGroupDataToCreate,
    ): Promise<GroupServiceResult<Group>> {
        try {
            const validationResult = this.validator.validateGroupDataToCreate(dataToCreate);
            if (validationResult.isValidationFail!()) {
                return new GroupServiceResult({ error: validationResult });
            }

            const checkGroupDatabaseResult = await this.database
                .checkGroupExistenceByName(dataToCreate.name);
            if (checkGroupDatabaseResult.hasError!()) {
                return new GroupServiceResult({ error: checkGroupDatabaseResult.error });
            }

            const doesGroupExist = checkGroupDatabaseResult.data!;
            if (doesGroupExist) {
                const serviceError = new ServiceError({
                    message: `Group with name: ${dataToCreate.name} is already exist`,
                });
                return new GroupServiceResult({ error: serviceError });
            }

            const createGroupDatabaseResult = await this.database.createGroup(dataToCreate);
            if (createGroupDatabaseResult.hasError!()) {
                return new GroupServiceResult({ error: createGroupDatabaseResult.error });
            }

            const groupDatabaseModel = createGroupDatabaseResult.data!;
            const group = this.convertDatabaseModelToGroup(groupDatabaseModel);
            return new GroupServiceResult({ data: group });
        } catch (error: unknown) {
            return new GroupServiceResult({ error });
        }
    }

    public async updateGroup(
        id: string,
        dataToUpdate: IGroupDataToUpdate,
    ): Promise<GroupServiceResult<Group>> {
        try {
            const validationResult = this.validator.validateGroupDataToUpdate(dataToUpdate);
            if (validationResult.isValidationFail!()) {
                return new GroupServiceResult({ error: validationResult });
            }

            const checkGroupDatabaseResult = await this.database.checkGroupExistenceById(id);
            if (checkGroupDatabaseResult.hasError!()) {
                return new GroupServiceResult({ error: checkGroupDatabaseResult.error });
            }

            const doesGroupExist = checkGroupDatabaseResult.data!;
            if (!doesGroupExist) {
                const serviceError = new ServiceError({
                    message: `Group with id: ${id} does not exist`,
                });
                return new GroupServiceResult({ error: serviceError });
            }

            const updateGroupDatabaseResult = await this.database.updateGroup(id, dataToUpdate);
            if (updateGroupDatabaseResult.hasError!()) {
                return new GroupServiceResult({ error: updateGroupDatabaseResult.error });
            }

            const groupDatabaseModel = updateGroupDatabaseResult.data!;
            const group = this.convertDatabaseModelToGroup(groupDatabaseModel);
            return new GroupServiceResult({ data: group });
        } catch (error: unknown) {
            return new GroupServiceResult({ error });
        }
    }

    public async deleteGroup(
        id: string,
    ): Promise<GroupServiceResult<boolean>> {
        try {
            const checkGroupDatabaseResult = await this.database.checkGroupExistenceById(id);
            if (checkGroupDatabaseResult.hasError!()) {
                return new GroupServiceResult({ error: checkGroupDatabaseResult.error });
            }

            const doesGroupExist = checkGroupDatabaseResult.data!;
            if (!doesGroupExist) {
                const serviceError = new ServiceError({
                    message: `Group with id: ${id} does not exist`,
                });
                return new GroupServiceResult({ error: serviceError });
            }

            const deleteGroupDatabaseResult = await this.database.deleteGroup(id);
            if (deleteGroupDatabaseResult.hasError!()) {
                return new GroupServiceResult({ error: deleteGroupDatabaseResult.error });
            }

            const isGroupDeleted = deleteGroupDatabaseResult.data!;
            return new GroupServiceResult({ data: isGroupDeleted });
        } catch (error: unknown) {
            return new GroupServiceResult({ error });
        }
    }
}
