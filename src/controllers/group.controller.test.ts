import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes';
import { ErrorHandlerData } from '@common/models/error-handler-data.models';
import { GroupController } from '@controllers/group.controller';
import type { GroupService } from '@components/group/group.service';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';
import type { GroupServiceProvider } from '@components/group/group-service.provider';
import { GroupServiceResult, IGroupDataToCreate, IGroupDataToUpdate, GroupPermission, Group } from '@components/group/group.models';

describe('Group Controller', () => {
    let databaseProvider: IDatabaseProvider;
    let validatorProvider: IValidatorProvider;

    let groupService: GroupService;
    let groupServiceProvider: GroupServiceProvider;
    let groupController: GroupController;

    let request: Request;
    let response: Response;
    let next: NextFunction;

    beforeAll(() => {
        databaseProvider = {
            getUserDatabase: () => null,
            getGroupDatabase: () => null,
        } as unknown as IDatabaseProvider;
        databaseProvider = Object.freeze(databaseProvider);

        validatorProvider = {
            getUserValidator: () => null,
            getGroupValidator: () => null,
        } as unknown as IValidatorProvider;
        validatorProvider = Object.freeze(validatorProvider);
    });

    beforeEach(() => {
        groupService = {} as unknown as GroupService;
        groupServiceProvider = {
            provideGroupService: () => groupService,
        } as unknown as GroupServiceProvider;
        groupServiceProvider = Object.freeze(groupServiceProvider) as unknown as GroupServiceProvider;

        request = {} as Request;
        response = {
            send: jest.fn(() => response),
            status: jest.fn(() => response),
            json: jest.fn(() => response),
            locals: {},
        } as unknown as Response;
        next = jest.fn();

        groupController = new GroupController(databaseProvider, validatorProvider, groupServiceProvider);
    });

    describe('getGroupById method', () => {
        const ERROR_TEST_GROUP_ID = 'some';
        const TEST_GROUP = new Group({
            id: 'group_id',
            name: 'group_name',
            permissions: [GroupPermission.Read],
        });

        beforeEach(() => {
            const getGroupByIdHandler = async (id: string) => {
                if (id === TEST_GROUP.id) {
                    return new GroupServiceResult<Group>({ data: TEST_GROUP });
                }
                return new GroupServiceResult<Group>({ error: 'test error text' });
            }
            groupService.getGroupById = jest.fn(getGroupByIdHandler);
        });

        test('should pass parameters from request to handler', async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.getGroupById(request, response, next);

            const getGroupByIdMock = (groupService.getGroupById as jest.Mock).mock;
            const firstCall = getGroupByIdMock.calls[0];

            expect(firstCall[0]).toBe(TEST_GROUP.id);
        });

        test(`should call the status method of response`, async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.getGroupById(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            expect(statusMock.calls).toHaveLength(1);
        });

        test(`the status method of response should be ${StatusCodes.OK}`, async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.getGroupById(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            const statusFirstCall = statusMock.calls[0];
            const firstCallArgument = statusFirstCall[0];
            expect(firstCallArgument).toBe(StatusCodes.OK);
        });

        test('should call the json method of response', async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.getGroupById(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            expect(jsonMock.calls).toHaveLength(1);
        });

        test('the json method of response should receive value from handler', async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.getGroupById(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            const jsonFirstCall = jsonMock.calls[0];
            const firstCallArgument = jsonFirstCall[0];

            const getGroupByIdMock = (groupService.getGroupById as jest.Mock).mock;
            const groupServiceResult = await getGroupByIdMock.results[0].value;
            const resultValue = groupServiceResult.data!;

            expect(firstCallArgument).toBe(resultValue);
        });

        test('should call next function without arguments', async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.getGroupById(request, response, next);

            const nextMock = (next as jest.Mock).mock;
            expect(nextMock.calls).toHaveLength(1);

            const nextMockFirstCall = nextMock.calls[0];
            const firstCallArgument = nextMockFirstCall[0];
            expect(firstCallArgument).toBe(undefined);
        });

        test(
            'in case of error next callback should be called with an error',
            async () => {
                request.params = { id: ERROR_TEST_GROUP_ID };

                await groupController.getGroupById(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                expect(nextMock.calls).toHaveLength(1);
            },
        );

        test(
            'in case of error should pass instance of ErrorHandlerData to next callback ',
            async () => {
                request.params = { id: ERROR_TEST_GROUP_ID };

                await groupController.getGroupById(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                const nextMockFirstCall = nextMock.calls[0];
                const firstCallArgument = nextMockFirstCall[0];
                expect(firstCallArgument).toBeInstanceOf(ErrorHandlerData);
            },
        );

        test(
            'in case of error the status method of response should not be called',
            async () => {
                request.params = { id: ERROR_TEST_GROUP_ID };

                await groupController.getGroupById(request, response, next);

                const statusMock = (response.status as jest.Mock).mock;
                expect(statusMock.calls).toHaveLength(0);
            },
        );

        test(
            'in case of error the json method of response should not be called',
            async () => {
                request.params = { id: ERROR_TEST_GROUP_ID };

                await groupController.getGroupById(request, response, next);

                const jsonMock = (response.json as jest.Mock).mock;
                expect(jsonMock.calls).toHaveLength(0);
            },
        );
    });

    describe('getAllGroups', () => {
        const TEST_GROUPS: Group[] = [
            new Group({
                id: 'group_id',
                name: 'group_name',
                permissions: [GroupPermission.Read],
            }),
            new Group({
                id: 'group_id',
                name: 'group_name2',
                permissions: [GroupPermission.Write],
            }),
        ];

        const applyGetAllGroupsErrorApproach = () => {
            const getAllGroupsHandler = async () =>
                new GroupServiceResult<Group[]>({ error: 'test error text' });
            groupService.getAllGroups = jest.fn(getAllGroupsHandler);
        };

        beforeEach(() => {
            const getAllGroupsHandler = async () =>
                new GroupServiceResult<Group[]>({ data: TEST_GROUPS });
            groupService.getAllGroups = jest.fn(getAllGroupsHandler);
        });

        test(`should call the status method of response`, async () => {
            await groupController.getAllGroups(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            expect(statusMock.calls).toHaveLength(1);
        });

        test(`the status method of response should be ${StatusCodes.OK}`, async () => {
            await groupController.getAllGroups(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            const statusFirstCall = statusMock.calls[0];
            const firstCallArgument = statusFirstCall[0];
            expect(firstCallArgument).toBe(StatusCodes.OK);
        });

        test('should call the json method of response', async () => {
            await groupController.getAllGroups(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            expect(jsonMock.calls).toHaveLength(1);
        });

        test('the json method of response should receive value from handler', async () => {
            await groupController.getAllGroups(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            const jsonFirstCall = jsonMock.calls[0];
            const firstCallArgument = jsonFirstCall[0];

            const getAllGroupsMock = (groupService.getAllGroups as jest.Mock).mock;
            const groupServiceResult = await getAllGroupsMock.results[0].value;
            const resultValue = groupServiceResult.data!;

            expect(firstCallArgument).toBe(resultValue);
        });

        test('should call next function without arguments', async () => {
            await groupController.getAllGroups(request, response, next);

            const nextMock = (next as jest.Mock).mock;
            expect(nextMock.calls).toHaveLength(1);

            const nextMockFirstCall = nextMock.calls[0];
            const firstCallArgument = nextMockFirstCall[0];
            expect(firstCallArgument).toBe(undefined);
        });

        test(
            'in case of error next callback should be called with an error',
            async () => {
                applyGetAllGroupsErrorApproach();

                await groupController.getAllGroups(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                expect(nextMock.calls).toHaveLength(1);
            },
        );

        test(
            'in case of error should pass instance of ErrorHandlerData to next callback ',
            async () => {
                applyGetAllGroupsErrorApproach();

                await groupController.getAllGroups(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                const nextMockFirstCall = nextMock.calls[0];
                const firstCallArgument = nextMockFirstCall[0];
                expect(firstCallArgument).toBeInstanceOf(ErrorHandlerData);
            },
        );

        test(
            'in case of error the status method of response should not be called',
            async () => {
                applyGetAllGroupsErrorApproach();

                await groupController.getAllGroups(request, response, next);

                const statusMock = (response.status as jest.Mock).mock;
                expect(statusMock.calls).toHaveLength(0);
            },
        );

        test(
            'in case of error the json method of response should not be called',
            async () => {
                applyGetAllGroupsErrorApproach();

                await groupController.getAllGroups(request, response, next);

                const jsonMock = (response.json as jest.Mock).mock;
                expect(jsonMock.calls).toHaveLength(0);
            },
        );
    });

    describe('createGroup method', () => {
        const TEST_GROUP_DATA_TO_CREATE: IGroupDataToCreate = {
            name: 'group_name',
            permissions: [GroupPermission.Read],
        };
        const ERROR_TEST_GROUP_DATA_TO_CREATE: IGroupDataToCreate = {
            ...TEST_GROUP_DATA_TO_CREATE,
            name: 'some',
        };

        beforeEach(() => {
            const createGroupHandler = async (
                groupData: IGroupDataToCreate,
            ): Promise<GroupServiceResult<Group>> => {
                if (groupData.name === TEST_GROUP_DATA_TO_CREATE.name) {
                    return new GroupServiceResult<Group>({
                        data: new Group({
                            ...groupData,
                            id: 'group_id',
                        }),
                    });
                }
                return new GroupServiceResult<Group>({ error: 'test error text' });
            };
            groupService.createGroup = jest.fn(createGroupHandler);
        });

        test('should pass parameters from request to handler', async () => {
            request.body = TEST_GROUP_DATA_TO_CREATE;

            await groupController.createGroup(request, response, next);

            const createGroupMock = (groupService.createGroup as jest.Mock).mock;
            const firstCall = createGroupMock.calls[0];

            expect(firstCall[0]).toEqual(TEST_GROUP_DATA_TO_CREATE);
        });

        test(`should call the status method of response`, async () => {
            request.body = TEST_GROUP_DATA_TO_CREATE;

            await groupController.createGroup(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            expect(statusMock.calls).toHaveLength(1);
        });

        test(`the status method of response should be ${StatusCodes.OK}`, async () => {
            request.body = TEST_GROUP_DATA_TO_CREATE;

            await groupController.createGroup(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            const statusFirstCall = statusMock.calls[0];
            const firstCallArgument = statusFirstCall[0];
            expect(firstCallArgument).toBe(StatusCodes.OK);
        });

        test('should call the json method of response', async () => {
            request.body = TEST_GROUP_DATA_TO_CREATE;

            await groupController.createGroup(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            expect(jsonMock.calls).toHaveLength(1);
        });

        test('the json method of response should receive value from handler', async () => {
            request.body = TEST_GROUP_DATA_TO_CREATE;

            await groupController.createGroup(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            const jsonFirstCall = jsonMock.calls[0];
            const firstCallArgument = jsonFirstCall[0];

            const createGroupMock = (groupService.createGroup as jest.Mock).mock;
            const GroupServiceResult = await createGroupMock.results[0].value;
            const resultValue = GroupServiceResult.data!;

            expect(firstCallArgument).toBe(resultValue);
        });

        test('should call next function without arguments', async () => {
            request.body = TEST_GROUP_DATA_TO_CREATE;

            await groupController.createGroup(request, response, next);

            const nextMock = (next as jest.Mock).mock;
            expect(nextMock.calls).toHaveLength(1);

            const nextMockFirstCall = nextMock.calls[0];
            const firstCallArgument = nextMockFirstCall[0];
            expect(firstCallArgument).toBe(undefined);
        });

        test(
            'in case of error next callback should be called with an error',
            async () => {
                request.body = ERROR_TEST_GROUP_DATA_TO_CREATE;

                await groupController.createGroup(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                expect(nextMock.calls).toHaveLength(1);
            },
        );

        test(
            'in case of error should pass instance of ErrorHandlerData to next callback ',
            async () => {
                request.body = ERROR_TEST_GROUP_DATA_TO_CREATE;

                await groupController.createGroup(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                const nextMockFirstCall = nextMock.calls[0];
                const firstCallArgument = nextMockFirstCall[0];
                expect(firstCallArgument).toBeInstanceOf(ErrorHandlerData);
            },
        );

        test(
            'in case of error the status method of response should not be called',
            async () => {
                request.body = ERROR_TEST_GROUP_DATA_TO_CREATE;

                await groupController.createGroup(request, response, next);

                const statusMock = (response.status as jest.Mock).mock;
                expect(statusMock.calls).toHaveLength(0);
            },
        );

        test(
            'in case of error the json method of response should not be called',
            async () => {
                request.body = ERROR_TEST_GROUP_DATA_TO_CREATE;

                await groupController.createGroup(request, response, next);

                const jsonMock = (response.json as jest.Mock).mock;
                expect(jsonMock.calls).toHaveLength(0);
            },
        );
    });

    describe('updateGroup method', () => {
        const ERROR_TEST_GROUP_ID = 'some';
        const TEST_GROUP = new Group({
            id: 'group_id',
            name: 'group_name',
            permissions: [GroupPermission.Read],
        });
        const TEST_GROUP_DATA_TO_UPDATE: IGroupDataToUpdate = {
            permissions: [GroupPermission.Read, GroupPermission.Write],
        };
        const TEST_UPDATED_GROUP = new Group({
            ...TEST_GROUP,
            ...TEST_GROUP_DATA_TO_UPDATE,
        });

        beforeEach(() => {
            const updateGroupHandler = async (
                id: string,
                groupData: IGroupDataToUpdate,
            ): Promise<GroupServiceResult<Group>> => {
                if (id === TEST_GROUP.id) {
                    return new GroupServiceResult<Group>({
                        data: TEST_UPDATED_GROUP,
                    });
                }
                return new GroupServiceResult<Group>({ error: 'test error text' });
            };
            groupService.updateGroup = jest.fn(updateGroupHandler);
        });

        test('should pass parameters from request to handler', async () => {
            request = {
                params: { id: TEST_GROUP.id },
                body: TEST_GROUP_DATA_TO_UPDATE,
            } as unknown as Request;

            await groupController.updateGroup(request, response, next);

            const updateGroupMock = (groupService.updateGroup as jest.Mock).mock;
            const firstCall = updateGroupMock.calls[0];

            expect(firstCall[0]).toBe(TEST_GROUP.id);
            expect(firstCall[1]).toEqual(TEST_GROUP_DATA_TO_UPDATE);
        });

        test(`should call the status method of response`, async () => {
            request = {
                params: { id: TEST_GROUP.id },
                body: TEST_GROUP_DATA_TO_UPDATE,
            } as unknown as Request;

            await groupController.updateGroup(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            expect(statusMock.calls).toHaveLength(1);
        });

        test(`the status method of response should be ${StatusCodes.OK}`, async () => {
            request = {
                params: { id: TEST_GROUP.id },
                body: TEST_GROUP_DATA_TO_UPDATE,
            } as unknown as Request;

            await groupController.updateGroup(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            const statusFirstCall = statusMock.calls[0];
            const firstCallArgument = statusFirstCall[0];
            expect(firstCallArgument).toBe(StatusCodes.OK);
        });

        test('should call the json method of response', async () => {
            request = {
                params: { id: TEST_GROUP.id },
                body: TEST_GROUP_DATA_TO_UPDATE,
            } as unknown as Request;

            await groupController.updateGroup(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            expect(jsonMock.calls).toHaveLength(1);
        });

        test('the json method of response should receive value from handler', async () => {
            request = {
                params: { id: TEST_GROUP.id },
                body: TEST_GROUP_DATA_TO_UPDATE,
            } as unknown as Request;

            await groupController.updateGroup(request, response, next);

            const jsonMock = (response.json as jest.Mock).mock;
            const jsonFirstCall = jsonMock.calls[0];
            const firstCallArgument = jsonFirstCall[0];

            const updateGroupMock = (groupService.updateGroup as jest.Mock).mock;
            const groupServiceResult = await updateGroupMock.results[0].value;
            const resultValue = groupServiceResult.data!;

            expect(firstCallArgument).toBe(resultValue);
        });

        test('should call next function without arguments', async () => {
            request = {
                params: { id: TEST_GROUP.id },
                body: TEST_GROUP_DATA_TO_UPDATE,
            } as unknown as Request;

            await groupController.updateGroup(request, response, next);

            const nextMock = (next as jest.Mock).mock;
            expect(nextMock.calls).toHaveLength(1);

            const nextMockFirstCall = nextMock.calls[0];
            const firstCallArgument = nextMockFirstCall[0];
            expect(firstCallArgument).toBe(undefined);
        });

        test(
            'in case of error next callback should be called with an error',
            async () => {
                request = {
                    params: { id: TEST_GROUP.id },
                    body: TEST_GROUP_DATA_TO_UPDATE,
                } as unknown as Request;

                await groupController.updateGroup(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                expect(nextMock.calls).toHaveLength(1);
            },
        );

        test(
            'in case of error should pass instance of ErrorHandlerData to next callback ',
            async () => {
                request = {
                    params: { id: ERROR_TEST_GROUP_ID },
                    body: TEST_GROUP_DATA_TO_UPDATE,
                } as unknown as Request;

                await groupController.updateGroup(request, response, next);

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
                    params: { id: ERROR_TEST_GROUP_ID },
                    body: TEST_GROUP_DATA_TO_UPDATE,
                } as unknown as Request;

                await groupController.updateGroup(request, response, next);

                const statusMock = (response.status as jest.Mock).mock;
                expect(statusMock.calls).toHaveLength(0);
            },
        );

        test(
            'in case of error the json method of response should not be called',
            async () => {
                request = {
                    params: { id: ERROR_TEST_GROUP_ID },
                    body: TEST_GROUP_DATA_TO_UPDATE,
                } as unknown as Request;

                await groupController.updateGroup(request, response, next);

                const jsonMock = (response.json as jest.Mock).mock;
                expect(jsonMock.calls).toHaveLength(0);
            },
        );
    });

    describe('deleteGroup method', () => {
        const ERROR_TEST_GROUP_ID = 'some';
        const TEST_GROUP = new Group({
            id: 'group_id',
            name: 'group_name',
            permissions: [GroupPermission.Read],
        });

        beforeEach(() => {
            const deleteGroupHandler = async (
                id: string,
            ): Promise<GroupServiceResult<boolean>> => {
                if (id === TEST_GROUP.id) {
                    return new GroupServiceResult<boolean>({ data: true });
                }
                return new GroupServiceResult<boolean>({ error: 'test error text' });
            };
            groupService.deleteGroup = jest.fn(deleteGroupHandler);
        });

        test('should pass parameters from request to handler', async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.deleteGroup(request, response, next);

            const deleteGroupMock = (groupService.deleteGroup as jest.Mock).mock;
            const firstCall = deleteGroupMock.calls[0];

            expect(firstCall[0]).toBe(TEST_GROUP.id);
        });

        test(`should call the status method of response`, async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.deleteGroup(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            expect(statusMock.calls).toHaveLength(1);
        });

        test(`the status method of response should be ${StatusCodes.OK}`, async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.deleteGroup(request, response, next);

            const statusMock = (response.status as jest.Mock).mock;
            const statusFirstCall = statusMock.calls[0];
            const firstCallArgument = statusFirstCall[0];
            expect(firstCallArgument).toBe(StatusCodes.OK);
        });

        test('should call the send method of response', async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.deleteGroup(request, response, next);

            const sendMock = (response.send as jest.Mock).mock;
            expect(sendMock.calls).toHaveLength(1);
        });

        test('the send method of response should receive value from handler', async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.deleteGroup(request, response, next);

            const sendMock = (response.send as jest.Mock).mock;
            const sendFirstCall = sendMock.calls[0];
            const firstCallArgument = sendFirstCall[0];

            const deleteGroupMock = (groupService.deleteGroup as jest.Mock).mock;
            const groupServiceResult = await deleteGroupMock.results[0].value;
            const resultValue = groupServiceResult.data!;

            expect(firstCallArgument).toBe(resultValue);
        });

        test('should call next function without arguments', async () => {
            request.params = { id: TEST_GROUP.id };

            await groupController.deleteGroup(request, response, next);

            const nextMock = (next as jest.Mock).mock;
            expect(nextMock.calls).toHaveLength(1);

            const nextMockFirstCall = nextMock.calls[0];
            const firstCallArgument = nextMockFirstCall[0];
            expect(firstCallArgument).toBe(undefined);
        });

        test(
            'in case of error next callback should be called with an error',
            async () => {
                request.params = { id: ERROR_TEST_GROUP_ID };

                await groupController.deleteGroup(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                expect(nextMock.calls).toHaveLength(1);
            },
        );

        test(
            'in case of error should pass instance of ErrorHandlerData to next callback ',
            async () => {
                request.params = { id: ERROR_TEST_GROUP_ID };

                await groupController.deleteGroup(request, response, next);

                const nextMock = (next as jest.Mock).mock;
                const nextMockFirstCall = nextMock.calls[0];
                const firstCallArgument = nextMockFirstCall[0];
                expect(firstCallArgument).toBeInstanceOf(ErrorHandlerData);
            },
        );

        test(
            'in case of error the status method of response should not be called',
            async () => {
                request.params = { id: ERROR_TEST_GROUP_ID };

                await groupController.deleteGroup(request, response, next);

                const statusMock = (response.status as jest.Mock).mock;
                expect(statusMock.calls).toHaveLength(0);
            },
        );

        test(
            'in case of error the send method of response should not be called',
            async () => {
                request.params = { id: ERROR_TEST_GROUP_ID };

                await groupController.deleteGroup(request, response, next);

                const sendMock = (response.send as jest.Mock).mock;
                expect(sendMock.calls).toHaveLength(0);
            },
        );
    });
});
