import { Domain } from '@bitloops/bl-boilerplate-core';
import {
  TitleProps,
  TitleVO,
} from '@src/lib/bounded-contexts/todo/todo/domain/title.value-object';
import { TodoProps } from '@src/lib/bounded-contexts/todo/todo/domain/todo.entity';
import {
  UserIdProps,
  UserIdVO,
} from '@src/lib/bounded-contexts/todo/todo/domain/user-id.value-object';

export class TodoPropsBuilder {
  private userId: UserIdProps;
  private title: TitleProps;
  private completed: boolean;
  private id?: string;

  private userIdPropsBuilder: UserIdPropsBuilder;
  private titlePropsBuilder: TitlePropsBuilder;

  private DEFAULT_VALUES = {
    completed: false,
    id: 'todo1',
  };

  constructor() {
    this.userIdPropsBuilder = new UserIdPropsBuilder();
    this.titlePropsBuilder = new TitlePropsBuilder();
  }

  getDefault(): TodoPropsBuilder {
    return this.withTitle(this.titlePropsBuilder.getDefault())
      .withId(this.DEFAULT_VALUES.id)
      .withUserId(this.userIdPropsBuilder.getDefault())
      .withCompleted(this.DEFAULT_VALUES.completed);
  }

  withUserId(userId: UserIdProps): TodoPropsBuilder {
    this.userId = this.userIdPropsBuilder.withUserId(userId.id.toString());
    return this;
  }

  withTitle(title: TitleProps): TodoPropsBuilder {
    this.title = this.titlePropsBuilder.withTitle(title.title);
    return this;
  }

  withCompleted(completed: boolean): TodoPropsBuilder {
    this.completed = completed;
    return this;
  }

  withId(id: string): TodoPropsBuilder {
    this.id = id;
    return this;
  }

  build(): TodoProps {
    const todoProps: TodoProps = {
      userId: UserIdVO.create(this.userId).value as UserIdVO,
      title: TitleVO.create(this.title).value as TitleVO,
      completed: this.completed,
    };
    if (this.id) {
      todoProps.id = new Domain.UUIDv4(this.id);
    }
    return todoProps;
  }
}

class UserIdPropsBuilder {
  public id: Domain.UUIDv4;
  private DEFAULT_VALUES = {
    userId: '1234',
  };

  getDefault(): UserIdPropsBuilder {
    return this.withUserId(this.DEFAULT_VALUES.userId);
  }

  withUserId(userId: string) {
    this.id = new Domain.UUIDv4(userId);
    return this;
  }

  build(): UserIdProps {
    return { id: this.id };
  }
}

//TitleProps

class TitlePropsBuilder {
  title: string;
  private DEFAULT_VALUES = {
    title: 'New todo title',
  };

  getDefault(): TitlePropsBuilder {
    return this.withTitle(this.DEFAULT_VALUES.title);
  }

  withTitle(title: string) {
    this.title = title;
    return this;
  }

  build(): TitleProps {
    return { title: this.title };
  }
}
