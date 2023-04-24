import { Application, Either } from '@bitloops/bl-boilerplate-core';
import { TodoWriteRepoPort } from '@src/lib/bounded-contexts/todo/todo/ports/todo-write.repo-port';

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

abstract class MockRepo {
  protected mocks: MockMethodsDataType = {};

  protected __bl__populateTestData(
    methodName: keyof TodoWriteRepoPort,
    mockOutputData: MockOutputDataType,
  ) {
    if (!this.mocks[methodName]) {
      this.mocks[methodName] = new Queue();
    }
    this.mocks[methodName].enqueue(mockOutputData);
  }

  protected __bl__getTestOutputByMethodName(
    methodName: keyof TodoWriteRepoPort,
  ) {
    const outputData = this.mocks[methodName].dequeue();
    return outputData;
  }
}

export class MockTodoWriteRepo extends MockRepo {
  public readonly mockUpdateMethod: jest.Mock;
  public readonly mockGetByIdMethod: jest.Mock;
  private readonly mockTodoWriteRepo: TodoWriteRepoPort;

  constructor() {
    super();
    this.mockUpdateMethod = this.updateMethod();
    this.mockGetByIdMethod = this.getByIdMethod();
    this.mockTodoWriteRepo = {
      save: jest.fn(),
      getById: this.mockGetByIdMethod,
      update: this.mockUpdateMethod,
      delete: jest.fn(),
    };
  }

  getMockTodoWriteRepo(): TodoWriteRepoPort {
    return this.mockTodoWriteRepo;
  }

  private getByIdMethod(): jest.Mock {
    return jest.fn(() => {
      const methodData = this.__bl__getTestOutputByMethodName('getById');
      return Promise.resolve(methodData);
    });
  }

  private updateMethod(): jest.Mock {
    return jest.fn(
      (): Promise<Either<void, Application.Repo.Errors.Unexpected>> => {
        const methodData = this.__bl__getTestOutputByMethodName('update');
        return Promise.resolve(methodData);
      },
    );
  }

  public __add__getById(mockOutputData: MockOutputDataType) {
    this.__bl__populateTestData('getById', mockOutputData);
  }

  public __add__update(mockOutputData: MockOutputDataType) {
    this.__bl__populateTestData('update', mockOutputData);
  }
}
