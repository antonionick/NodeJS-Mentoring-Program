import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { IUserDatabaseModel, IUserDataToCreate, IUserDataToUpdate } from '@components/user/user.models';
import type { PostgreSQLDatabaseErrorsConverter } from '@database/postgresql/errors-converter/postgresql-database-errors-converter';
import { PostgreSQLUsersTableColumn } from '@database/postgresql/models/postgresql-user.models';
import { randomUUID } from 'crypto';
import { BaseError, Model, ModelCtor, Op } from 'sequelize';

const IS_DELETED_COMMON_QUERY = {
    [Op.not]: true,
};

export class PostgreSQLUserDatabase implements IUserDatabaseAPI {
    constructor(
        private readonly userDatabaseInstance: ModelCtor<Model>,
        private readonly errorsConverter: PostgreSQLDatabaseErrorsConverter,
    ) { }

    public async getUserById(
        userId: string,
    ): Promise<IUserDatabaseModel> {
        try {
            const userSequelizeModel = await this.userDatabaseInstance.findOne({
                where: {
                    [PostgreSQLUsersTableColumn.userId]: userId,
                    [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
                },
            });

            return userSequelizeModel
                ? this.convertSequelizeModelToDatabaseModel(userSequelizeModel)
                : null!;
        } catch (error: unknown) {
            if (error instanceof BaseError) {
                const databaseError = this.errorsConverter.convertPostgreSQLError(error as any);
                throw databaseError;
            }
            throw error;
        }
    }

    private convertSequelizeModelToDatabaseModel(
        userSequelizeModel: Model,
    ): IUserDatabaseModel {
        const dataValues = userSequelizeModel.dataValues;

        const userDatabaseModel: IUserDatabaseModel = {
            id: dataValues.userId,
            login: dataValues.login,
            password: dataValues.password,
            age: dataValues.age,
            isDeleted: dataValues.isDeleted,
        };
        return userDatabaseModel;
    }

    public async getAutoSuggestUsers(
        loginSubstring: string,
        limit: number,
    ): Promise<IUserDatabaseModel[]> {
        try {
            const userSequelizeModel = await this.userDatabaseInstance.findAll({
                where: {
                    [PostgreSQLUsersTableColumn.login]: {
                        [Op.substring]: loginSubstring,
                    },
                },
                order: [
                    [PostgreSQLUsersTableColumn.login, 'ASC'],
                ],
                limit,
            });

            const usersDatabaseModels = userSequelizeModel
                .map(this.convertSequelizeModelToDatabaseModel.bind(this));
            return usersDatabaseModels;
        } catch (error: unknown) {
            if (error instanceof BaseError) {
                const databaseError = this.errorsConverter.convertPostgreSQLError(error as any);
                throw databaseError;
            }
            throw error;
        }
    }

    public async createUser(
        userData: IUserDataToCreate,
    ): Promise<IUserDatabaseModel> {
        try {
            const userId = randomUUID();
            const createdUserSequelizeModel = await this.userDatabaseInstance.create({
                [PostgreSQLUsersTableColumn.userId]: userId,
                [PostgreSQLUsersTableColumn.login]: userData.login,
                [PostgreSQLUsersTableColumn.password]: userData.password,
                [PostgreSQLUsersTableColumn.age]: userData.age,
            });

            const userDatabaseModel = this.convertSequelizeModelToDatabaseModel(createdUserSequelizeModel);
            return userDatabaseModel;
        } catch (error: unknown) {
            if (error instanceof BaseError) {
                const databaseError = this.errorsConverter.convertPostgreSQLError(error as any);
                throw databaseError;
            }
            throw error;
        }
    }

    public async updateUser(
        id: string,
        userData: IUserDataToUpdate,
    ): Promise<IUserDatabaseModel> {
        try {
            await this.userDatabaseInstance.update(
                {
                    [PostgreSQLUsersTableColumn.age]: userData.age,
                    [PostgreSQLUsersTableColumn.password]: userData.password,
                },
                {
                    where: {
                        [PostgreSQLUsersTableColumn.userId]: id,
                        [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
                    },
                },
            );

            return await this.getUserById(id);
        } catch (error: unknown) {
            if (error instanceof BaseError) {
                const databaseError = this.errorsConverter.convertPostgreSQLError(error);
                throw databaseError;
            }
            throw error;
        }
    }

    public async deleteUser(
        id: string,
    ): Promise<boolean> {
        try {
            const [affectedCount] = await this.userDatabaseInstance.update(
                {
                    [PostgreSQLUsersTableColumn.isDeleted]: true,
                },
                {
                    where: {
                        [PostgreSQLUsersTableColumn.userId]: id,
                        [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
                    },
                },
            );
            return !!affectedCount;
        } catch (error: unknown) {
            if (error instanceof BaseError) {
                const databaseError = this.errorsConverter.convertPostgreSQLError(error);
                throw databaseError;
            }
            throw error
        }
    }

    public async checkUserExistenceById(
        userId: string,
    ): Promise<boolean> {
        try {
            const userSequelizeModel = await this.userDatabaseInstance.findOne({
                where: {
                    [PostgreSQLUsersTableColumn.userId]: userId,
                    [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
                },
            });
            return !!userSequelizeModel;
        } catch (error: unknown) {
            if (error instanceof BaseError) {
                const databaseError = this.errorsConverter.convertPostgreSQLError(error);
                throw databaseError;
            }
            throw error
        }
    }

    public async checkUserExistenceByLogin(
        login: string,
    ): Promise<boolean> {
        try {
            const userSequelizeModel = await this.userDatabaseInstance.findOne({
                where: {
                    [PostgreSQLUsersTableColumn.login]: login,
                    [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
                },
            });
            return !!userSequelizeModel;
        } catch (error) {
            if (error instanceof BaseError) {
                const databaseError = this.errorsConverter.convertPostgreSQLError(error);
                throw databaseError;
            }
            throw error
        }
    }
}
