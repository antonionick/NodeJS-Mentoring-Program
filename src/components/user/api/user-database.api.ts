import type { IUserDataToCreate, IUserDatabaseModel, IUserDataToUpdate } from '@components/user/user.models';

export interface IUserDatabaseAPI {
    getUserById(userId: string): Promise<IUserDatabaseModel>;
    getAutoSuggestUsers(loginSubstring: string, limit: number): Promise<IUserDatabaseModel[]>;

    createUser(userData: IUserDataToCreate): Promise<IUserDatabaseModel>;
    updateUser(userId: string, userData: IUserDataToUpdate): Promise<IUserDatabaseModel>;
    deleteUser(uerId: string): Promise<boolean>;

    checkUserExistenceById(userId: string): Promise<boolean>;
    checkUserExistenceByLogin(login: string): Promise<boolean>;
}
