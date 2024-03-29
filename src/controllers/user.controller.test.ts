import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';
import type { PassportAuthenticator } from '@authenticator/passport.authenticator';
import type { UserServiceProvider } from '@components/user/user-service.provider';
import type { UserService } from '@components/user/user.service';
import { IUserDatabaseModel, UserServiceResult, User, IUserDataToCreate, IUserDataToUpdate } from '@components/user/user.models';
import { UserController } from '@controllers/user.controller';
import { ErrorHandlerData } from '@common/models/error-handler-data.models';

describe('User Controller', () => {
    const ERROR_TEXT = 'test error text';

    const databaseProvider: IDatabaseProvider = Object.freeze({}) as unknown as IDatabaseProvider;
    const validatorProvider: IValidatorProvider = Object.freeze({}) as unknown as IValidatorProvider;

    let authenticator: PassportAuthenticator;

    let userService: UserService;
    let userController: UserController;
    let userServiceProvider: UserServiceProvider;

    let request: Request;
    let response: Response;
    let next: NextFunction;

    beforeEach(() => {
        authenticator = {
            login: () => null,
        } as unknown as PassportAuthenticator;

        userService = {} as unknown as UserService;
        userServiceProvider = {
            provideUserService: () => userService,
        } as unknown as UserServiceProvider;
        userServiceProvider = Object.freeze(userServiceProvider) as unknown as UserServiceProvider;

        request = {} as Request;
        response = {
            send: jest.fn(() => response),
            status: jest.fn(() => response),
            json: jest.fn(() => response),
            locals: {},
        } as unknown as Response;
        next = jest.fn();

        userController = new UserController(databaseProvider, validatorProvider, authenticator, userServiceProvider);
    });

    describe('Login method', () => {
        const TEST_USER_CREDENTIALS: Partial<IUserDatabaseModel> = {
            login: 'login1@mail.com',
            password: 'Password123',
        };
        const ERROR_TEST_USER_CREDENTIALS: Partial<IUserDatabaseModel> = {
            login: 'login1@mail.com',
        };

        beforeEach(() => {
            const loginTestHandler = (login: string, password: string): string => {
                if (login && password) {
                    return `${login}${password}`;
                }
                throw new Error(ERROR_TEXT);
            };
            authenticator.login = jest.fn(loginTestHandler);
        });

        test('should pass parameters from request to handler', async () => {
            request.user = TEST_USER_CREDENTIALS;

            await userController.login(request, response, next);

            const loginMock = (authenticator.login as jest.Mock).mock;
            const firstCall = loginMock.calls[0];

            expect(firstCall[0]).toBe(TEST_USER_CREDENTIALS.login);
            expect(firstCall[1]).toBe(TEST_USER_CREDENTIALS.password);
        });

        test(`should call the status method of response`, async () => {
            request.user = TEST_USER_CREDENTIALS;

            await userController.login(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            expect(statusMock.calls).toHaveLength(1);
        });

        test(`the status method of response should be ${StatusCodes.OK}`, async () => {
            request.user = TEST_USER_CREDENTIALS;

            await userController.login(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            const statusFirstCall = statusMock.calls[0];
            const firstCallArgument = statusFirstCall[0];
            expect(firstCallArgument).toBe(StatusCodes.OK);
        });

        test('should call the send method of response', async () => {
            request.user = TEST_USER_CREDENTIALS;

            await userController.login(request, response, next);

            const sendMock = (response.send as jest.Mock).mock;
            expect(sendMock.calls).toHaveLength(1);
        });

        test('the send method of response should receive value from handler', async () => {
            request.user = TEST_USER_CREDENTIALS;

            await userController.login(request, response, next);

            const sendMock = (response.send as jest.Mock).mock;
            const sendFirstCall = sendMock.calls[0];
            const firstCallArgument = sendFirstCall[0];

            const loginMock = (authenticator.login as jest.Mock).mock;
            const authenticatorResult = loginMock.results[0].value;

            expect(firstCallArgument).toBe(authenticatorResult);
        });

        test(
            'in case of error next callback should be called with it',
            async () => {
                request.user = ERROR_TEST_USER_CREDENTIALS;

                await userController.login(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                expect(nextMock.calls).toHaveLength(1);

                const firstCall = nextMock.calls[0];
                const argumentOfCall = firstCall[0];
                expect(argumentOfCall).toBeTruthy();
            },
        );

        test(
            'in case of error should pass instance of ErrorHandlerData to next callback ',
            async () => {
                request.user = ERROR_TEST_USER_CREDENTIALS;

                await userController.login(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                const nextMockFirstCall = nextMock.calls[0];
                const firstCallArgument = nextMockFirstCall[0];
                expect(firstCallArgument).toBeInstanceOf(ErrorHandlerData);
            },
        );

        test(
            'in case of error the status method of response should not be called',
            async () => {
                request.user = ERROR_TEST_USER_CREDENTIALS;

                await userController.login(request, response, next);

                const statusMock = (response.status as jest.Mock).mock;
                expect(statusMock.calls).toHaveLength(0);
            },
        );

        test(
            'in case of error the send method of response should not be called',
            async () => {
                request.user = ERROR_TEST_USER_CREDENTIALS;

                await userController.login(request, response, next);

                const sendMock = (response.send as jest.Mock).mock;
                expect(sendMock.calls).toHaveLength(0);
            },
        );
    });

    describe('getUserById method', () => {
        const TEST_USER = new User({
            id: 'user_id',
            login: 'login1@mail.com',
            password: 'Password123',
            age: 15,
        });
        const TEST_PARAMS = { id: TEST_USER.id };
        const ERROR_TEST_PARAMS = { id: 'some' };

        beforeEach(() => {
            const getUserByIdHandler = async (id: string): Promise<UserServiceResult<User>> => {
                if (id === TEST_USER.id) {
                    return new UserServiceResult<User>({ data: TEST_USER });
                }
                return new UserServiceResult<User>({ error: ERROR_TEXT });
            };
            userService.getUserById = jest.fn(getUserByIdHandler);
        });

        test('should pass parameters from request to handler', async () => {
            request.params = TEST_PARAMS;

            await userController.getUserById(request, response, next);

            const getUserByIdMock = (userService.getUserById as jest.Mock).mock;
            const firstCall = getUserByIdMock.calls[0];

            expect(firstCall[0]).toBe(TEST_USER.id);
        });

        test(`should call the status method of response`, async () => {
            request.params = TEST_PARAMS;

            await userController.getUserById(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            expect(statusMock.calls).toHaveLength(1);
        });

        test(`the status method of response should be ${StatusCodes.OK}`, async () => {
            request.params = TEST_PARAMS;

            await userController.getUserById(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            const statusFirstCall = statusMock.calls[0];
            const firstCallArgument = statusFirstCall[0];
            expect(firstCallArgument).toBe(StatusCodes.OK);
        });

        test('should call the json method of response', async () => {
            request.params = TEST_PARAMS;

            await userController.getUserById(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            expect(jsonMock.calls).toHaveLength(1);
        });

        test('the json method of response should receive value from handler', async () => {
            request.params = TEST_PARAMS;

            await userController.getUserById(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            const jsonFirstCall = jsonMock.calls[0];
            const firstCallArgument = jsonFirstCall[0];

            const getUserByIdMock = (userService.getUserById as jest.Mock).mock;
            const userServiceResult = await getUserByIdMock.results[0].value;
            const resultValue = userServiceResult.data!;

            expect(firstCallArgument).toBe(resultValue);
        });

        test('should call next function without arguments', async () => {
            request.params = TEST_PARAMS;

            await userController.getUserById(request, response, next);

            const nextMock = (next as jest.Mock).mock;
            expect(nextMock.calls).toHaveLength(1);

            const nextMockFirstCall = nextMock.calls[0];
            const firstCallArgument = nextMockFirstCall[0];
            expect(firstCallArgument).toBe(undefined);
        });

        test(
            'in case of error next callback should be called with it',
            async () => {
                request.params = ERROR_TEST_PARAMS;

                await userController.getUserById(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                expect(nextMock.calls).toHaveLength(1);

                const firstCall = nextMock.calls[0];
                const argumentOfCall = firstCall[0];
                expect(argumentOfCall).toBeTruthy();
            },
        );

        test(
            'in case of error should pass instance of ErrorHandlerData to next callback ',
            async () => {
                request.params = ERROR_TEST_PARAMS;

                await userController.getUserById(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                const nextMockFirstCall = nextMock.calls[0];
                const firstCallArgument = nextMockFirstCall[0];
                expect(firstCallArgument).toBeInstanceOf(ErrorHandlerData);
            },
        );

        test(
            'in case of error the status method of response should not be called',
            async () => {
                request.params = ERROR_TEST_PARAMS;

                await userController.getUserById(request, response, next);

                const statusMock = (response.status as jest.Mock).mock;
                expect(statusMock.calls).toHaveLength(0);
            },
        );

        test(
            'in case of error the json method of response should not be called',
            async () => {
                request.params = ERROR_TEST_PARAMS;

                await userController.getUserById(request, response, next);

                const jsonMock = (response.json as jest.Mock).mock;
                expect(jsonMock.calls).toHaveLength(0);
            },
        );
    });

    describe('getAutosuggest method', () => {
        const TEST_USERS = [
            new User({
                id: 'user_id1',
                login: 'login1@mail.com',
                password: 'Password123',
                age: 15,
            }),
            new User({
                id: 'user_id2',
                login: 'login2@mail.com',
                password: 'Password123',
                age: 15,
            }),
        ];
        const TEST_QUERY = { limit: '2', loginSubstring: 'login' };
        const ERROR_TEST_QUERY = { limit: '2', loginSubstring: 'some' };

        beforeEach(() => {
            const getAutosuggestUsersHandler = async (
                loginSubstring: string,
                limit: number,
            ): Promise<UserServiceResult<User[]>> => {
                if (TEST_USERS.some(user => user.login.includes(loginSubstring))) {
                    return new UserServiceResult<User[]>({ data: TEST_USERS });
                }
                return new UserServiceResult<User[]>({ error: ERROR_TEXT });
            };
            userService.getAutosuggestUsers = jest.fn(getAutosuggestUsersHandler);
        });

        test('should pass parameters from request to handler', async () => {
            request.query = TEST_QUERY;

            await userController.getAutosuggest(request, response, next);

            const getAutosuggestUsersMock = (userService.getAutosuggestUsers as jest.Mock).mock;
            const firstCall = getAutosuggestUsersMock.calls[0];

            expect(firstCall[0]).toBe(TEST_QUERY.loginSubstring);
            expect(firstCall[1]).toBe(Number(TEST_QUERY.limit));
        });

        test(`should call the status method of response`, async () => {
            request.query = TEST_QUERY;

            await userController.getAutosuggest(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            expect(statusMock.calls).toHaveLength(1);
        });

        test(`the status method of response should be ${StatusCodes.OK}`, async () => {
            request.query = TEST_QUERY;

            await userController.getAutosuggest(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            const statusFirstCall = statusMock.calls[0];
            const firstCallArgument = statusFirstCall[0];
            expect(firstCallArgument).toBe(StatusCodes.OK);
        });

        test('should call the json method of response', async () => {
            request.query = TEST_QUERY;

            await userController.getAutosuggest(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            expect(jsonMock.calls).toHaveLength(1);
        });

        test('the json method of response should receive value from handler', async () => {
            request.query = TEST_QUERY;

            await userController.getAutosuggest(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            const jsonFirstCall = jsonMock.calls[0];
            const firstCallArgument = jsonFirstCall[0];

            const getAutosuggestUsersMock = (userService.getAutosuggestUsers as jest.Mock).mock;
            const userServiceResult = await getAutosuggestUsersMock.results[0].value;
            const resultValue = userServiceResult.data!;

            expect(firstCallArgument).toBe(resultValue);
        });

        test('should call next function without arguments', async () => {
            request.query = TEST_QUERY;

            await userController.getAutosuggest(request, response, next);

            const nextMock = (next as jest.Mock).mock;
            expect(nextMock.calls).toHaveLength(1);

            const nextMockFirstCall = nextMock.calls[0];
            const firstCallArgument = nextMockFirstCall[0];
            expect(firstCallArgument).toBe(undefined);
        });

        test(
            'in case of error next callback should be called with it',
            async () => {
                request.query = ERROR_TEST_QUERY;

                await userController.getAutosuggest(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                expect(nextMock.calls).toHaveLength(1);

                const firstCall = nextMock.calls[0];
                const argumentOfCall = firstCall[0];
                expect(argumentOfCall).toBeTruthy();
            },
        );

        test(
            'in case of error should pass instance of ErrorHandlerData to next callback ',
            async () => {
                request.query = ERROR_TEST_QUERY;

                await userController.getAutosuggest(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                const nextMockFirstCall = nextMock.calls[0];
                const firstCallArgument = nextMockFirstCall[0];
                expect(firstCallArgument).toBeInstanceOf(ErrorHandlerData);
            },
        );

        test(
            'in case of error the status method of response should not be called',
            async () => {
                request.query = ERROR_TEST_QUERY;

                await userController.getAutosuggest(request, response, next);

                const statusMock = (response.status as jest.Mock).mock;
                expect(statusMock.calls).toHaveLength(0);
            },
        );

        test(
            'in case of error the json method of response should not be called',
            async () => {
                request.query = ERROR_TEST_QUERY;

                await userController.getAutosuggest(request, response, next);

                const jsonMock = (response.json as jest.Mock).mock;
                expect(jsonMock.calls).toHaveLength(0);
            },
        );
    });

    describe('createUser method', () => {
        const TEST_USER_DATA_TO_CREATE: IUserDataToCreate = {
            login: 'login1@mail.com',
            password: 'Password123',
            age: 15,
        };
        const ERROR_TEST_USER_DATA_TO_CREATE: IUserDataToCreate = {
            ...TEST_USER_DATA_TO_CREATE,
            login: 'error',
        };

        beforeEach(() => {
            const createUserHandler = async (
                userData: IUserDataToCreate,
            ): Promise<UserServiceResult<User>> => {
                if (userData.login === TEST_USER_DATA_TO_CREATE.login) {
                    return new UserServiceResult<User>({
                        data: new User({
                            ...userData,
                            id: 'user_id',
                        }),
                    });
                }
                return new UserServiceResult<User>({ error: ERROR_TEXT });
            };
            userService.createUser = jest.fn(createUserHandler);
        });

        test('should pass parameters from request to handler', async () => {
            request.body = TEST_USER_DATA_TO_CREATE;

            await userController.createUser(request, response, next);

            const createUserMock = (userService.createUser as jest.Mock).mock;
            const firstCall = createUserMock.calls[0];

            expect(firstCall[0]).toEqual(TEST_USER_DATA_TO_CREATE);
        });

        test(`should call the status method of response`, async () => {
            request.body = TEST_USER_DATA_TO_CREATE;

            await userController.createUser(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            expect(statusMock.calls).toHaveLength(1);
        });

        test(`the status method of response should be ${StatusCodes.OK}`, async () => {
            request.body = TEST_USER_DATA_TO_CREATE;

            await userController.createUser(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            const statusFirstCall = statusMock.calls[0];
            const firstCallArgument = statusFirstCall[0];
            expect(firstCallArgument).toBe(StatusCodes.OK);
        });

        test('should call the json method of response', async () => {
            request.body = TEST_USER_DATA_TO_CREATE;

            await userController.createUser(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            expect(jsonMock.calls).toHaveLength(1);
        });

        test('the json method of response should receive value from handler', async () => {
            request.body = TEST_USER_DATA_TO_CREATE;

            await userController.createUser(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            const jsonFirstCall = jsonMock.calls[0];
            const firstCallArgument = jsonFirstCall[0];

            const createUserMock = (userService.createUser as jest.Mock).mock;
            const userServiceResult = await createUserMock.results[0].value;
            const resultValue = userServiceResult.data!;

            expect(firstCallArgument).toBe(resultValue);
        });

        test('should call next function without arguments', async () => {
            request.body = TEST_USER_DATA_TO_CREATE;

            await userController.createUser(request, response, next);

            const nextMock = (next as jest.Mock).mock;
            expect(nextMock.calls).toHaveLength(1);

            const nextMockFirstCall = nextMock.calls[0];
            const firstCallArgument = nextMockFirstCall[0];
            expect(firstCallArgument).toBe(undefined);
        });

        test(
            'in case of error next callback should be called with it',
            async () => {
                request.body = ERROR_TEST_USER_DATA_TO_CREATE;

                await userController.createUser(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                expect(nextMock.calls).toHaveLength(1);

                const firstCall = nextMock.calls[0];
                const argumentOfCall = firstCall[0];
                expect(argumentOfCall).toBeTruthy();
            },
        );

        test(
            'in case of error should pass instance of ErrorHandlerData to next callback ',
            async () => {
                request.body = ERROR_TEST_USER_DATA_TO_CREATE;

                await userController.createUser(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                const nextMockFirstCall = nextMock.calls[0];
                const firstCallArgument = nextMockFirstCall[0];
                expect(firstCallArgument).toBeInstanceOf(ErrorHandlerData);
            },
        );

        test(
            'in case of error the status method of response should not be called',
            async () => {
                request.body = ERROR_TEST_USER_DATA_TO_CREATE;

                await userController.createUser(request, response, next);

                const statusMock = (response.status as jest.Mock).mock;
                expect(statusMock.calls).toHaveLength(0);
            },
        );

        test(
            'in case of error the json method of response should not be called',
            async () => {
                request.body = ERROR_TEST_USER_DATA_TO_CREATE;

                await userController.createUser(request, response, next);

                const jsonMock = (response.json as jest.Mock).mock;
                expect(jsonMock.calls).toHaveLength(0);
            },
        );
    });

    describe('updateUser method', () => {
        const TEST_USER = new User({
            id: 'user_id',
            login: 'login123@mail.com',
            password: 'Password123',
            age: 15,
        });
        const TEST_USER_DATA_TO_UPDATE: IUserDataToUpdate = {
            password: 'Password123',
            age: 20,
        };
        const TEST_UPDATED_USER = new User({
            ...TEST_USER,
            ...TEST_USER_DATA_TO_UPDATE,
        });
        const TEST_PARAMS = { id: TEST_USER.id };
        const ERROR_TEST_PARAMS = { id: 'some' };

        beforeEach(() => {
            const updateUserHandler = async (
                id: string,
                userData: IUserDataToUpdate,
            ): Promise<UserServiceResult<User>> => {
                if (id === TEST_USER.id) {
                    return new UserServiceResult<User>({
                        data: TEST_UPDATED_USER,
                    });
                }
                return new UserServiceResult<User>({ error: ERROR_TEXT });
            };
            userService.updateUser = jest.fn(updateUserHandler);
        });

        test('should pass parameters from request to handler', async () => {
            request = {
                params: TEST_PARAMS,
                body: TEST_USER_DATA_TO_UPDATE,
            } as unknown as Request;

            await userController.updateUser(request, response, next);

            const updateUserMock = (userService.updateUser as jest.Mock).mock;
            const firstCall = updateUserMock.calls[0];

            expect(firstCall[0]).toBe(TEST_USER.id);
            expect(firstCall[1]).toEqual(TEST_USER_DATA_TO_UPDATE);
        });

        test(`should call the status method of response`, async () => {
            request = {
                params: TEST_PARAMS,
                body: TEST_USER_DATA_TO_UPDATE,
            } as unknown as Request;

            await userController.updateUser(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            expect(statusMock.calls).toHaveLength(1);
        });

        test(`the status method of response should be ${StatusCodes.OK}`, async () => {
            request = {
                params: TEST_PARAMS,
                body: TEST_USER_DATA_TO_UPDATE,
            } as unknown as Request;

            await userController.updateUser(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            const statusFirstCall = statusMock.calls[0];
            const firstCallArgument = statusFirstCall[0];
            expect(firstCallArgument).toBe(StatusCodes.OK);
        });

        test('should call the json method of response', async () => {
            request = {
                params: TEST_PARAMS,
                body: TEST_USER_DATA_TO_UPDATE,
            } as unknown as Request;

            await userController.updateUser(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            expect(jsonMock.calls).toHaveLength(1);
        });

        test('the json method of response should receive value from handler', async () => {
            request = {
                params: TEST_PARAMS,
                body: TEST_USER_DATA_TO_UPDATE,
            } as unknown as Request;

            await userController.updateUser(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            const jsonFirstCall = jsonMock.calls[0];
            const firstCallArgument = jsonFirstCall[0];

            const updateUserMock = (userService.updateUser as jest.Mock).mock;
            const userServiceResult = await updateUserMock.results[0].value;
            const resultValue = userServiceResult.data!;

            expect(firstCallArgument).toBe(resultValue);
        });

        test('should call next function without arguments', async () => {
            request = {
                params: TEST_PARAMS,
                body: TEST_USER_DATA_TO_UPDATE,
            } as unknown as Request;

            await userController.updateUser(request, response, next);

            const nextMock = (next as jest.Mock).mock;
            expect(nextMock.calls).toHaveLength(1);

            const nextMockFirstCall = nextMock.calls[0];
            const firstCallArgument = nextMockFirstCall[0];
            expect(firstCallArgument).toBe(undefined);
        });

        test(
            'in case of error next callback should be called with it',
            async () => {
                request = {
                    params: ERROR_TEST_PARAMS,
                    body: TEST_USER_DATA_TO_UPDATE,
                } as unknown as Request;

                await userController.updateUser(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                expect(nextMock.calls).toHaveLength(1);

                const firstCall = nextMock.calls[0];
                const argumentOfCall = firstCall[0];
                expect(argumentOfCall).toBeTruthy();
            },
        );

        test(
            'in case of error should pass instance of ErrorHandlerData to next callback ',
            async () => {
                request = {
                    params: ERROR_TEST_PARAMS,
                    body: TEST_USER_DATA_TO_UPDATE,
                } as unknown as Request;

                await userController.updateUser(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                const nextMockFirstCall = nextMock.calls[0];
                const firstCallArgument = nextMockFirstCall[0];
                expect(firstCallArgument).toBeInstanceOf(ErrorHandlerData);
            },
        );

        test(
            'in case of error the status method of response should not be called',
            async () => {
                request = {
                    params: ERROR_TEST_PARAMS,
                    body: TEST_USER_DATA_TO_UPDATE,
                } as unknown as Request;

                await userController.updateUser(request, response, next);

                const statusMock = (response.status as jest.Mock).mock;
                expect(statusMock.calls).toHaveLength(0);
            },
        );

        test(
            'in case of error the json method of response should not be called',
            async () => {
                request = {
                    params: ERROR_TEST_PARAMS,
                    body: TEST_USER_DATA_TO_UPDATE,
                } as unknown as Request;

                await userController.updateUser(request, response, next);

                const jsonMock = (response.json as jest.Mock).mock;
                expect(jsonMock.calls).toHaveLength(0);
            },
        );
    });

    describe('deleteUser method', () => {
        const TEST_USER = new User({
            id: 'user_id',
            login: 'login123@mail.com',
            password: 'Password123',
            age: 15,
        });
        const TEST_PARAMS = { id: TEST_USER.id };
        const ERROR_TEST_PARAMS = { id: 'some' };

        beforeEach(() => {
            const deleteUserHandler = async (
                id: string,
            ): Promise<UserServiceResult<boolean>> => {
                if (id === TEST_USER.id) {
                    return new UserServiceResult<boolean>({ data: true });
                }
                return new UserServiceResult<boolean>({ error: ERROR_TEXT });
            };
            userService.deleteUser = jest.fn(deleteUserHandler);
        });

        test('should pass parameters from request to handler', async () => {
            request.params = TEST_PARAMS;

            await userController.deleteUser(request, response, next);

            const deleteUserMock = (userService.deleteUser as jest.Mock).mock;
            const firstCall = deleteUserMock.calls[0];

            expect(firstCall[0]).toBe(TEST_USER.id);
        });

        test(`should call the status method of response`, async () => {
            request.params = TEST_PARAMS;

            await userController.deleteUser(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            expect(statusMock.calls).toHaveLength(1);
        });

        test(`the status method of response should be ${StatusCodes.OK}`, async () => {
            request.params = TEST_PARAMS;

            await userController.deleteUser(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            const statusFirstCall = statusMock.calls[0];
            const firstCallArgument = statusFirstCall[0];
            expect(firstCallArgument).toBe(StatusCodes.OK);
        });

        test('should call the send method of response', async () => {
            request.params = TEST_PARAMS;

            await userController.deleteUser(request, response, next);

            const sendMock = (response.send as jest.Mock).mock;
            expect(sendMock.calls).toHaveLength(1);
        });

        test('the send method of response should receive value from handler', async () => {
            request.params = TEST_PARAMS;

            await userController.deleteUser(request, response, next);

            const sendMock = (response.send as jest.Mock).mock;
            const sendFirstCall = sendMock.calls[0];
            const firstCallArgument = sendFirstCall[0];

            const deleteUserMock = (userService.deleteUser as jest.Mock).mock;
            const userServiceResult = await deleteUserMock.results[0].value;
            const resultValue = userServiceResult.data!;

            expect(firstCallArgument).toBe(resultValue);
        });

        test('should call next function without arguments', async () => {
            request.params = TEST_PARAMS;

            await userController.deleteUser(request, response, next);

            const nextMock = (next as jest.Mock).mock;
            expect(nextMock.calls).toHaveLength(1);

            const nextMockFirstCall = nextMock.calls[0];
            const firstCallArgument = nextMockFirstCall[0];
            expect(firstCallArgument).toBe(undefined);
        });

        test(
            'in case of error next callback should be called with it',
            async () => {
                request.params = ERROR_TEST_PARAMS;

                await userController.deleteUser(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                expect(nextMock.calls).toHaveLength(1);

                const firstCall = nextMock.calls[0];
                const argumentOfCall = firstCall[0];
                expect(argumentOfCall).toBeTruthy();
            },
        );

        test(
            'in case of error should pass instance of ErrorHandlerData to next callback ',
            async () => {
                request.params = ERROR_TEST_PARAMS;

                await userController.deleteUser(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                const nextMockFirstCall = nextMock.calls[0];
                const firstCallArgument = nextMockFirstCall[0];
                expect(firstCallArgument).toBeInstanceOf(ErrorHandlerData);
            },
        );

        test(
            'in case of error the status method of response should not be called',
            async () => {
                request.params = ERROR_TEST_PARAMS;

                await userController.deleteUser(request, response, next);

                const statusMock = (response.status as jest.Mock).mock;
                expect(statusMock.calls).toHaveLength(0);
            },
        );

        test(
            'in case of error the send method of response should not be called',
            async () => {
                request.params = ERROR_TEST_PARAMS;

                await userController.deleteUser(request, response, next);

                const sendMock = (response.send as jest.Mock).mock;
                expect(sendMock.calls).toHaveLength(0);
            },
        );
    });

    describe('addUsersToGroup method', () => {
        const TEST_USER_IDS_LIST = ['user_id_1', 'user_id_2', 'user_id_3'];
        const TEST_USER_IDS = TEST_USER_IDS_LIST.join(',');
        const TEST_QUERY = { usersIds: TEST_USER_IDS_LIST, groupId: 'group_id' };
        const ERROR_TEST_QUERY = { usersIds: TEST_USER_IDS, groupId: 'some' };

        beforeEach(() => {
            const addUsersToGroupHandler = async (
                groupId: string,
                usersIds: string[],
            ): Promise<UserServiceResult<boolean>> => {
                if (groupId === TEST_QUERY.groupId) {
                    return new UserServiceResult<boolean>({ data: true });
                }
                return new UserServiceResult<boolean>({ error: ERROR_TEXT });
            };
            userService.addUsersToGroup = jest.fn(addUsersToGroupHandler);
        });

        test('should pass parameters from request to handler', async () => {
            request.query = TEST_QUERY;

            await userController.addUsersToGroup(request, response, next);

            const addUsersToGroupMock = (userService.addUsersToGroup as jest.Mock).mock;
            const firstCall = addUsersToGroupMock.calls[0];

            expect(firstCall[0]).toBe(TEST_QUERY.groupId);
            expect(firstCall[1]).toEqual(TEST_USER_IDS_LIST);
        });

        test('in case usersIds is a string should transform it to an array', async () => {
            request.query = TEST_QUERY;

            await userController.addUsersToGroup(request, response, next);

            const addUsersToGroupMock = (userService.addUsersToGroup as jest.Mock).mock;
            const firstCall = addUsersToGroupMock.calls[0];

            expect(firstCall[1]).toEqual(TEST_USER_IDS_LIST);
        });

        test(`should call the status method of response`, async () => {
            request.query = TEST_QUERY;

            await userController.addUsersToGroup(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            expect(statusMock.calls).toHaveLength(1);
        });

        test(`the status method of response should be ${StatusCodes.OK}`, async () => {
            request.query = TEST_QUERY;

            await userController.addUsersToGroup(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            const statusFirstCall = statusMock.calls[0];
            const firstCallArgument = statusFirstCall[0];
            expect(firstCallArgument).toBe(StatusCodes.OK);
        });

        test('should call the send method of response', async () => {
            request.query = TEST_QUERY;

            await userController.addUsersToGroup(request, response, next);

            const sendMock = (response.send as jest.Mock).mock;
            expect(sendMock.calls).toHaveLength(1);
        });

        test('the send method of response should receive value from handler', async () => {
            request.query = TEST_QUERY;

            await userController.addUsersToGroup(request, response, next);

            const sendMock = (response.send as jest.Mock).mock;
            const sendFirstCall = sendMock.calls[0];
            const firstCallArgument = sendFirstCall[0];

            const addUsersToGroupMock = (userService.addUsersToGroup as jest.Mock).mock;
            const userServiceResult = await addUsersToGroupMock.results[0].value;
            const resultValue = userServiceResult.data!;

            expect(firstCallArgument).toBe(resultValue);
        });

        test('should call next function without arguments', async () => {
            request.query = TEST_QUERY;

            await userController.addUsersToGroup(request, response, next);

            const nextMock = (next as jest.Mock).mock;
            expect(nextMock.calls).toHaveLength(1);

            const nextMockFirstCall = nextMock.calls[0];
            const firstCallArgument = nextMockFirstCall[0];
            expect(firstCallArgument).toBe(undefined);
        });

        test(
            'in case of error next callback should be called with it',
            async () => {
                request.query = ERROR_TEST_QUERY;

                await userController.addUsersToGroup(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                expect(nextMock.calls).toHaveLength(1);

                const firstCall = nextMock.calls[0];
                const argumentOfCall = firstCall[0];
                expect(argumentOfCall).toBeTruthy();
            },
        );

        test(
            'in case of error should pass instance of ErrorHandlerData to next callback ',
            async () => {
                request.query = ERROR_TEST_QUERY;

                await userController.addUsersToGroup(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                const nextMockFirstCall = nextMock.calls[0];
                const firstCallArgument = nextMockFirstCall[0];
                expect(firstCallArgument).toBeInstanceOf(ErrorHandlerData);
            },
        );

        test(
            'in case of error the status method of response should not be called',
            async () => {
                request.query = ERROR_TEST_QUERY;

                await userController.addUsersToGroup(request, response, next);

                const statusMock = (response.status as jest.Mock).mock;
                expect(statusMock.calls).toHaveLength(0);
            },
        );

        test(
            'in case of error the send method of response should not be called',
            async () => {
                request.query = ERROR_TEST_QUERY;

                await userController.addUsersToGroup(request, response, next);

                const sendMock = (response.send as jest.Mock).mock;
                expect(sendMock.calls).toHaveLength(0);
            },
        );
    });
});
