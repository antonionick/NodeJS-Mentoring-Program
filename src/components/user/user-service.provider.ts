import { UserService } from '@components/user/user.service';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';

export class UserServiceProvider {
    private userServiceInstance: UserService;

    public provideUserService(
        databaseProvider: IDatabaseProvider,
        validatorProvider: IValidatorProvider,
    ): UserService {
        if (!this.userServiceInstance) {
            const userDatabase = databaseProvider.getUserDatabase();
            const groupDatabase = databaseProvider.getGroupDatabase();
            const userValidator = validatorProvider.getUserValidator();
            const userService = new UserService(userDatabase, groupDatabase, userValidator);
            this.userServiceInstance = userService;
        }
        return this.userServiceInstance;
    }
}
