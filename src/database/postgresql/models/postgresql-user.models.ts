import { DataTypes } from 'sequelize';
import { Model, Table, Sequelize } from 'sequelize-typescript';
import { randomUUID } from 'crypto';
import { Column } from 'sequelize-typescript/dist/model/column/column';
import { AllowNull } from 'sequelize-typescript/dist/model/column/column-options/allow-null';
import { Unique } from 'sequelize-typescript/dist/model/column/column-options/unique';

export const POSTGRESQL_USERS_TABLE_NAME = 'Users';

export enum PostgreSQLUsersTableColumn {
    id = 'id',
    userId = 'userId',
    login = 'login',
    password = 'password',
    age = 'age',
    isDeleted = 'isDeleted'
}

@Table({
    modelName: POSTGRESQL_USERS_TABLE_NAME,
    timestamps: false,
})
export class SequelizeUserModel extends Model {
    @Unique(true)
    @AllowNull(false)
    @Column(DataTypes.UUID)
    public [PostgreSQLUsersTableColumn.userId]: string;

    @Unique(true)
    @AllowNull(false)
    @Column(DataTypes.STRING)
    public [PostgreSQLUsersTableColumn.login]: string;

    @AllowNull(false)
    @Column(DataTypes.STRING(80))
    public [PostgreSQLUsersTableColumn.password]: string;

    @AllowNull(false)
    @Column(DataTypes.SMALLINT)
    public [PostgreSQLUsersTableColumn.age]: number;

    @Column(DataTypes.BOOLEAN)
    public [PostgreSQLUsersTableColumn.isDeleted]: boolean;
}

async function initUsersPostgreSQLSequelizeModel(
    sequelize: Sequelize,
): Promise<void> {
    sequelize.addModels([SequelizeUserModel]);
    await SequelizeUserModel.sync();
}

async function checkAndAddPredefinedData(): Promise<void> {
    const isTableEmpty = !await SequelizeUserModel.findOne();
    if (isTableEmpty) {
        await SequelizeUserModel.bulkCreate([
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
    await initUsersPostgreSQLSequelizeModel(sequelize);
    await checkAndAddPredefinedData();
}
