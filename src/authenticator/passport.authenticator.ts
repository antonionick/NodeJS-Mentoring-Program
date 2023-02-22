import passport from 'passport';
import passportLocal from 'passport-local';
import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const JWS_PRIVATE_KEY = 'BOmFMo26Atavb7Ek6UJm';
const JWS_COMMON_OPTIONS = {
    expiresIn: '1h',
};

export enum PassportStrategy {
    Local = 'local',
}

export class PassportAuthenticator {
    private static instance: PassportAuthenticator;

    public static init(
        userDatabase: IUserDatabaseAPI,
    ): PassportAuthenticator {
        if (!this.instance) {
            this.instance = new PassportAuthenticator(userDatabase);
        }
        return this.instance;
    }

    private constructor(
        private readonly userDatabase: IUserDatabaseAPI,
    ) {
        this.initLocalStrategy();
    }

    private initLocalStrategy(): void {
        const strategyOptions: passportLocal.IStrategyOptions = {
            usernameField: 'email',
            session: false,
        };
        const localStrategy = new passportLocal.Strategy(
            strategyOptions, this.localStrategyHandler.bind(this));

        passport.use(localStrategy);
    }

    private async localStrategyHandler(
        login: string,
        password: string,
        callback: Function,
    ): Promise<void> {
        const userDatabaseResult = await this.userDatabase.getUserByLogin(login);
        if (userDatabaseResult.hasError!()) {
            return callback(userDatabaseResult.error);
        }

        const userDatabaseModel = userDatabaseResult.data!;
        const isPasswordMatch = userDatabaseModel?.password === password;
        if (!userDatabaseModel || !isPasswordMatch) {
            return callback(null, false);
        }

        callback(null, userDatabaseModel);
    }

    public getLocalStrategyAuthenticator(): RequestHandler {
        const authenticateOptions = { session: false };
        return passport.authenticate(PassportStrategy.Local, authenticateOptions);
    }

    public login(email: string, password: string): string {
        const jwsPayload = { email, password };
        const token = jwt.sign(jwsPayload, JWS_PRIVATE_KEY, JWS_COMMON_OPTIONS);
        return token;
    }
}
