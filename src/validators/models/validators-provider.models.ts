import type { IGroupValidatorAPI } from '@components/group/api/group-validator.api';
import type { IUserValidatorAPI } from '@components/user/api/user-validator.api';

export interface IValidatorProvider {
    getUserValidator(): IUserValidatorAPI;
    getGroupValidator(): IGroupValidatorAPI;
}
