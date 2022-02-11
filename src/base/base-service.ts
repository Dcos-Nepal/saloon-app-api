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
      return await findByIdPromise.populate(options.toPopulate);
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

    const findPromise = options?.toPopulate ? this.model.find(query).populate(options.toPopulate) : this.model.find(query);
    const [rows, totalCount] = await Promise.all([
      findPromise
        .select(options?.fields ? options.fields : '')
        .limit(limit)
        .skip(skip)
        .sort(sortOptions),
      this.model.countDocuments(query)
    ]);

    return { rows, totalCount };
  }

  /**
   * Find All entities that match the given query filters
   *
   * @param query FilterQuery<Entity>
   * @param options IServiceOptions
   * @returns Promise<{ rows: EntityModel[] }
   */
  async find(query: FilterQuery<Entity>, options?: IServiceOptions): Promise<{ rows: EntityModel[] }> {
    const findPromise = options?.toPopulate ? this.model.find(query).populate([options.toPopulate]) : this.model.find(query);
    const rows = await findPromise.select(options?.fields ? options.fields : '');

    return { rows };
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
  async update(id: string, body: Partial<Entity>, session: ClientSession, options?: IServiceOptions): Promise<EntityModel> {
    return await this.model.findOneAndUpdate({ _id: id }, body, { new: true, lean: true, session });
  }

  /**
   * Removes the given entity completely from database.
   *
   * @param id String
   * @param session ClientSession
   * @returns Promise<boolean>
   */
  async remove(id: string, session: ClientSession): Promise<boolean> {
    const resource = await this.model.findById({ _id: id });

    if (!resource) throw new Error('Entity Model not found');

    await resource.remove({ session });

    return true;
  }

  /**
   * Marks the entity as deleted without removing it completely.
   *
   * @param id String
   * @param session ClientSession
   * @param options IServiceOptions<Optional>
   * @returns Promise<EntityModel>
   */
  async softDelete(id: string, session: ClientSession): Promise<EntityModel> {
    return await this.model.findByIdAndUpdate({ _id: id }, { isDeleted: true }, { new: true, lean: true, session });
  }
}

export default BaseService;
