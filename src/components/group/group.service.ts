import type { IGroupDatabaseAPI } from '@components/group/api/group-database.api';
import type { IGroupValidatorAPI } from '@components/group/api/group-validator.api';
import { Group, IGroupDatabaseModel, IGroupDataToCreate, IGroupDataToUpdate } from '@components/group/group.models';
import { ValidationStatus } from '@validators/models/validation-status';

export class GroupService {
    constructor(
        private readonly database: IGroupDatabaseAPI,
        private readonly validator: IGroupValidatorAPI,
    ) { }

    public async getGroupById(id: string): Promise<Group> {
        const groupDatabaseModel = await this.database.getGroupById(id);
        if (!groupDatabaseModel) {
            throw new Error(`Group with id: ${id} does not exist`);
        }

        const group = this.convertDatabaseModelToGroup(groupDatabaseModel);
        return group;
    }

    private convertDatabaseModelToGroup(groupModel: IGroupDatabaseModel): Group {
        return new Group({
            id: groupModel.id,
            name: groupModel.name,
            permissions: groupModel.permissions,
        });
    }

    public async getAllGroups(): Promise<Group[]> {
        const groupsDatabaseModels = await this.database.getAllGroups();

        const groups = groupsDatabaseModels.map(this.convertDatabaseModelToGroup.bind(this));
        return groups;
    }

    public async createGroup(dataToCreate: IGroupDataToCreate): Promise<Group> {
        const validationResult = this.validator.validateGroupDataToCreate(dataToCreate);
        if (validationResult.status === ValidationStatus.Fail) {
            throw validationResult;
        }

        const isGroupExist = await this.database.checkGroupExistenceByName(dataToCreate.name);
        if (isGroupExist) {
            throw new Error(`Group with name: ${dataToCreate.name} is already exist`);
        }

        const groupDatabaseModel = await this.database.createGroup(dataToCreate);
        const group = this.convertDatabaseModelToGroup(groupDatabaseModel);
        return group;
    }

    public async updateGroup(
        id: string,
        dataToUpdate: IGroupDataToUpdate,
    ): Promise<Group> {
        const validationResult = this.validator.validateGroupDataToUpdate(dataToUpdate);
        if (validationResult.status === ValidationStatus.Fail) {
            throw validationResult;
        }

        const isGroupExist = await this.database.checkGroupExistenceById(id);
        if (!isGroupExist) {
            throw new Error(`Group with id: ${id} does not exist`);
        }

        const groupDatabaseModel = await this.database.updateGroup(id, dataToUpdate);
        const group = this.convertDatabaseModelToGroup(groupDatabaseModel);
        return group;
    }

    public async deleteGroup(id: string): Promise<boolean> {
        const isGroupExist = await this.database.checkGroupExistenceById(id);
        if (!isGroupExist) {
            throw new Error(`Group with id: ${id} does not exist`);
        }

        const isDeleted = await this.database.deleteGroup(id);
        return isDeleted;
    }
}
