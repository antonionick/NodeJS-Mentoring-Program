import type { Options } from 'sequelize';

export const POSTGRESQL_SEQUELIZE_OPTIONS: Options = {
    define: {
        freezeTableName: true,
    },
};
