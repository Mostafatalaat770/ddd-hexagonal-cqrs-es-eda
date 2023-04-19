import {
  Application,
  Domain,
  Either,
  // ok,
  // fail,
} from '@bitloops/bl-boilerplate-core';
import { TodoEntity } from '@src/lib/bounded-contexts/todo/todo/domain/todo.entity';
import { TodoWriteRepoPort } from '@src/lib/bounded-contexts/todo/todo/ports/todo-write.repo-port';
// import { DomainErrors } from '@src/lib/bounded-contexts/todo/todo/domain/errors';
// import {
//   COMPLETE_TODO_ALREADY_COMPLETED_CASE,
//   COMPLETE_TODO_NOT_FOUND_CASE,
//   COMPLETE_TODO_REPO_ERROR_GETBYID_CASE,
//   COMPLETE_TODO_REPO_ERROR_SAVE_CASE,
//   COMPLETE_TODO_SUCCESS_CASE,
// } from './complete-todo.mock';
// import { UUIDv4 } from '@bitloops/bl-boilerplate-core/lib/cjs/types/domain/UUIDv4';

// export class MockCompleteTodoWriteRepo {
//   public readonly mockUpdateMethod: jest.Mock;
//   public readonly mockGetByIdMethod: jest.Mock;
//   private mockTodoWriteRepo: TodoWriteRepoPort;

//   constructor() {
//     this.mockUpdateMethod = this.getMockUpdateMethod();
//     this.mockGetByIdMethod = this.getMockGetByIdMethod();
//     this.mockTodoWriteRepo = {
//       save: jest.fn(),
//       getById: this.mockGetByIdMethod,
//       update: this.mockUpdateMethod,
//       delete: jest.fn(),
//     };
//   }

//   getMockTodoWriteRepo(): TodoWriteRepoPort {
//     return this.mockTodoWriteRepo;
//   }

//   private getMockUpdateMethod(): jest.Mock {
//     return jest.fn(
//       (
//         todo: TodoEntity,
//       ): Promise<Either<void, Application.Repo.Errors.Unexpected>> => {
//         if (
//           todo.userId.id.equals(
//             new Domain.UUIDv4(COMPLETE_TODO_REPO_ERROR_SAVE_CASE.userId.id),
//           )
//         ) {
//           return Promise.resolve(
//             fail(new Application.Repo.Errors.Unexpected('Unexpected error')),
//           );
//         }
//         return Promise.resolve(ok());
//       },
//     );
//   }

//   private getMockGetByIdMethod() {
//     return jest.fn(
//       (
//         id: Domain.UUIDv4,
//       ): Promise<
//         Either<
//           TodoEntity | null,
//           | DomainErrors.TodoAlreadyCompletedError
//           | Application.Repo.Errors.Unexpected
//         >
//       > => {
//         if (id.equals(new Domain.UUIDv4(COMPLETE_TODO_SUCCESS_CASE.id))) {
//           const todo = TodoEntity.fromPrimitives(COMPLETE_TODO_SUCCESS_CASE);
//           return Promise.resolve(ok(todo));
//         }
//         if (id.equals(new Domain.UUIDv4(COMPLETE_TODO_NOT_FOUND_CASE.id))) {
//           return Promise.resolve(ok(null));
//         }
//         if (
//           id.equals(new Domain.UUIDv4(COMPLETE_TODO_ALREADY_COMPLETED_CASE.id))
//         ) {
//           return Promise.resolve(
//             fail(new DomainErrors.TodoAlreadyCompletedError(id.toString())),
//           );
//         }
//         if (
//           id.equals(new Domain.UUIDv4(COMPLETE_TODO_REPO_ERROR_GETBYID_CASE.id))
//         ) {
//           return Promise.resolve(
//             fail(new Application.Repo.Errors.Unexpected('Unexpected error')),
//           );
//         }
//         if (
//           id.equals(new Domain.UUIDv4(COMPLETE_TODO_REPO_ERROR_SAVE_CASE.id))
//         ) {
//           const todo = TodoEntity.fromPrimitives(
//             COMPLETE_TODO_REPO_ERROR_SAVE_CASE,
//           );
//           return Promise.resolve(ok(todo));
//         }
//         return Promise.resolve(ok(null));
//       },
//     );
//   }
// }

// type MockDataType = {
//   input: Domain.UUIDv4 | Domain.Aggregate<any>;
//   output: any;
// };

// type MethodInputOutputDataType = Record<string, any[]>;

// type MockMethodsDataType = Record<string, MethodInputOutputDataType>;

// export class MockTodoWriteRepo {
//   private mocks: MockMethodsDataType = {};
//   private mockTodoWriteRepo: TodoWriteRepoPort;
//   public readonly mockUpdateMethod: jest.Mock;
//   public readonly mockGetByIdMethod: jest.Mock;

//   constructor() {
//     this.mockUpdateMethod = this.updateMethod();
//     this.mockGetByIdMethod = this.getByIdMethod();
//     this.mockTodoWriteRepo = {
//       save: jest.fn(),
//       getById: this.mockGetByIdMethod,
//       update: this.mockUpdateMethod,
//       delete: jest.fn(),
//     };
//   }

