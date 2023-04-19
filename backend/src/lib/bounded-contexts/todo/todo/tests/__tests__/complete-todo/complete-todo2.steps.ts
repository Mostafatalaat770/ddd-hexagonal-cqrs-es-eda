import { CompleteTodoHandler } from '@src/lib/bounded-contexts/todo/todo/application/command-handlers/complete-todo.handler';
import { CompleteTodoCommand } from '@src/lib/bounded-contexts/todo/todo/commands/complete-todo.command';
import { TodoCompletedDomainEvent } from '@src/lib/bounded-contexts/todo/todo/domain/events/todo-completed.event';
import { TodoEntity } from '@src/lib/bounded-contexts/todo/todo/domain/todo.entity';
import { ApplicationErrors } from '@src/lib/bounded-contexts/todo/todo/application/errors';
import { TodoPropsBuilder } from '../../builders/todo-props.builder';
import { Application, ok, fail, Domain } from '@bitloops/bl-boilerplate-core';
import { DomainErrors } from '@src/lib/bounded-contexts/todo/todo/domain/errors';
import { mockAsyncLocalStorageGet } from '../../mocks/mockAsynLocalStorageGet.mock';
import { ContextBuilder } from '../../builders/context.builder';
import { MockTodoWriteRepo } from './todo-write-repo.mock';

