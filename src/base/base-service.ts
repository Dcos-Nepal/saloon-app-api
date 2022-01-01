import { FilterQuery, Model, ObjectId } from 'mongoose'
import { IServiceOptions } from 'src/interfaces'
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
  async findAll(query: FilterQuery<Entity>, options?: IServiceOptions): Promise<{ rows: Entity[]; totalCount: number }> {
    const [rows, totalCount] = await Promise.all([this.model.find(query), this.model.countDocuments(query)])
    return { rows, totalCount }
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
