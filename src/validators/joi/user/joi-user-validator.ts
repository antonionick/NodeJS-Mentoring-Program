import type { IUserValidatorAPI } from '@components/user/api/user-validator.api';
import type { IUserDataToCreate, IUserDataToUpdate } from '@components/user/user.models';
import { JoiValidatorBase } from '@validators/joi/joi-validator-base';
import { JOI_USER_AUTOSUGGEST_SCHEMA } from '@validators/joi/user/schemas/joi-user-autosuggest.shema';
import { JOI_USER_CREATE_SCHEMA } from '@validators/joi/user/schemas/joi-user-create.schema';
import { JOI_USER_UPDATE_SCHEMA } from '@validators/joi/user/schemas/joi-user-update.schema';
import type { ValidationResult } from '@validators/models/validation-result';

export class JoiUserValidator extends JoiValidatorBase implements IUserValidatorAPI {
    public validateAutosuggestParams(
        loginSubstring: string,
        limit: number,
    ): ValidationResult {
        const dataToValidate = { loginSubstring, limit };
        return this.validate(dataToValidate, JOI_USER_AUTOSUGGEST_SCHEMA);
    }

    public validateUserDataToCreate(
        userDataToCreate: IUserDataToCreate,
    ): ValidationResult {
        return this.validate(userDataToCreate, JOI_USER_CREATE_SCHEMA);
    }

    public validateUserDataToUpdate(
        userDataToUpdate: IUserDataToUpdate,
    ): ValidationResult {
        return this.validate(userDataToUpdate, JOI_USER_UPDATE_SCHEMA);
    }
}
