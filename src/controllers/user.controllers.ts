import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { IUserValidatorAPI } from '@components/user/api/user-validator.api';
import type { IUserDataToCreate, IUserDataToUpdate } from '@components/user/user.models';
import { UserService } from '@components/user/user.service';
import { UserInMemoryDatabase } from '@database/user-in-memory.database';
import { UserJoiValidator } from '@validators/user/joi/user-joi-validator';
import type { NextFunction, Request, Response } from 'express';

export class UserController {
    private static userService: UserService;
    private static userDatabase: IUserDatabaseAPI;
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
                .status(200)
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
                .status(200)
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
                .status(200)
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
                .status(200)
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
                .status(200)
                .send(isDeleted);
            next();
        } catch (err) {
            next(err);
        }
    }

    private static getUserService(): UserService {
        if (!UserController.userService) {
            const userDatabase = UserController.getUserDatabase();
            const userValidator = UserController.getUserValidator();
            const userService = new UserService(userDatabase, userValidator);
            UserController.userService = userService;
        }
        return UserController.userService;
    }

    private static getUserDatabase(): IUserDatabaseAPI {
        if (!UserController.userDatabase) {
            const userDatabase = new UserInMemoryDatabase();
            UserController.userDatabase = userDatabase;
        }
        return UserController.userDatabase;
    }

    private static getUserValidator(): IUserValidatorAPI {
        if (!UserController.userValidator) {
            const userValidator = new UserJoiValidator();
            UserController.userValidator = userValidator;
        }
        return UserController.userValidator;
    }
}
