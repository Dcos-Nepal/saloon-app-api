import { ClientSession, FilterQuery, Model, ObjectId } from 'mongoose';
import { IServiceOptions } from 'src/common/interfaces';

class BaseService<EntityModel, Entity> {
  constructor(readonly model: Model<EntityModel>) {}

  /**
   * Finds Entity Model using Entity Id
   *
   * @param id ObjectId | string
   * @returns Promise<EntityModel>
   */
  async findById(id: ObjectId | string, options?: IServiceOptions): Promise<EntityModel> {
    const findByIdPromise = this.model.findById(id, options?.fields || '');

    if (options?.toPopulate) {
      return await findByIdPromise.populate([options.toPopulate]);
    }

    return await findByIdPromise;
  }

  /**
   * Finds one Entity Model
   *
   * @param query FilterQuery
   * @returns Promise<EntityModel[]>
   */
  async findOne(query: FilterQuery<Entity>, options?: IServiceOptions): Promise<EntityModel> {
    const findOnePromise = this.model.findOne(query, options?.fields || '');

    if (options?.toPopulate) {
      return await findOnePromise.populate([options.toPopulate]);
    }

    return await findOnePromise;
  }

  /**
   * Finds all Entity Models
   *
   * @param query FilterQuery
   * @returns Promise<EntityModel[]>
   */
  async findAll(query: FilterQuery<Entity>, options?: IServiceOptions): Promise<{ rows: EntityModel[]; totalCount: number }> {
    const limit = parseInt(query['limit'] || 10);
    const page = parseInt(query['page'] || 1);
    const skip = (page - 1) * limit;

    // Prepare Sort Options
    const sortOptions = options?.sortBy ? options.sortBy : '-createdAt';

    const findPromise = options?.toPopulate ? this.model.find(query).populate([options.toPopulate]) : this.model.find(query);
    const [rows, totalCount] = await Promise.all([findPromise.limit(limit).skip(skip).sort(sortOptions), this.model.countDocuments(query)]);

    return { rows, totalCount };
  }

  /**
   * Create a Entity Document
   *
   * @param data Document Data
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

    if (!resource) throw new Error('Entity Model not found');

    await resource.remove({ session });

    return true;
  }
}

export default BaseService;
