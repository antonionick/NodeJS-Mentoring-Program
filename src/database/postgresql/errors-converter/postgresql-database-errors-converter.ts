import { BaseError, UniqueConstraintError  } from 'sequelize';
import { DatabaseError } from '@database/models/database-error';
import { DatabaseErrorItem } from '@database/models/database-error-item';

export class PostgreSQLDatabaseErrorsConverter {
    public convertPostgreSQLError(
        error: BaseError,
    ): DatabaseError {
        if (error instanceof UniqueConstraintError) {
            return this.convertUniqueDatabaseError(error);
        }

        return this.convertCommonDatabaseError(error);
    }

    private convertUniqueDatabaseError(
        error: UniqueConstraintError,
    ): DatabaseError {
        const validationErrorItems = error.errors;
        const errorItems = validationErrorItems.map(validationErrorItem => {
            const databaseError = new DatabaseErrorItem({
                value: validationErrorItem.value!,
                message: validationErrorItem.message,
            });
            return databaseError;
        });
        const databaseError = new DatabaseError({ errorItems });
        return databaseError;
    }

    private convertCommonDatabaseError(error: BaseError): DatabaseError {
        const errorItem = new DatabaseErrorItem({ message: error.message });
        const databaseError = new DatabaseError({ errorItems: [errorItem] });
        return databaseError;
    }
}
