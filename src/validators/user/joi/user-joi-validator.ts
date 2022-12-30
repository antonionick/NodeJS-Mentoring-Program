import { ValidationError } from '@common/validation/validation-error';
import { ValidationResult } from '@common/validation/validation-result';
import { ValidationStatus } from '@common/validation/validation-status';
import type { IUserValidatorAPI } from '@components/user/api/user-validator.api';
import type { IUserDataToCreate, IUserDataToUpdate } from '@components/user/user.models';
import { USER_JOI_AUTOSUGGEST_SCHEMA } from '@validators/user/joi/schemas/user-joi-autosuggest.shema';
import { USER_JOI_CREATE_SCHEMA } from '@validators/user/joi/schemas/user-joi-create.schema';
import { USER_JOI_UPDATE_SCHEMA } from '@validators/user/joi/schemas/user-joi-update.schema';
import type Joi from 'joi';

const COMMON_JOI_VALIDATION_OPTIONS = { abortEarly: false };

export class UserJoiValidator implements IUserValidatorAPI {
    public validateAutosuggestParams(
        loginSubstring: string,
        limit: number,
    ): ValidationResult {
        const joiValidationResult = USER_JOI_AUTOSUGGEST_SCHEMA.validate(
            { loginSubstring, limit },
            COMMON_JOI_VALIDATION_OPTIONS,
        );
        const validationResult = this.convertJoiValidationResult(joiValidationResult);
        return validationResult;
    }

    private convertJoiValidationResult(
        { error }: Joi.ValidationResult,
    ): ValidationResult {
        if (!error?.isJoi) {
            return new ValidationResult({ status: ValidationStatus.Success });
        }

        const validationErrors = error.details.map(detail => {
            const validationError = new ValidationError({
                path: detail.path.toString(),
                message: detail.message,
            });
            return validationError;
        });

        return new ValidationResult({
            status: ValidationStatus.Fail,
            errors: validationErrors,
        });
    }

    public validateUserDataToCreate(
        userDataToCreate: IUserDataToCreate,
    ): ValidationResult {
        const joiValidationResult = USER_JOI_CREATE_SCHEMA.validate(
            userDataToCreate,
            COMMON_JOI_VALIDATION_OPTIONS,
        );
        const validationResult = this.convertJoiValidationResult(joiValidationResult);
        return validationResult;
    }

    public validateUserDataToUpdate(
        userDataToUpdate: IUserDataToUpdate,
    ): ValidationResult {
        const joiValidationResult = USER_JOI_UPDATE_SCHEMA.validate(
            userDataToUpdate,
            COMMON_JOI_VALIDATION_OPTIONS,
        );
        const validationResult = this.convertJoiValidationResult(joiValidationResult);
        return validationResult;
    }
}
