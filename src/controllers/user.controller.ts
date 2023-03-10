import type { IUserDatabaseModel, IUserDataToCreate, IUserDataToUpdate, UserServiceResult } from '@components/user/user.models';
import type { UserService } from '@components/user/user.service';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes';
import { ErrorHandlerData } from '@common/models/error-handler-data.models';
import type { PassportAuthenticator } from '@authenticator/passport.authenticator';
import type { UserServiceProvider } from '@components/user/user-service.provider';

export class UserController {
    constructor(
        private readonly databaseProvider: IDatabaseProvider,
        private readonly validatorProvider: IValidatorProvider,
        private readonly authenticator: PassportAuthenticator,
        private readonly userServiceProvider: UserServiceProvider,
    ) { }

    public async login(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const userDatabaseModel = request.user as unknown as IUserDatabaseModel;
            const { login, password } = userDatabaseModel;
            const token = this.authenticator.login(login, password);

            response
                .status(StatusCodes.OK)
                .send(token);
        } catch (error: unknown) {
            next(new ErrorHandlerData({ error }));
        }
    }

    public async getUserById(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const userService = this.getUserService();
        const id = request.params.id;

        try {
            const userServiceResult = await userService.getUserById(id);
            if (userServiceResult.hasError!()) {
                const errorHandlerData = this.getErrorHandlerData(userServiceResult)
                next(errorHandlerData);
                return;
            }

            const user = userServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .json(user);

            response.locals.logInfo = userServiceResult.logInfo;
            next();
        } catch (error) {
            next(new ErrorHandlerData({ error }));
        }
    }

    private getErrorHandlerData(userServiceResult: UserServiceResult): ErrorHandlerData {
        return new ErrorHandlerData({
            error: userServiceResult.error,
            logInfo: userServiceResult.logInfo,
        });
    }

    public async getAutosuggest(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const userService = this.getUserService();
        const { limit, loginSubstring } = request.query;

        try {
            const userServiceResult = await userService
                .getAutosuggestUsers(loginSubstring as string, Number(limit));
            if (userServiceResult.hasError!()) {
                const errorHandlerData = this.getErrorHandlerData(userServiceResult)
                next(errorHandlerData);
                return;
            }

            const autosuggestUsers = userServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .json(autosuggestUsers);

            response.locals.logInfo = userServiceResult.logInfo;
            next();
        } catch (error) {
            next(new ErrorHandlerData({ error }));
        }
    }

    public async createUser(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const userService = this.getUserService();
        const userDataToCreate = this.getUserDataToCreate(request);

        try {
            const userServiceResult = await userService.createUser(userDataToCreate);
            if (userServiceResult.hasError!()) {
                const errorHandlerData = this.getErrorHandlerData(userServiceResult)
                next(errorHandlerData);
            }

            const user = userServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .json(user);

            response.locals.logInfo = userServiceResult.logInfo;
            next();
        } catch (error) {
            next(new ErrorHandlerData({ error }));
        }
    }

    private getUserDataToCreate({ body }: Request): IUserDataToCreate {
        return {
            login: body.login,
            password: body.password,
            age: body.age,
        };
    }

    public async updateUser(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const userService = this.getUserService();
        const userDataToUpdate = this.getUserDataToUpdate(request);
        const userIdToUpdate = request.params.id;

        try {
            const userServiceResult = await userService.updateUser(userIdToUpdate, userDataToUpdate);
            if (userServiceResult.hasError!()) {
                const errorHandlerData = this.getErrorHandlerData(userServiceResult)
                next(errorHandlerData);
            }

            const user = userServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .json(user);

            response.locals.logInfo = userServiceResult.logInfo;
            next();
        } catch (error) {
            next(new ErrorHandlerData({ error }));
        }
    }

    private getUserDataToUpdate({ body }: Request): IUserDataToUpdate {
        return {
            age: body.age,
            password: body.password,
        };
    }

    public async deleteUser(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const userService = this.getUserService();
        const userIdToDelete = request.params.id;

        try {
            const userServiceResult = await userService.deleteUser(userIdToDelete);
            if (userServiceResult.hasError!()) {
                const errorHandlerData = this.getErrorHandlerData(userServiceResult)
                next(errorHandlerData);
            }

            const isDeleted = userServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .send(isDeleted);

            response.locals.logInfo = userServiceResult.logInfo;
            next();
        } catch (error) {
            next(new ErrorHandlerData({ error }));
        }
    }

    public async addUsersToGroup(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const userService = this.getUserService();
        const { usersIds: sourceUsersIds, groupId } = request.query;

        try {
            let usersIds = sourceUsersIds;
            if (typeof sourceUsersIds === 'string') {
                usersIds = sourceUsersIds
                    .split(',')
                    .map(userId => userId.trim());
            }

            const userServiceResult = await userService
                .addUsersToGroup(groupId as string, usersIds as string[]);
            if (userServiceResult.hasError!()) {
                const errorHandlerData = this.getErrorHandlerData(userServiceResult)
                next(errorHandlerData);
            }

            const areUsersAdded = userServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .send(areUsersAdded);

            response.locals.logInfo = userServiceResult.logInfo;
            next();
        } catch (error) {
            next(new ErrorHandlerData({ error }));
        }
    }

    private getUserService(): UserService {
        return this.userServiceProvider
            .provideUserService(this.databaseProvider, this.validatorProvider);
    }
}
