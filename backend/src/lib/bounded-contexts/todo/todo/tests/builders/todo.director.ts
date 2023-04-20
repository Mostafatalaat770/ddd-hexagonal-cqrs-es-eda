import { TodoProps } from '../../domain/todo.entity';
import { TodoPropsBuilder } from './todo-props.builder';

type TodoPropsBuilderOptionsType = {
  userId?: string;
  title?: string;
  completed?: boolean;
  id?: string;
};

export class TodoPropsDirector {
  private builder: TodoPropsBuilder;
  private DEFAULT_VALUES = {
    userId: '1234',
    title: 'New todo title',
    completed: false,
    id: 'todo1',
  };
  constructor(/*todoPropsBuilderOptionsType: TodoPropsBuilderOptionsType*/) {
    this.builder = new TodoPropsBuilder();
  }

  public buildTodoProps(
    todoPropsBuilderOptionsType?: TodoPropsBuilderOptionsType,
  ): TodoProps {
    const userId =
      todoPropsBuilderOptionsType?.userId || this.DEFAULT_VALUES.userId;
    const title =
      todoPropsBuilderOptionsType?.title || this.DEFAULT_VALUES.title;
    const completed =
      todoPropsBuilderOptionsType?.completed || this.DEFAULT_VALUES.completed;
    const id = todoPropsBuilderOptionsType?.id || this.DEFAULT_VALUES.id;

    return this.builder
      .withTitle(title)
    //   .withUserId(userId)
    //   .withCompleted(completed)
    //   .withId(id)
    //   .build();
  }
}
