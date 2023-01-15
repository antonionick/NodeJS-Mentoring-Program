import { ValidationStatus } from '@common/validation/validation-status';
import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { IUserValidatorAPI } from '@components/user/api/user-validator.api';
import { IUserDataToCreate, IUserDatabaseModel, User, IUserDataToUpdate } from '@components/user/user.models';

export class UserService {
    constructor(
        private readonly database: IUserDatabaseAPI,
        private readonly validator: IUserValidatorAPI,
    ) { }

    public async getUserById(id: string): Promise<User> {
        const userDatabaseModel = await this.database.getUserById(id);
        if (!userDatabaseModel) {
            throw new Error(`User with id: ${id} is not exist`);
        }

        const user = this.convertDatabaseModelToUser(userDatabaseModel);
        return user;
    }

    public async getAutosuggestUsers(
        loginSubstring: string,
        limit: number,
    ): Promise<User[]> {
        const validationResult = this.validator
            .validateAutosuggestParams(loginSubstring, limit);
        if (validationResult.status === ValidationStatus.Fail) {
            throw validationResult;
        }

        const autosuggestDatabaseModels = await this.database
            .getAutoSuggestUsers(loginSubstring, limit);
        const autosuggestUsers = autosuggestDatabaseModels
            .map(this.convertDatabaseModelToUser);

        return autosuggestUsers;
    }

    public async createUser(
        userData: IUserDataToCreate,
    ): Promise<User> {
        const validationResult = this.validator
            .validateUserDataToCreate(userData);
        if (validationResult.status === ValidationStatus.Fail) {
            throw validationResult;
        }

        // TODO: move to database layer
        const isUserExist = await this.database.checkUserExistenceByLogin(userData.login);
        if (isUserExist) {
            throw new Error(`User with login: ${userData.login} is already exist`);
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
        const validationResult = this.validator
            .validateUserDataToUpdate(userData);
        if (validationResult.status === ValidationStatus.Fail) {
            throw validationResult;
        }

        // TODO: move to database layer
        const isUserExist = await this.database.checkUserExistenceById(id);
        if (!isUserExist) {
            throw new Error(`User with id: ${id} is not exist`);
        }

        const userDatabaseModel = await this.database.updateUser(id, userData);
        const user = this.convertDatabaseModelToUser(userDatabaseModel);
        return user;
    }

    public async deleteUser(id: string): Promise<boolean> {
        const isUserExist = await this.database.checkUserExistenceById(id);
        if (!isUserExist) {
            throw new Error(`User with id: ${id} is not exist`);
        }

        const isDeleted = await this.database.deleteUser(id);
        return isDeleted;
    }
}
