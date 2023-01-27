import type { PostgreSQLDatabaseErrorsConverter } from '@database/postgresql/errors-converter/postgresql-database-errors-converter';
import { BaseError } from 'sequelize';

export abstract class PostgreSQLBaseDatabase {
    constructor(
        protected readonly errorsConverter: PostgreSQLDatabaseErrorsConverter,
    ) { }

    protected handlerError(error: unknown): never {
        if (error instanceof BaseError) {
            const databaseError = this.errorsConverter.convertPostgreSQLError(error);
            throw databaseError;
        }
        throw error;
    }
}
