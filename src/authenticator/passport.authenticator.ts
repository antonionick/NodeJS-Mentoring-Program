import passport from 'passport';
import passportLocal from 'passport-local';
import passportHttpBearer from 'passport-http-bearer';
import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { RequestHandler } from 'express';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { ErrorHandlerData } from '@common/models/error-handler-data.models';
import { AuthenticatorError } from '@authenticator/models/authenticator-error';

const JWS_PRIVATE_KEY = `BOmFMo26Atavb7Ek6UJm${Date.now()}`;
const JWS_COMMON_OPTIONS = {
    expiresIn: '1h',
};

export enum PassportStrategy {
    Local = 'local',
    Bearer = 'bearer',
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
        this.initBearerStrategy();
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

    private initBearerStrategy(): void {
        const bearerStrategy = new passportHttpBearer.Strategy(
            this.bearerStrategyHandler.bind(this));
        passport.use(bearerStrategy);
    }

    private async bearerStrategyHandler(
        token: string,
        callback: Function,
    ): Promise<void> {
        try {
            const result = jwt.verify(token, JWS_PRIVATE_KEY);
            return callback(null, result);
        } catch (error: unknown) {
            const errorHandlerData = this.getErrorHandlerData(error);
            callback(errorHandlerData);
        }
    }

    public getLocalStrategyAuthenticator(): RequestHandler {
        const authenticateOptions = { session: false };
        return passport.authenticate(PassportStrategy.Local, authenticateOptions);
    }

    public getBearerStrategyAuthenticator(): RequestHandler {
        const authenticateOptions = { session: false };
        return passport.authenticate(PassportStrategy.Bearer, authenticateOptions);
    }

    public login(email: string, password: string): string {
        const jwsPayload = { email, password };
        const token = jwt.sign(jwsPayload, JWS_PRIVATE_KEY, JWS_COMMON_OPTIONS);
        return token;
    }

    private getErrorHandlerData(sourceError: unknown): ErrorHandlerData {
        let error = sourceError;
        if (sourceError instanceof JsonWebTokenError) {
            error = this.convertJWTError(sourceError);
        }
        return new ErrorHandlerData({ error });
    }

    private convertJWTError(error: JsonWebTokenError): AuthenticatorError {
        return new AuthenticatorError({
            message: error.message,
        });
    }
}
