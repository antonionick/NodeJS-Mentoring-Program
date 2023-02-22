import type { IUserDataToCreate, IUserDatabaseModel, IUserDataToUpdate } from '@components/user/user.models';
import type { DatabaseResult } from '@database/models/database-result';

export interface IUserDatabaseAPI {
    getUserById(
        id: string
    ): Promise<DatabaseResult<IUserDatabaseModel>>;
    getUserByLogin(
        login: string,
    ): Promise<DatabaseResult<IUserDatabaseModel>>;
    getAutoSuggestUsers(
        loginSubstring: string,
        limit: number,
    ): Promise<DatabaseResult<IUserDatabaseModel[]>>;

    createUser(
        userData: IUserDataToCreate,
    ): Promise<DatabaseResult<IUserDatabaseModel>>;
    updateUser(
        id: string,
        userData: IUserDataToUpdate,
    ): Promise<DatabaseResult<IUserDatabaseModel>>;
    deleteUser(
        id: string,
    ): Promise<DatabaseResult<boolean>>;

    addUsersToGroup(
        groupId: string,
        usersIds: string[],
    ): Promise<DatabaseResult<boolean>>;

    checkUserExistenceById(
        id: string,
    ): Promise<DatabaseResult<boolean>>;
    checkUserExistenceByLogin(
        login: string,
    ): Promise<DatabaseResult<boolean>>;

    checkUserBelongsToGroup(
        userId: string,
        groupId: string,
    ): Promise<DatabaseResult<boolean>>;
}
