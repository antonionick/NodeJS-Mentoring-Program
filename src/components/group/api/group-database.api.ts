import type { IGroupDatabaseModel, IGroupDataToCreate, IGroupDataToUpdate } from '@components/group/group.models';
import type { DatabaseResult } from '@database/models/database-result';

export interface IGroupDatabaseAPI {
    getGroupById(
        id: string,
    ): Promise<DatabaseResult<IGroupDatabaseModel>>;
    getAllGroups(): Promise<DatabaseResult<IGroupDatabaseModel[]>>;

    createGroup(
        dataToCreate: IGroupDataToCreate,
    ): Promise<DatabaseResult<IGroupDatabaseModel>>;
    updateGroup(
        id: string,
        dataToUpdate: IGroupDataToUpdate,
    ): Promise<DatabaseResult<IGroupDatabaseModel>>;

    deleteGroup(id: string): Promise<DatabaseResult<boolean>>;

    checkGroupExistenceById(id: string): Promise<DatabaseResult<boolean>>;
    checkGroupExistenceByName(name: string): Promise<DatabaseResult<boolean>>;
}
