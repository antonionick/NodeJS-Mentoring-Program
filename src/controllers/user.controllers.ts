import type { IUserDataToCreate, IUserDataToUpdate } from '@components/user/user.models';
import { UserService } from '@components/user/user.service';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes';

export class UserController {
    private userService: UserService;

    constructor(
        private readonly databaseProvider: IDatabaseProvider,
        private readonly validatorProvider: IValidatorProvider,
    ) { }

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
                next(userServiceResult.error);
                return;
            }

            const user = userServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .json(user);
            next();
        } catch (error) {
            next(error);
        }
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
                next(userServiceResult.error);
                return;
            }

            const autosuggestUsers = userServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .json(autosuggestUsers);
            next();
        } catch (error) {
            next(error);
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
                next(userServiceResult.error);
                return;
            }

            const user = userServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .json(user);
            next();
        } catch (error) {
            next(error);
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
                next(userServiceResult.error);
                return;
            }

            const user = userServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .json(user);
            next();
        } catch (error) {
            next(error);
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
                next(userServiceResult.error);
                return;
            }

            const isDeleted = userServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .send(isDeleted);
            next();
        } catch (error) {
            next(error);
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
                next(userServiceResult.error);
                return;
            }

            const areUsersAdded = userServiceResult.data!;
            response
                .status(StatusCodes.OK)
                .send(areUsersAdded);
        } catch (error) {
            next(error);
        }
    }

    private getUserService(): UserService {
        if (!this.userService) {
            const userDatabase = this.databaseProvider.getUserDatabase();
            const groupDatabase = this.databaseProvider.getGroupDatabase();
            const userValidator = this.validatorProvider.getUserValidator();
            const userService = new UserService(userDatabase, groupDatabase, userValidator);
            this.userService = userService;
        }
        return this.userService;
    }
}