//   getMockTodoWriteRepo(): TodoWriteRepoPort {
//     return this.mockTodoWriteRepo;
//   }

//   public getByIdMethod(): jest.Mock {
//     return jest.fn((id: Domain.UUIDv4) => {
//       const methodData = this.__bl__getTestDataByMethodNameAndInput(
//         'getById',
//         // id.toString(),
//         id,
//       );
//       return methodData;
//     });
//   }

//   public updateMethod(): jest.Mock {
//     return jest.fn(
//       (
//         todo: TodoEntity,
//       ): Promise<Either<void, Application.Repo.Errors.Unexpected>> => {
//         const methodData = this.__bl__getTestDataByMethodNameAndInput(
//           'update',
//           // todo.id.toString(), // TODO json stringify for Id? NO id
//           // todo.id,
//           todo,
//         );
//         return methodData;
//         // return Promise.resolve(ok());
//       },
//     );
//   }

//   //   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   //   public delete(): Promise<Either<void, UnexpectedError>> {
//   //     return Promise.resolve(ok());
//   //   }

//   //   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   //   public save(): Promise<Either<void, UnexpectedError>> {
//   //     return Promise.resolve(ok());
//   //   }

//   //  <uuid>: <any>

//   //  <entity> : <uuid>
//   // [any, any, ...]:

//   private getArguments(...args) {
//     return args;
//   }

//   private getHashFromString(str: string): string {
//     return createHash('md5').update(str).digest('hex');
//   }

//   private getHashKeyFromInput(input: any): string {
//     const args = this.getArguments(input);
//     return this.getHashFromString(JSON.stringify(args));
//   }

//   public __bl__populateTestData(methodName: string, data: MockDataType) {
//     // let id: string;
//     // console.log('args: ', this.getArguments(data.input));
//     // console.log('getHash', this.getHashKeyFromInput(data.input));
//     console.log('data.input', data.input);
//     const id = this.getHashKeyFromInput(data.input);
//     // if (data.input instanceof Domain.UUIDv4) {
//     //   id = data.input.toString();
//     // } else if (data.input instanceof Domain.Aggregate) {
//     //   id = data.input.id.toString();
//     // } else
//     //   throw new Error(
//     //     'Unknown input type for mock data - an id must be provided',
//     //   );

//     if (!this.mocks[methodName]) {
//       this.mocks[methodName] = {
//         [id]: [],
//       };
//     } else if (!this.mocks[methodName][id]) {
//       this.mocks[methodName][id] = [];
//     }
//     // console.log('data.input', data.input);
//     this.mocks[methodName][id].push(data.output);
//     console.log('this.mocks', this.mocks);
//   }

//   private __bl__getTestDataByMethodName(methodName: string) {
//     return this.mocks[methodName];
//   }

//   private __bl__getTestDataByMethodNameAndInput(
//     methodName: string,
//     input: any,
//   ) {
//     const data = this.__bl__getTestDataByMethodName(methodName);
//     console.log('methodName', methodName);
//     console.log('data', data);
//     console.log('input', input);
//     const id = this.getHashKeyFromInput(input);
//     console.log('id to mach', id);
//     return data[id][0]; // TODO change to be able to return depending on the time it was called
//   }
// }

interface IQueue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  size(): number;
}

class Queue<T> implements IQueue<T> {
  private storage: T[] = [];

  constructor(private capacity: number = Infinity) {}

  enqueue(item: T): void {
    if (this.size() === this.capacity) {
      throw Error('Queue has reached max capacity, you cannot add more items');
    }
    this.storage.push(item);
  }
  dequeue(): T | undefined {
    return this.storage.shift();
  }
  size(): number {
    return this.storage.length;
  }
}

type MockOutputDataType = any;
type MockMethodsDataType = Record<string, IQueue<any>>; // Either<any, any>

export class MockTodoWriteRepo {
  private mocks: MockMethodsDataType = {};
  private mockTodoWriteRepo: TodoWriteRepoPort;
  public readonly mockUpdateMethod: jest.Mock;
  public readonly mockGetByIdMethod: jest.Mock;

  constructor() {
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

  public getByIdMethod(): jest.Mock {
    return jest.fn((id: Domain.UUIDv4) => {
      const methodData = this.__bl__getTestOutputByMethodName('getById');
      console.log('[getByIdMethod]this.mocks', this.mocks)
      return methodData;
    });
  }

  public updateMethod(): jest.Mock {
    return jest.fn(
      (
        todo: TodoEntity,
      ): Promise<Either<void, Application.Repo.Errors.Unexpected>> => {
        const methodData = this.__bl__getTestOutputByMethodName('update');
        return methodData;
      },
    );
  }

  public __bl__populateTestData(
    methodName: string,
    mockOutputData: MockOutputDataType,
  ) {
    if (!this.mocks[methodName]) {
      this.mocks[methodName] = new Queue();
    }
    this.mocks[methodName].enqueue(mockOutputData);
  }

  public __bl__getTestOutputByMethodName(methodName: string) {
    const outputData = this.mocks[methodName].dequeue();
    console.log('[__bl__getTestOutputByMethodName]outputData', outputData);
    return outputData;
  }
}
