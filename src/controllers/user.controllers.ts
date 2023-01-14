import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { IUserValidatorAPI } from '@components/user/api/user-validator.api';
import type { IUserDataToCreate, IUserDataToUpdate } from '@components/user/user.models';
import { UserService } from '@components/user/user.service';
import { UserInMemoryDatabase } from '@database/in-memory/user-in-memory.database';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import { UserJoiValidator } from '@validators/user/joi/user-joi-validator';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes';

export class UserController {
    public static databaseProvider: IDatabaseProvider;

    private static userService: UserService;
    private static userValidator: IUserValidatorAPI;

    public static async getUserById(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const userService = UserController.getUserService();
        const id = request.params.id;

        try {
            const user = await userService.getUserById(id);
            response
                .status(StatusCodes.OK)
                .json(user);
            next();
        } catch (err) {
            next(err);
        }
    }

    public static async getAutosuggest(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const userService = UserController.getUserService();
        const { limit, loginSubstring } = request.query;

        try {
            const autosuggestUsers = await userService
                .getAutosuggestUsers(loginSubstring as string, Number(limit));

            response
                .status(StatusCodes.OK)
                .json(autosuggestUsers);
            next();
        } catch (err) {
            next(err);
        }
    }

    public static async createUser(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const userService = UserController.getUserService();
        const userDataToCreate = UserController.getUserDataToCreate(request);

        try {
            const user = await userService.createUser(userDataToCreate);
            response
                .status(StatusCodes.OK)
                .json(user);
            next();
        } catch (err) {
            next(err);
        }
    }

    private static getUserDataToCreate({ body }: Request): IUserDataToCreate {
        return {
            login: body.login,
            password: body.password,
            age: body.age,
        };
    }

    public static async updateUser(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const userService = UserController.getUserService();
        const userDataToUpdate = UserController.getUserDataToUpdate(request);
        const userIdToUpdate = request.params.id;

        try {
            const user = await userService.updateUser(userIdToUpdate, userDataToUpdate);
            response
                .status(StatusCodes.OK)
                .json(user);
            next();
        } catch (err) {
            next(err);
        }
    }

    private static getUserDataToUpdate({ body }: Request): IUserDataToUpdate {
        return {
            age: body.age,
            password: body.password,
        };
    }

    public static async deleteUser(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        const userService = UserController.getUserService();
        const userIdToDelete = request.params.id;

        try {
            const isDeleted = await userService.deleteUser(userIdToDelete);
            response
                .status(StatusCodes.OK)
                .send(isDeleted);
            next();
        } catch (err) {
            next(err);
        }
    }

    private static getUserService(): UserService {
        if (!UserController.userService) {
            const userDatabase = UserController.databaseProvider.getUserDatabase();
            const userValidator = UserController.getUserValidator();
            const userService = new UserService(userDatabase, userValidator);
            UserController.userService = userService;
        }
        return UserController.userService;
    }

    private static getUserValidator(): IUserValidatorAPI {
        if (!UserController.userValidator) {
            const userValidator = new UserJoiValidator();
            UserController.userValidator = userValidator;
        }
        return UserController.userValidator;
    }
}
