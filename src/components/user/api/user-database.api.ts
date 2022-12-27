import type { IUserDataToCreate, IUserDatabaseData, IUserDataToUpdate } from '@components/user/user.models';

export interface IUserDatabaseAPI {
    // TODO: Remove, development purpose
    getAll(): IUserDatabaseData[];

    createUser(userData: IUserDataToCreate): Promise<IUserDatabaseData>;
    updateUser(id: string, userData: IUserDataToUpdate): Promise<IUserDatabaseData>;

    checkUserExistenceById(id: string): Promise<boolean>;
    checkUserExistenceByLogin(login: string): Promise<boolean>;
}
