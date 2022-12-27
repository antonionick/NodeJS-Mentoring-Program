import type { IUserDatabaseAPI } from '@components/user/api/user-database.api';
import type { IUserDataToCreate, IUserDataToUpdate } from '@components/user/user.models';
import { UserService } from '@components/user/user.service';
import { UserInMemoryDatabase } from '@database/user-in-memory.database';
import type { Request, Response } from 'express';

export class UserController {
    private static userService: UserService;
    private static userDatabase: IUserDatabaseAPI;

    // TODO: Remove
    public static getUsers(
        request: Request,
        response: Response,
        next: CallableFunction,
    ): void {
        const userDatabase = UserController.getUserDatabase();
        const data = userDatabase.getAll();

        response
            .status(200)
            .json(data);
        next();
    }

    public static async createUser(
        request: Request,
        response: Response,
        next: CallableFunction,
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
            // TODO: Error handler
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
        next: CallableFunction,
    ): Promise<void> {
        const userService = UserController.getUserService();
        const userDataToUpdate = UserController.getUserDataToUpdate(request);
        const userIdToUpdate = request.params['id'];

        try {
            const user = await userService.updateUser(userIdToUpdate, userDataToUpdate);
            response
                .status(200)
                .json(user);
            next();
        } catch (err) {
            // TODO:
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
        next: CallableFunction,
    ): Promise<void> {
        const userService = UserController.getUserService();
        const userIdToDelete = request.params['id'];

        try {
            const isDeleted = await userService.deleteUser(userIdToDelete);
            response
                .status(200)
                .send(isDeleted);
            next();
        } catch (err) {
            // TODO:
        }
    }

    private static getUserService(): UserService {
        if (!UserController.userService) {
            const userDatabase = UserController.getUserDatabase();
            const userService = new UserService(userDatabase);
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
}
