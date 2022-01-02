import { ClientSession, FilterQuery, Model, ObjectId } from 'mongoose';
import { IServiceOptions } from 'src/interfaces';

class BaseService<EntityModel, Entity> {
  constructor(readonly model: Model<EntityModel>) {}

  /**
   * Finds entityModel using id
   *
   * @param id ObjectId | string
   * @returns Promise<User>
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findById(id: ObjectId | string, options?: IServiceOptions): Promise<EntityModel> {
    return await this.model.findById(id, options?.fields || '');
  }

  /**
   * Finds one entityModel
   *
   * @param query FilterQuery
   * @returns Promise<EntityModel[]>
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findOne(query: FilterQuery<Entity>, options?: IServiceOptions): Promise<EntityModel> {
    return await this.model.findOne(query, options?.fields || '');
  }

  /**
   * Finds all
   *
   * @param query FilterQuery
   * @returns Promise<EntityModel[]>
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findAll(query: FilterQuery<Entity>, options?: IServiceOptions): Promise<{ rows: EntityModel[]; totalCount: number }> {
    const limit = parseInt(query['limit'] || 10);
    const page = parseInt(query['page'] || 1);
    const skip = (page - 1) * limit;
    const [rows, totalCount] = await Promise.all([this.model.find(query).limit(limit).skip(skip).sort('-createdAt'), this.model.countDocuments(query)]);
    return { rows, totalCount };
  }

  /**
   * Create a document
   *
   * @param data Document data
   * @returns Promise<EntityModel>
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create(data: Entity, session: ClientSession, options?: IServiceOptions): Promise<EntityModel> {
    const document = await this.model.create([data], { session });
    return document[0];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: string, body: Partial<Entity>, session: ClientSession, options?: IServiceOptions) {
    return await this.model.findOneAndUpdate({ _id: id }, body, { new: true, lean: true, session });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(id: string, session: ClientSession, options?: IServiceOptions) {
    const resource = await this.model.findById({ _id: id });
    if (!resource) throw new Error('Model not found');
    await resource.remove({ session });
    return true;
  }
}

export default BaseService;
