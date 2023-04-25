import { CompleteTodoHandler } from '@src/lib/bounded-contexts/todo/todo/application/command-handlers/complete-todo.handler';
import { CompleteTodoCommand } from '@src/lib/bounded-contexts/todo/todo/commands/complete-todo.command';
import { TodoCompletedDomainEvent } from '@src/lib/bounded-contexts/todo/todo/domain/events/todo-completed.event';
import { TodoEntity } from '@src/lib/bounded-contexts/todo/todo/domain/todo.entity';
import { ApplicationErrors } from '@src/lib/bounded-contexts/todo/todo/application/errors';
import { TodoPropsBuilder } from '../../builders/todo-props.builder';
import { Application, ok, fail, Domain } from '@bitloops/bl-boilerplate-core';
import { DomainErrors } from '@src/lib/bounded-contexts/todo/todo/domain/errors';
import { MockTodoWriteRepo } from './todo-write-repo.mock';
import { isDeepStrictEqual } from 'node:util';

// TODO move it in utils for test
const isDomainEventIncludedInDomainEventsArrayAndHowManyTimes = (
  array: Domain.DomainEvent<any>[],
  domainEvent: Domain.DomainEvent<any>,
): {
  exists: boolean;
  count: number;
} => {
  let exists = false;
  let count = 0;
  for (let i = 0; i < array.length; i += 1) {
    if (
      array[i] instanceof domainEvent.constructor &&
      isDeepStrictEqual(domainEvent.payload, array[i].payload)
    ) {
      count += 1;
      exists = true;
    }
  }
  return {
    exists,
    count,
  };
};

// TODO add different classes as well as how many times - this is more than once
const areAllDomainEventsIncludedInDomainEventsArray = (
  domainEventsToCheck: Domain.DomainEvent<any>[],
  domainEvents: Domain.DomainEvent<any>[],
) => {
  for (let i = 0; i < domainEventsToCheck.length; i += 1) {
    const { exists } = isDomainEventIncludedInDomainEventsArrayAndHowManyTimes(
      domainEvents,
      domainEventsToCheck[i],
    );
    if (!exists) {
      return false;
    }
  }
  return true;
};

