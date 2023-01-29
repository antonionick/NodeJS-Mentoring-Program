import type { IUserDataToCreate, IUserDataToUpdate } from '@components/user/user.models';
import type { ValidationResult } from '@validators/models/validation-result';

export interface IUserValidatorAPI {
    validateUserDataToCreate(userDataToCreate: IUserDataToCreate): ValidationResult;
    validateUserDataToUpdate(userDataToUpdate: IUserDataToUpdate): ValidationResult;
    validateAutosuggestParams(loginSubstring: string, limit: number): ValidationResult;
    validateUsersIds(usersIds: string[]): ValidationResult;
}
