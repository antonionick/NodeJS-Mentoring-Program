import type { IUserValidatorAPI } from '@components/user/api/user-validator.api';
import { JoiUserValidator } from '@validators/joi/user/joi-user-validator';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';

export class JoiValidatorProvider implements IValidatorProvider {
    private userValidatorInstance: IUserValidatorAPI;

    public getUserValidator(): IUserValidatorAPI {
        if (!this.userValidatorInstance) {
            this.userValidatorInstance = new JoiUserValidator();
        }
        return this.userValidatorInstance;
    }
}
