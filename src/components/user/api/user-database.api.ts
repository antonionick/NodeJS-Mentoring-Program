import type { IUserDataToCreate, IUserDatabaseData, IUserDataToUpdate } from '@components/user/user.models';

export interface IUserDatabaseAPI {
    getUserById(id: string): Promise<IUserDatabaseData>;
    getAutoSuggestUsers(loginSubstring: string, limit: number): Promise<IUserDatabaseData[]>;

    createUser(userData: IUserDataToCreate): Promise<IUserDatabaseData>;
    updateUser(id: string, userData: IUserDataToUpdate): Promise<IUserDatabaseData>;
    deleteUser(id: string): Promise<boolean>;

    checkUserExistenceById(id: string): Promise<boolean>;
    checkUserExistenceByLogin(login: string): Promise<boolean>;
}
