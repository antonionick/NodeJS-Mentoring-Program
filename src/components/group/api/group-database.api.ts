import type { IGroupDatabaseModel, IGroupDataToCreate, IGroupDataToUpdate } from '@components/group/group.models';

export interface IGroupDatabaseAPI {
    getGroupById(id: string): Promise<IGroupDatabaseModel>;
    getAllGroups(): Promise<IGroupDatabaseModel[]>;

    createGroup(dataToCreate: IGroupDataToCreate): Promise<IGroupDatabaseModel>;
    updateGroup(id: string, dataToUpdate: IGroupDataToUpdate): Promise<IGroupDatabaseModel>;

    deleteGroup(id: string): Promise<boolean>;

    checkGroupExistenceById(id: string): Promise<boolean>;
    checkGroupExistenceByName(name: string): Promise<boolean>;
}
