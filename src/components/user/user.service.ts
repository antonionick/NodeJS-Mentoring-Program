import type { IGroupDatabaseAPI } from '@components/group/api/group-database.api';
import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { IUserValidatorAPI } from '@components/user/api/user-validator.api';
import { IUserDataToCreate, IUserDatabaseModel, User, IUserDataToUpdate } from '@components/user/user.models';

export class UserService {
    constructor(
        private readonly userDatabase: IUserDatabaseAPI,
        private readonly groupDatabase: IGroupDatabaseAPI,
        private readonly validator: IUserValidatorAPI,
    ) { }

    public async getUserById(id: string): Promise<User> {
        const userDatabaseModel = await this.userDatabase.getUserById(id);
        if (!userDatabaseModel) {
            throw new Error(`User with id: ${id} does not exist`);
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
        if (validationResult.isValidationFail!()) {
            throw validationResult;
        }

        const autosuggestDatabaseModels = await this.userDatabase
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
        if (validationResult.isValidationFail!()) {
            throw validationResult;
        }

        const isUserExist = await this.userDatabase.checkUserExistenceByLogin(userData.login);
        if (isUserExist) {
            throw new Error(`User with login: ${userData.login} is already exist`);
        }

        const userDatabaseModel = await this.userDatabase.createUser(userData);
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
        if (validationResult.isValidationFail!()) {
            throw validationResult;
        }

        const isUserExist = await this.userDatabase.checkUserExistenceById(id);
        if (!isUserExist) {
            throw new Error(`User with id: ${id} does not exist`);
        }

        const userDatabaseModel = await this.userDatabase.updateUser(id, userData);
        const user = this.convertDatabaseModelToUser(userDatabaseModel);
        return user;
    }

    public async deleteUser(id: string): Promise<boolean> {
        const isUserExist = await this.userDatabase.checkUserExistenceById(id);
        if (!isUserExist) {
            throw new Error(`User with id: ${id} does not exist`);
        }

        const isDeleted = await this.userDatabase.deleteUser(id);
        return isDeleted;
    }

    public async addUsersToGroup(
        groupId: string,
        usersIds: string[],
    ): Promise<boolean> {
        const validationResult = this.validator.validateUsersIds(usersIds);
        if (validationResult.isValidationFail!()) {
            throw validationResult;
        }

        const isGroupExist = await this.groupDatabase.checkGroupExistenceById(groupId);
        if (!isGroupExist) {
            throw new Error(`Group with id: ${groupId} does not exist`);
        }

        for (const userId of usersIds) {
            const isUserExist = await this.userDatabase.checkUserExistenceById(userId);
            if (!isUserExist) {
                throw new Error(`User with id: ${userId} does not exits`);
            }

            const isUserBelongsToGroup = await this.userDatabase
                .checkUserBelongsToGroup(userId, groupId);
            if (isUserBelongsToGroup) {
                throw new Error(`User with id: ${userId} already in the group with id: ${groupId}`);
            }
        }

        const areUsersAdded = await this.userDatabase.addUsersToGroup(groupId, usersIds);
        return areUsersAdded;
    }
}
