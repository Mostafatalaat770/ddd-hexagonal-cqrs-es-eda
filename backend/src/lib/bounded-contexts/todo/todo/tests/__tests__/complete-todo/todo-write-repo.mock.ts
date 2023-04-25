import { Application, Domain, Either } from '@bitloops/bl-boilerplate-core';
import { TodoWriteRepoPort } from '@src/lib/bounded-contexts/todo/todo/ports/todo-write.repo-port';
import { TodoEntity } from '../../../domain/todo.entity';

interface IQueue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  size(): number;
}

class Queue<T> implements IQueue<T> {
  private storage: T[] = [];

  constructor(private capacity: number = Infinity) {}

  public enqueue(item: T): void {
    if (this.size() === this.capacity) {
      throw Error('Queue has reached max capacity, you cannot add more items');
    }
    this.storage.push(item);
  }

  public dequeue(): T | undefined {
    return this.storage.shift();
  }

  public size(): number {
    return this.storage.length;
  }
}

type MockOutputDataType = any;
type MockMethodsDataType = Record<string, IQueue<Either<any, any>>>;
type MockInputDataType = Record<string, any>;
type InputsDataType = Record<string, MockInputDataType[]>;

abstract class MockRepo {
  protected mocks: MockMethodsDataType = {};
  protected inputs: InputsDataType = {};

  protected __populateTestOutputData(
    methodName: keyof TodoWriteRepoPort,
    mockOutputData: MockOutputDataType,
  ) {
    if (!this.mocks[methodName]) {
      this.mocks[methodName] = new Queue();
    }
    this.mocks[methodName].enqueue(mockOutputData);
  }

  protected __populateTestInputData(
    methodName: keyof TodoWriteRepoPort,
    mockInputData: MockInputDataType,
  ) {
    if (!this.inputs[methodName]) {
      this.inputs[methodName] = [];
    }
    this.inputs[methodName].push(mockInputData);
  }

  protected __getTestOutputByMethodName(methodName: keyof TodoWriteRepoPort) {
    const outputData = this.mocks[methodName].dequeue();
    return outputData;
  }

  protected __getMethodInputsByMethodNameAndCall(
    methodName: keyof TodoWriteRepoPort,
    call: number,
  ): MockInputDataType {
    if (!this.inputs[methodName]) {
      throw new Error('No inputs for this method');
    }
    if (!this.inputs[methodName][call]) {
      throw new Error('No inputs for this call');
    }
    const methodInputs = this.inputs[methodName][call];
    return methodInputs;
  }
}

export class MockTodoWriteRepo extends MockRepo implements TodoWriteRepoPort {
  constructor() {
    super();
  }

  public async save(
    todo: TodoEntity,
  ): Promise<Either<void, Application.Repo.Errors.Unexpected>> {
    this.__populateTestInputData('getById', { aggregate: todo });
    const methodData = this.__getTestOutputByMethodName('save');
    return methodData as Either<void, Application.Repo.Errors.Unexpected>;
  }

  public async getById(
    id: Domain.UUIDv4,
  ): Promise<Either<TodoEntity | null, Application.Repo.Errors.Unexpected>> {
    this.__populateTestInputData('getById', { aggregateRootId: id });
    const methodData = this.__getTestOutputByMethodName('getById');
    return methodData;
  }

  public async update(
    todo: TodoEntity,
  ): Promise<Either<void, Application.Repo.Errors.Unexpected>> {
    this.__populateTestInputData('update', { aggregate: todo });
    const methodData = this.__getTestOutputByMethodName('update');
    return methodData as Either<void, Application.Repo.Errors.Unexpected>;
  }

  public async delete(
    todo: TodoEntity,
  ): Promise<Either<void, Application.Repo.Errors.Unexpected>> {
    this.__populateTestInputData('delete', { aggregate: todo });
    const methodData = this.__getTestOutputByMethodName('delete');
    return methodData as Either<void, Application.Repo.Errors.Unexpected>;
  }

  public __add__getById(mockOutputData: MockOutputDataType) {
    this.__populateTestOutputData('getById', mockOutputData);
  }

  public __add__update(mockOutputData: MockOutputDataType) {
    this.__populateTestOutputData('update', mockOutputData);
  }

  public __get__getById(calls = 0) {
    return this.__getMethodInputsByMethodNameAndCall('getById', calls);
  }

  public __get__update(calls = 0) {
    return this.__getMethodInputsByMethodNameAndCall('update', calls);
  }
}
