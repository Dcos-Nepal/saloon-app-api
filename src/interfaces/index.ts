import { IUser } from 'src/modules/users/interfaces/user.interface';

interface IServiceOptions {
  authUser?: IUser;
  fields?: string;
}

export { IUser, IServiceOptions };
