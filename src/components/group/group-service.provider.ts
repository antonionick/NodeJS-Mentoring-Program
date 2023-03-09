import { GroupService } from '@components/group/group.service';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';

export class GroupServiceProvider {
    private groupServiceInstance: GroupService;

    public provideGroupService(
        databaseProvider: IDatabaseProvider,
        validatorProvider: IValidatorProvider,
    ): GroupService {
        if (!this.groupServiceInstance) {
            const database = databaseProvider.getGroupDatabase();
            const validator = validatorProvider.getGroupValidator();
            this.groupServiceInstance = new GroupService(database, validator);
        }
        return this.groupServiceInstance;
    }
}
