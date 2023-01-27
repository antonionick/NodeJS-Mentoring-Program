import type { IGroupValidatorAPI } from '@components/group/api/group-validator.api';
import type { IUserValidatorAPI } from '@components/user/api/user-validator.api';
import { GroupValidator } from '@validators/joi/group/joi-group-validator';
import { JoiUserValidator } from '@validators/joi/user/joi-user-validator';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';

export class JoiValidatorProvider implements IValidatorProvider {
    private userValidatorInstance: IUserValidatorAPI;
    private groupValidatorInstance: IGroupValidatorAPI;

    public getUserValidator(): IUserValidatorAPI {
        if (!this.userValidatorInstance) {
            this.userValidatorInstance = new JoiUserValidator();
        }
        return this.userValidatorInstance;
    }

    public getGroupValidator(): IGroupValidatorAPI {
        if (!this.groupValidatorInstance) {
            this.groupValidatorInstance = new GroupValidator();
        }
        return this.groupValidatorInstance;
    }
}
