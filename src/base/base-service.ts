import { FilterQuery, Model, ObjectId } from 'mongoose'
import { User } from 'src/users/interfaces/user.interface'

export interface IServiceOptions {
  authUser?: User
}

class BaseService<Entity> {
  constructor(readonly model: Model<Entity>) {}

  /**
   * Finds entity using id
   *
   * @param id ObjectId | string
   * @returns Promise<User>
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findById(id: ObjectId | string, options?: IServiceOptions): Promise<Entity> {
    return await this.model.findById(id)
  }

  /**
   * Finds all
   *
   * @param query FilterQuery
   * @returns Promise<Entity[]>
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findAll(query: FilterQuery<Entity>, options?: IServiceOptions): Promise<Entity[]> {
    return await this.model.find(query)
  }

  /**
   * Finds one entity
   *
   * @param query FilterQuery
   * @returns Promise<Entity[]>
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findOne(query: FilterQuery<Entity>, options?: IServiceOptions): Promise<Entity> {
    return await this.model.findOne(query)
  }
}

export default BaseService
