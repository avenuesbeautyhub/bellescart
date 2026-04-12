import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

export interface IBaseRepository<T extends Document> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  find(filter: FilterQuery<T>, options?: { limit?: number; skip?: number; sort?: any }): Promise<T[]>;
  update(id: string, data: UpdateQuery<T>): Promise<T | null>;
  updateMany(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<{ modifiedCount: number }>;
  delete(id: string): Promise<T | null>;
  deleteMany(filter: FilterQuery<T>): Promise<{ deletedCount: number }>;
  count(filter: FilterQuery<T>): Promise<number>;
}

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(protected model: Model<T>) { }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id);
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter);
  }

  async find(
    filter: FilterQuery<T>,
    options?: { limit?: number; skip?: number; sort?: any }
  ): Promise<T[]> {
    let query = this.model.find(filter);

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    if (options?.skip) {
      query = query.skip(options.skip);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return query;
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async updateMany(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<{ modifiedCount: number }> {
    return this.model.updateMany(filter, data);
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id);
  }

  async deleteMany(filter: FilterQuery<T>): Promise<{ deletedCount: number }> {
    return this.model.deleteMany(filter);
  }

  async count(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter);
  }
}
