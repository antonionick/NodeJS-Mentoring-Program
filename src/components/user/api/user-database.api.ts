import type { IUserDataToCreate, IUserDatabaseModel, IUserDataToUpdate } from '@components/user/user.models';

export interface IUserDatabaseAPI {
    getUserById(id: string): Promise<IUserDatabaseModel>;
    getAutoSuggestUsers(loginSubstring: string, limit: number): Promise<IUserDatabaseModel[]>;

    createUser(userData: IUserDataToCreate): Promise<IUserDatabaseModel>;
    updateUser(id: string, userData: IUserDataToUpdate): Promise<IUserDatabaseModel>;
    deleteUser(id: string): Promise<boolean>;

    checkUserExistenceById(id: string): Promise<boolean>;
    checkUserExistenceByLogin(id: string): Promise<boolean>;
}
