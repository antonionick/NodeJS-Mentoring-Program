import { Initializable } from '@common/utils/initializable';

export class AuthenticatorError extends Initializable<AuthenticatorError> {
    public readonly message: string;

    constructor(init: AuthenticatorError) {
        super();

        this.initialize!(init);
    }
}
