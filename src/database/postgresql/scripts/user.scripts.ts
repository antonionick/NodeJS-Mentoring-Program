import { UsersTableColumn, USERS_TABLE_NAME } from '@database/models/tables/users-table.models';
import type { Client } from 'pg';

const USER_CREATE_DATABASE_SCRIPT = `
    create table ${USERS_TABLE_NAME} (
        id serial primary key,
        ${UsersTableColumn.userId} uuid unique not null,
        ${UsersTableColumn.login} varchar(255) unique not null,
        ${UsersTableColumn.password} varchar(80) not null,
        ${UsersTableColumn.age} smallint not null,
        ${UsersTableColumn.isDeleted} boolean
    );
`;

const USER_ADD_PREDEFINED_DATA_SCRIPT = `
    insert into
        ${USERS_TABLE_NAME} (
            ${UsersTableColumn.userId},
            ${UsersTableColumn.login},
            ${UsersTableColumn.password},
            ${UsersTableColumn.age}
        )
    values
        (gen_random_uuid(), 'login_example1@mail.com', 'password1', 21),
        (gen_random_uuid(), 'login_example2@mail.com', 'password2', 22),
        (gen_random_uuid(), 'login_example3@mail.com', 'password3', 23),
        (gen_random_uuid(), 'login_example4@mail.com', 'password4', 24);
`;

const CHECK_IF_USERS_TABLE_EXISTS_SCRIPT = `
    select *
        from information_schema.tables
        where table_name = '${USERS_TABLE_NAME.toLowerCase()}'
`;

export async function initUsersTableAndInsertPredefinedData(
    client: Client,
): Promise<void> {
    const tableExistenceResponse = await client.query(CHECK_IF_USERS_TABLE_EXISTS_SCRIPT);
    if (tableExistenceResponse.rowCount === 0) {
        await client.query(`
            ${USER_CREATE_DATABASE_SCRIPT}
            ${USER_ADD_PREDEFINED_DATA_SCRIPT}
        `);
    }
}
