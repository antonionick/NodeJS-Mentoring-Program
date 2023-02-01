import { ValidationError } from '@validators/models/validation-error';
import { ValidationResult } from '@validators/models/validation-result';
import { ValidationStatus } from '@validators/models/validation-status';
import type Joi from 'joi';

const COMMON_JOI_VALIDATION_OPTIONS = { abortEarly: false };

export class JoiValidatorBase {
    protected validate(
        data: unknown,
        schema: Joi.ObjectSchema,
    ): ValidationResult {
        const joiValidationResult = schema.validate(
            data,
            COMMON_JOI_VALIDATION_OPTIONS,
        );

        const validationResult = this.convertJoiValidationResult(joiValidationResult);
        return validationResult;
    }

    protected convertJoiValidationResult(
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
}
