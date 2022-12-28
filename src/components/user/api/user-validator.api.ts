import type { ValidationResult } from '@common/validation/validation-result';
import type { IUserDataToCreate, IUserDataToUpdate } from '@components/user/user.models';

export interface IUserValidatorAPI {
    validateUserDataToCreate(
        userDataToCreate: IUserDataToCreate,
    ): ValidationResult;

    validateUserDataToUpdate(
        userDataToUpdate: IUserDataToUpdate,
    ): ValidationResult;

    validateAutosuggestParams(
        loginSubstring: string,
        limit: number,
    ): ValidationResult;
}