describe('Feature: Complete todo', () => {
  it(`Scenario: Todo is completed successfully:
    Given that a valid todo exists and it is not completed
    When a complete todo command is issued
    Then the todo should be persisted as completed 
    And a todo completed domain event should be published 
    And the result should be ok`, async () => {
    // given

    const initialTodoProps = new TodoPropsBuilder().getDefault().build();

    const todo = TodoEntity.create(initialTodoProps).value;

    const mockTodoWriteRepo = new MockTodoWriteRepo();

    mockTodoWriteRepo.__add__getById(Promise.resolve(ok(todo)));
    mockTodoWriteRepo.__add__update(Promise.resolve(ok()));

    // when
    const completeTodoCommand = new CompleteTodoCommand({
      todoId: initialTodoProps.id.toString(),
    });

    const completeTodoHandler = new CompleteTodoHandler(mockTodoWriteRepo);
    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then
    const mutatedTodoProps = new TodoPropsBuilder()
      .getDefault()
      .withCompleted(true)
      .build();

    //TODO expect repos to have been called...Do we need it?
    // expect(mockTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
    //   initialTodoProps.id,
    // );
    // expect(mockTodoWriteRepo.mockUpdateMethod).toHaveBeenCalledWith(
    //   expect.any(TodoEntity),
    // );

    const todoAggregate = mockTodoWriteRepo.__get__update().todo;
    expect(todoAggregate.props).toEqual(mutatedTodoProps);

    const todoCompletedEvent = new TodoCompletedDomainEvent({
      userId: mutatedTodoProps.userId.id.toString(),
      title: mutatedTodoProps.title.title,
      completed: mutatedTodoProps.completed,
      aggregateId: mutatedTodoProps.id.toString(),
    });

    const todoCompletedExistsAtAggregate =
      areAllDomainEventsIncludedInDomainEventsArray(
        todoAggregate.domainEvents,
        [todoCompletedEvent],
      );

    expect(todoCompletedExistsAtAggregate).toEqual(true);
    // Different way of checking if the domain event will be published to check for uniqueness
    // expect(res.exists).toEqual(true);
    // expect(res.count).toEqual(1);

    expect(result.value).toBeUndefined();
  });

  it(`Scenario: Todo completed failed, since the todo was not found:
      Given that a todo does not exists
      When a complete todo command is issued
      Then the todo should not be persisted 
      And a todo not found error should be returned
    `, async () => {
    // given

    const initialTodoProps = new TodoPropsBuilder().getDefault().build();

    const output = Promise.resolve(
      fail(new ApplicationErrors.TodoNotFoundError('Todo not found')),
    );

    const mockTodoWriteRepo = new MockTodoWriteRepo();
    mockTodoWriteRepo.__add__getById(output);

    const completeTodoCommand = new CompleteTodoCommand({
      todoId: initialTodoProps.id.toString(),
    });

    // when
    const completeTodoHandler = new CompleteTodoHandler(mockTodoWriteRepo);
    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then
    // expect(mockTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
    //   initialTodoProps.id,
    // );
    expect(result.value).toBeInstanceOf(ApplicationErrors.TodoNotFoundError);
  });

  it(`Scenario: Todo completed failed because the todo was already completed
      Given that the todo exists and it is completed
      When a complete todo command is issued
      Then the todo should not be persisted 
      And a todo was already completed error should be issued`, async () => {
    // given

    const initialTodoProps = new TodoPropsBuilder()
      .getDefault()
      .withCompleted(true)
      .build();

    const todo = TodoEntity.create(initialTodoProps).value;
    const output = Promise.resolve(ok(todo));

    const mockCompleteTodoRepo = new MockTodoWriteRepo();
    mockCompleteTodoRepo.__add__getById(output);

    const completeTodoCommand = new CompleteTodoCommand({
      todoId: initialTodoProps.id.toString(),
    });

    // when
    const completeTodoHandler = new CompleteTodoHandler(mockCompleteTodoRepo);
    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then
    // expect(mockCompleteTodoRepo.mockGetByIdMethod).toHaveBeenCalledWith(
    //   initialTodoProps.id,
    // );
    expect(result.value).toBeInstanceOf(DomainErrors.TodoAlreadyCompletedError);
  });

  it(`Scenario: Todo failed to be completed, due to an unexpected repository error
    Given that a todo exists which is not completed
    When a complete todo command is issued
    Then the todo should not be persisted
    And an unexpected repository error should be returned
  `, async () => {
    const initialTodoProps = new TodoPropsBuilder().getDefault().build();

    const output = Promise.resolve(
      fail(new Application.Repo.Errors.Unexpected('Unexpected error')),
    );

    // given
    const mockTodoWriteRepo = new MockTodoWriteRepo();
    mockTodoWriteRepo.__add__getById(output);

    const completeTodoCommand = new CompleteTodoCommand({
      todoId: initialTodoProps.id.toString(),
    });

    // when
    const completeTodoHandler = new CompleteTodoHandler(mockTodoWriteRepo);
    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then
    // expect(mockTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
    //   initialTodoProps.id,
    // );
    expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  });

  it(`Scenario: Todo failed to be completed, because of an unexpected repository error
      Given that a todo exists which is not completed
      When a complete todo command is issued
      Then the todo should not be persisted
      And an unexpected repository error should be returned
    `, async () => {
    const initialTodoProps = new TodoPropsBuilder().getDefault().build();

    const todo = TodoEntity.create(initialTodoProps).value;

    // given
    const mockTodoWriteRepo = new MockTodoWriteRepo();

    mockTodoWriteRepo.__add__getById(Promise.resolve(ok(todo)));
    mockTodoWriteRepo.__add__update(
      Promise.resolve(
        fail(new Application.Repo.Errors.Unexpected('Unexpected error')),
      ),
    );

    const completeTodoCommand = new CompleteTodoCommand({
      todoId: initialTodoProps.id.toString(),
    });

    // when
    const completeTodoHandler = new CompleteTodoHandler(mockTodoWriteRepo);

    const result = await completeTodoHandler.execute(completeTodoCommand);

    //then
    // expect(mockTodoWriteRepo.mockGetByIdMethod).toHaveBeenCalledWith(
    //   initialTodoProps.id,
    // );

    // expect(mockTodoWriteRepo.mockUpdateMethod).toHaveBeenCalledWith(
    //   expect.any(TodoEntity),
    // );
    expect(result.value).toBeInstanceOf(Application.Repo.Errors.Unexpected);
  });
});
