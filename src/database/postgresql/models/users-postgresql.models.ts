import { UsersTableColumn, USERS_TABLE_NAME } from '@database/models/tables/users-table.models';
import { Sequelize, Model, ModelCtor, DataTypes } from 'sequelize';
import { randomUUID } from 'crypto';

const SEQUELIZE_USERS_MODEL = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    [UsersTableColumn.userId]: {
        type: DataTypes.UUID,
        unique: true,
        allowNull: false,
    },
    [UsersTableColumn.login]: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    [UsersTableColumn.password]: {
        type: DataTypes.STRING(80),
        allowNull: false,
    },
    [UsersTableColumn.age]: {
        type: DataTypes.SMALLINT,
        allowNull: false,
    },
    [UsersTableColumn.isDeleted]: {
        type: DataTypes.BOOLEAN,
    },
};

async function checkAndAddPredefinedData(
    UserModel: ModelCtor<Model<any, any>>,
): Promise<void> {
    const isTableEmpty = !await UserModel.findOne();
    if (isTableEmpty) {
        await UserModel.bulkCreate([
            {
                userId: randomUUID(),
                login: 'login_example1@mail.com',
                password: 'password1',
                age: 21,
            },
            {
                userId: randomUUID(),
                login: 'login_example2@mail.com',
                password: 'password2',
                age: 22,
            },
            {
                userId: randomUUID(),
                login: 'login_example3@mail.com',
                password: 'password3',
                age: 23,
            },
            {
                userId: randomUUID(),
                login: 'login_example4@mail.com',
                password: 'password4',
                age: 24,
            },
        ]);
    }
}

async function initUsersPostgreSQLSequelizeModel(
    sequelize: Sequelize,
): Promise<ModelCtor<Model<any, any>>> {
    const UsersModel = sequelize.define(
        USERS_TABLE_NAME,
        SEQUELIZE_USERS_MODEL,
    );

    await UsersModel.sync();
    return UsersModel;
}

export async function initUsersPostgreSQLModelAndAddPredefinedData(
    sequelize: Sequelize,
): Promise<void> {
    const UsersModel = await initUsersPostgreSQLSequelizeModel(sequelize);
    await checkAndAddPredefinedData(UsersModel);
}
