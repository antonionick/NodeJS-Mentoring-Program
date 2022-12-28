import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import { IUserDataToCreate, IUserDatabaseModel, User, IUserDataToUpdate } from '@components/user/user.models';

export class UserService {
    constructor(
        private readonly database: IUserDatabaseAPI,
    ) { }

    public async getUserById(id: string): Promise<User> {
        const userDatabaseModel = await this.database.getUserById(id);
        if (!userDatabaseModel) {
            // TODO: Error
        }

        const user = this.convertDatabaseModelToUser(userDatabaseModel);
        return user;
    }

    public async getAutosuggestUsers(
        loginSubstring: string,
        limit: number,
    ): Promise<User[]> {
        if (Number.isNaN(limit)) {
            // TODO: Error
        }
        if (!limit) {
            return [];
        }

        const autosuggestDatabaseModels = await this.database.getAutoSuggestUsers(loginSubstring, limit);
        const autosuggestUsers = autosuggestDatabaseModels
            .map(this.convertDatabaseModelToUser);

        return autosuggestUsers;
    }

    public async createUser(
        userData: IUserDataToCreate,
    ): Promise<User> {
        const isUserExist = await this.database.checkUserExistenceByLogin(userData.login);
        if (isUserExist) {
            // TODO: Throw an error
        }

        const userDatabaseModel = await this.database.createUser(userData);
        const user = this.convertDatabaseModelToUser(userDatabaseModel);
        return user;
    }

    private convertDatabaseModelToUser(userDatabaseModel: IUserDatabaseModel): User {
        return new User({
            id: userDatabaseModel.id,
            login: userDatabaseModel.login,
            password: userDatabaseModel.password,
            age: userDatabaseModel.age,
        });
    }

    public async updateUser(
        id: string,
        userData: IUserDataToUpdate,
    ): Promise<User> {
        const isUserExist = await this.database.checkUserExistenceById(id);
        if (!isUserExist) {
            // TODO: Throw an error
        }

        const userDatabaseModel = await this.database.updateUser(id, userData);
        const user = this.convertDatabaseModelToUser(userDatabaseModel);
        return user;
    }

    public async deleteUser(id: string): Promise<boolean> {
        const isUserExist = await this.database.checkUserExistenceById(id);
        if (!isUserExist) {
            // TODO: Throw an error
        }

        const isDeleted = await this.database.deleteUser(id);
        return isDeleted;
    }
}
