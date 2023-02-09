import { DatabaseResult } from '@database/models/database-result';
import type { PostgreSQLDatabaseErrorsConverter } from '@database/postgresql/errors-converter/postgresql-database-errors-converter';
import { BaseError } from 'sequelize';

export abstract class PostgreSQLBaseDatabase {
    constructor(
        protected readonly errorsConverter: PostgreSQLDatabaseErrorsConverter,
    ) { }

    protected handlerError(error: unknown): DatabaseResult {
        let databaseError: unknown = error;
        if (error instanceof BaseError) {
            databaseError = this.errorsConverter.convertPostgreSQLError(error);
        }

        return new DatabaseResult({
            error: databaseError as Error,
        });
    }
}
