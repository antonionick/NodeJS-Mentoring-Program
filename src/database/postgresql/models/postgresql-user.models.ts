import { Model, Table, BelongsToMany, PrimaryKey, DataType } from 'sequelize-typescript';
import { Column } from 'sequelize-typescript/dist/model/column/column';
import { AllowNull } from 'sequelize-typescript/dist/model/column/column-options/allow-null';
import { Unique } from 'sequelize-typescript/dist/model/column/column-options/unique';
import { SequelizeGroupModel } from '@database/postgresql/models/postgresql-group.models';
import { SequelizeUserGroupModel } from '@database/postgresql/models/postgresql-user-group.models';

export const POSTGRESQL_USERS_TABLE_NAME = 'Users';

export enum PostgreSQLUsersTableColumn {
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
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    public [PostgreSQLUsersTableColumn.userId]: string;

    @Unique(true)
    @AllowNull(false)
    @Column(DataType.STRING)
    public [PostgreSQLUsersTableColumn.login]: string;

    @AllowNull(false)
    @Column(DataType.STRING(80))
    public [PostgreSQLUsersTableColumn.password]: string;

    @AllowNull(false)
    @Column(DataType.SMALLINT)
    public [PostgreSQLUsersTableColumn.age]: number;

    @Column(DataType.BOOLEAN)
    public [PostgreSQLUsersTableColumn.isDeleted]: boolean;

    @BelongsToMany(() => SequelizeGroupModel, () => SequelizeUserGroupModel)
    public groups: SequelizeGroupModel[];
}

export async function checkUsersEmptyAndAddPredefinedData(): Promise<void> {
    const isTableEmpty = !await SequelizeUserModel.findOne();
    if (isTableEmpty) {
        await SequelizeUserModel.bulkCreate([
            {
                [PostgreSQLUsersTableColumn.login]: 'login_example1@mail.com',
                [PostgreSQLUsersTableColumn.password]: 'password1',
                [PostgreSQLUsersTableColumn.age]: 21,
            },
            {
                [PostgreSQLUsersTableColumn.login]: 'login_example2@mail.com',
                [PostgreSQLUsersTableColumn.password]: 'password2',
                [PostgreSQLUsersTableColumn.age]: 22,
            },
            {
                [PostgreSQLUsersTableColumn.login]: 'login_example3@mail.com',
                [PostgreSQLUsersTableColumn.password]: 'password3',
                [PostgreSQLUsersTableColumn.age]: 23,
            },
            {
                [PostgreSQLUsersTableColumn.login]: 'login_example4@mail.com',
                [PostgreSQLUsersTableColumn.password]: 'password4',
                [PostgreSQLUsersTableColumn.age]: 24,
            },
        ]);
    }
}
