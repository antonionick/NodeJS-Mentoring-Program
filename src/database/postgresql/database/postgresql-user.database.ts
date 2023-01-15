import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { IUserDatabaseModel, IUserDataToCreate, IUserDataToUpdate } from '@components/user/user.models';
import { PostgreSQLUsersTableColumn } from '@database/postgresql/models/postgresql-user.models';
import { randomUUID } from 'crypto';
import { Model, ModelCtor, Op } from 'sequelize';

const IS_DELETED_COMMON_QUERY = {
    [Op.not]: true,
};

export class PostgreSQLUserDatabase implements IUserDatabaseAPI {
    constructor(
        private readonly userDatabaseInstance: ModelCtor<Model>,
    ) { }

    public async getUserById(
        userId: string,
    ): Promise<IUserDatabaseModel> {
        const userSequelizeModel = await this.userDatabaseInstance.findOne({
            where: {
                [PostgreSQLUsersTableColumn.userId]: userId,
                [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
            },
        });

        return userSequelizeModel
            ? this.convertSequelizeModelToDatabaseModel(userSequelizeModel)
            : null!;
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
    }

    public async createUser(
        userData: IUserDataToCreate,
    ): Promise<IUserDatabaseModel> {
        const userId = randomUUID();
        const createdUserSequelizeModel = await this.userDatabaseInstance.create({
            [PostgreSQLUsersTableColumn.userId]: userId,
            [PostgreSQLUsersTableColumn.login]: userData.login,
            [PostgreSQLUsersTableColumn.password]: userData.password,
            [PostgreSQLUsersTableColumn.age]: userData.age,
        });

        const userDatabaseModel = this.convertSequelizeModelToDatabaseModel(createdUserSequelizeModel);
        return userDatabaseModel;
    }

    public async updateUser(
        id: string,
        userData: IUserDataToUpdate,
    ): Promise<IUserDatabaseModel> {
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
    }

    public async deleteUser(
        id: string,
    ): Promise<boolean> {
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
    }

    public async checkUserExistenceById(
        userId: string,
    ): Promise<boolean> {
        const userSequelizeModel = await this.userDatabaseInstance.findOne({
            where: {
                [PostgreSQLUsersTableColumn.userId]: userId,
                [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
            },
        });
        return !!userSequelizeModel;
    }

    public async checkUserExistenceByLogin(
        login: string,
    ): Promise<boolean> {
        const userSequelizeModel = await this.userDatabaseInstance.findOne({
            where: {
                [PostgreSQLUsersTableColumn.login]: login,
                [PostgreSQLUsersTableColumn.isDeleted]: IS_DELETED_COMMON_QUERY,
            },
        });
        return !!userSequelizeModel;
    }
}