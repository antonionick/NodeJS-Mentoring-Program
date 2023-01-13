import type { Client } from 'pg';

const USER_CREATE_DATABASE_SCRIPT = `
    create table Users (
        id serial primary key,
        login varchar(255) unique not null,
        password varchar(80) not null,
        age smallint not null,
        isDeleted boolean
    );
`;

const USER_ADD_PREDEFINED_DATA_SCRIPT = `
    insert into
        Users (login, password, age)
    values
        ('login_example1@mail.com', 'password1', 21),
        ('login_example2@mail.com', 'password2', 22),
        ('login_example3@mail.com', 'password3', 23),
        ('login_example4@mail.com', 'password4', 24);
`;

const CHECK_IF_USERS_TABLE_EXISTS_SCRIPT = `
    select *
        from information_schema.tables
        where table_name = 'users'
`;

export async function initUserDatabaseAndInsertPredefinedData(
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
