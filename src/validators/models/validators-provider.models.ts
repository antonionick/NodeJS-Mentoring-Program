import type { IUserValidatorAPI } from '@components/user/api/user-validator.api';

export interface IValidatorProvider {
    getUserValidator(): IUserValidatorAPI;
}