describe('Complete todo feature test', () => {
  it('Todo completed successfully', async () => {
    // given
    console.log(`given that a valid todo exists and is not completed`);

    const COMPLETE_TODO_SUCCESS_PRIMITIVES = {
      userId: { id: '1234' },
      id: 'todo1',
      title: { title: 'New todo title' },
      completed: false,
    };

    mockAsyncLocalStorageGet(COMPLETE_TODO_SUCCESS_PRIMITIVES.userId.id);

    const todo = TodoEntity.fromPrimitives(COMPLETE_TODO_SUCCESS_PRIMITIVES);
    const output = Promise.resolve(ok(todo));

    const mockTodoWriteRepo = new MockTodoWriteRepo();

    mockTodoWriteRepo.__bl__populateTestData('getById', output);
    mockTodoWriteRepo.__bl__populateTestData('update', Promise.resolve(ok()));

    console.log(`When a complete todo command is executed`);
    const completeTodoCommand = new CompleteTodoCommand(
      { todoId: COMPLETE_TODO_SUCCESS_PRIMITIVES.id },
      {
        context: new ContextBuilder()
          .withJWT('jwt')
          .withUserId(COMPLETE_TODO_SUCCESS_PRIMITIVES.userId.id)
          .build(),
      },
    );

    // when
    const completeTodoHandler = new CompleteTodoHandler(
      mockTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then
    console.log(
      `Then the todo should be persisted as completed and a todo completed domain event should be published and the result should be ok`,
    );
    const todoProps = new TodoPropsBuilder()
      .withTitle(COMPLETE_TODO_SUCCESS_PRIMITIVES.title.title)
      .withCompleted(true)
      .withUserId(COMPLETE_TODO_SUCCESS_PRIMITIVES.userId.id)
      .withId(COMPLETE_TODO_SUCCESS_PRIMITIVES.id)
      .build();

    expect(mockTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(COMPLETE_TODO_SUCCESS_PRIMITIVES.id),
    );
    expect(mockTodoWriteRepo.mockUpdateMethod).toHaveBeenCalledWith(
      expect.any(TodoEntity),
    );

    const todoAggregate = mockTodoWriteRepo.mockUpdateMethod.mock.calls[0][0];
    expect(todoAggregate.props).toEqual(todoProps);
    expect(todoAggregate.domainEvents[0]).toBeInstanceOf(
      TodoCompletedDomainEvent,
    );
    expect(result.value).toBeUndefined();
  });

  it('Todo completed failed, todo not found', async () => {
    // given
    console.log(`given that the todo exists and is not completed`);

    const COMPLETE_TODO_NOT_FOUND_CASE = {
      userId: { id: '123' },
      id: 'todo2',
      title: { title: 'New todo title' },
      completed: false,
    };

    mockAsyncLocalStorageGet(COMPLETE_TODO_NOT_FOUND_CASE.userId.id);

    const output = Promise.resolve(
      fail(new ApplicationErrors.TodoNotFoundError('Todo not found')),
    );

    const mockTodoWriteRepo = new MockTodoWriteRepo();
    mockTodoWriteRepo.__bl__populateTestData('getById', output);

    const completeTodoCommand = new CompleteTodoCommand({
      todoId: COMPLETE_TODO_NOT_FOUND_CASE.id,
    });

    // when
    console.log(`When a complete todo command is executed`);
    const completeTodoHandler = new CompleteTodoHandler(
      mockTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then
    console.log(
      `Then the todo should not be persisted and a todo not found error should be returned`,
    );
    expect(mockTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(COMPLETE_TODO_NOT_FOUND_CASE.id),
    );
    expect(result.value).toBeInstanceOf(ApplicationErrors.TodoNotFoundError);
  });

  it('Todo completed failed, todo already completed', async () => {
    // given
    console.log(`given that the todo exists and is not completed`);
    const COMPLETE_TODO_ALREADY_COMPLETED_PRIMITIVES = {
      userId: { id: '123' },
      id: 'todo5',
      title: { title: 'New todo title' },
      completed: true,
    };

    const todo = TodoEntity.fromPrimitives(
      COMPLETE_TODO_ALREADY_COMPLETED_PRIMITIVES,
    );
    const output = Promise.resolve(ok(todo));

    mockAsyncLocalStorageGet(
      COMPLETE_TODO_ALREADY_COMPLETED_PRIMITIVES.userId.id,
    );

    const mockCompleteTodoRepo = new MockTodoWriteRepo();
    mockCompleteTodoRepo.__bl__populateTestData('getById', output);

    const completeTodoCommand = new CompleteTodoCommand({
      todoId: COMPLETE_TODO_ALREADY_COMPLETED_PRIMITIVES.id,
    });

    // when
    const completeTodoHandler = new CompleteTodoHandler(
      mockCompleteTodoRepo.getMockTodoWriteRepo(),
    );
    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then
    expect(mockCompleteTodoRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(COMPLETE_TODO_ALREADY_COMPLETED_PRIMITIVES.id),
    );
    expect(result.value).toBeInstanceOf(DomainErrors.TodoAlreadyCompletedError);
  });

  it('Todo failed to be completed, getById repo error', async () => {
    console.log(`given that the todo exists and is not completed`);
    const COMPLETE_TODO_REPO_ERROR_GETBYID_PRIMITIVES = {
      userId: { id: '123' },
      id: 'todo3',
      title: { title: 'New todo title' },
      completed: false,
    };

    const output = Promise.resolve(
      fail(new Application.Repo.Errors.Unexpected('Unexpected error')),
    );

    mockAsyncLocalStorageGet(
      COMPLETE_TODO_REPO_ERROR_GETBYID_PRIMITIVES.userId.id,
    );

    // given
    const mockTodoWriteRepo = new MockTodoWriteRepo();
    mockTodoWriteRepo.__bl__populateTestData('getById', output);

    const completeTodoCommand = new CompleteTodoCommand({
      todoId: COMPLETE_TODO_REPO_ERROR_GETBYID_PRIMITIVES.id,
    });

    // when
    const completeTodoHandler = new CompleteTodoHandler(
      mockTodoWriteRepo.getMockTodoWriteRepo(),
    );
    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then
    expect(mockTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(COMPLETE_TODO_REPO_ERROR_GETBYID_PRIMITIVES.id),
    );
    expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  });

  it('Todo failed to be completed, save repo error', async () => {
    const COMPLETE_TODO_REPO_ERROR_SAVE_PRIMITIVES = {
      userId: { id: '123' },
      id: 'todo4',
      title: { title: 'New todo title' },
      completed: false,
    };

    mockAsyncLocalStorageGet(
      COMPLETE_TODO_REPO_ERROR_SAVE_PRIMITIVES.userId.id,
    );

    const todo = TodoEntity.fromPrimitives(
      COMPLETE_TODO_REPO_ERROR_SAVE_PRIMITIVES,
    );
    const output = Promise.resolve(ok(todo));

    // given
    const mockTodoWriteRepo = new MockTodoWriteRepo();
    mockTodoWriteRepo.__bl__populateTestData('getById', output);

    mockTodoWriteRepo.__bl__populateTestData(
      'update',
      Promise.resolve(
        fail(new Application.Repo.Errors.Unexpected('Unexpected error')),
      ),
    );

    const completeTodoCommand = new CompleteTodoCommand(
      { todoId: COMPLETE_TODO_REPO_ERROR_SAVE_PRIMITIVES.id },
      {
        context: new ContextBuilder()
          .withJWT('jwt')
          .withUserId(COMPLETE_TODO_REPO_ERROR_SAVE_PRIMITIVES.userId.id)
          .build(),
      },
    );

    // when
    const completeTodoHandler = new CompleteTodoHandler(
      mockTodoWriteRepo.getMockTodoWriteRepo(),
    );

    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then
    const todoProps = new TodoPropsBuilder()
      .withTitle(COMPLETE_TODO_REPO_ERROR_SAVE_PRIMITIVES.title.title)
      .withCompleted(true)
      .withUserId(COMPLETE_TODO_REPO_ERROR_SAVE_PRIMITIVES.userId.id)
      .withId(COMPLETE_TODO_REPO_ERROR_SAVE_PRIMITIVES.id)
      .build();

    expect(mockTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
      new Domain.UUIDv4(COMPLETE_TODO_REPO_ERROR_SAVE_PRIMITIVES.id),
    );
    expect(mockTodoWriteRepo.mockUpdateMethod).toHaveBeenCalledWith(
      expect.any(TodoEntity),
    );
    const todoAggregate = mockTodoWriteRepo.mockUpdateMethod.mock.calls[0][0];
    expect(todoAggregate.props).toEqual(todoProps);
    expect(todoAggregate.domainEvents[0]).toBeInstanceOf(
      TodoCompletedDomainEvent,
    );
    expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  });
});
