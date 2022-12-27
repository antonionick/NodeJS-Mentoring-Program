import type { IUserCreationData, IUserDatabaseData, User } from '@components/user/user.models';

export interface IUserDatabaseAPI {
    createUser(userData: IUserCreationData): Promise<IUserDatabaseData>;
    checkUserExistenceByLogin(login: string): Promise<boolean>;
    // checkUserExistenceById(id: string): Promise<boolean>;
}
