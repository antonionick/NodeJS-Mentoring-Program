import { Sequelize, Model, ModelCtor, DataTypes } from 'sequelize';
import { randomUUID } from 'crypto';

export const POSTGRESQL_USERS_TABLE_NAME = 'Users';

export enum PostgreSQLUsersTableColumn {
    id = 'id',
    userId = 'userId',
    login = 'login',
    password = 'password',
    age = 'age',
    isDeleted = 'isDeleted'
}

const SEQUELIZE_USERS_MODEL = {
    [PostgreSQLUsersTableColumn.id]: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    [PostgreSQLUsersTableColumn.userId]: {
        type: DataTypes.UUID,
        unique: true,
        allowNull: false,
    },
    [PostgreSQLUsersTableColumn.login]: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    [PostgreSQLUsersTableColumn.password]: {
        type: DataTypes.STRING(80),
        allowNull: false,
    },
    [PostgreSQLUsersTableColumn.age]: {
        type: DataTypes.SMALLINT,
        allowNull: false,
    },
    [PostgreSQLUsersTableColumn.isDeleted]: {
        type: DataTypes.BOOLEAN,
    },
};

const SEQUELIZE_USERS_OPTIONS = {
    timestamps: false,
};

async function initUsersPostgreSQLSequelizeModel(
    sequelize: Sequelize,
): Promise<ModelCtor<Model>> {
    const UsersModel = sequelize.define(
        POSTGRESQL_USERS_TABLE_NAME,
        SEQUELIZE_USERS_MODEL,
        SEQUELIZE_USERS_OPTIONS,
    );

    await UsersModel.sync();
    return UsersModel;
}

async function checkAndAddPredefinedData(
    usersDatabaseInstance: ModelCtor<Model>,
): Promise<void> {
    const isTableEmpty = !await usersDatabaseInstance.findOne();
    if (isTableEmpty) {
        await usersDatabaseInstance.bulkCreate([
            {
                [PostgreSQLUsersTableColumn.userId]: randomUUID(),
                [PostgreSQLUsersTableColumn.login]: 'login_example1@mail.com',
                [PostgreSQLUsersTableColumn.password]: 'password1',
                [PostgreSQLUsersTableColumn.age]: 21,
            },
            {
                [PostgreSQLUsersTableColumn.userId]: randomUUID(),
                [PostgreSQLUsersTableColumn.login]: 'login_example2@mail.com',
                [PostgreSQLUsersTableColumn.password]: 'password2',
                [PostgreSQLUsersTableColumn.age]: 22,
            },
            {
                [PostgreSQLUsersTableColumn.userId]: randomUUID(),
                [PostgreSQLUsersTableColumn.login]: 'login_example3@mail.com',
                [PostgreSQLUsersTableColumn.password]: 'password3',
                [PostgreSQLUsersTableColumn.age]: 23,
            },
            {
                [PostgreSQLUsersTableColumn.userId]: randomUUID(),
                [PostgreSQLUsersTableColumn.login]: 'login_example4@mail.com',
                [PostgreSQLUsersTableColumn.password]: 'password4',
                [PostgreSQLUsersTableColumn.age]: 24,
            },
        ]);
    }
}

export async function initUsersPostgreSQLModelAndAddPredefinedData(
    sequelize: Sequelize,
): Promise<void> {
    const usersDatabaseInstance = await initUsersPostgreSQLSequelizeModel(sequelize);
    await checkAndAddPredefinedData(usersDatabaseInstance);
}
