import { EntityRepository, Repository } from "typeorm";

import Category from "../models/Category";

@EntityRepository(Category)
class EntityRepository extends Repository<Category> {
  public async findByName({title}: Category):Promise<Category | null>{
    const findCategory = await this.findOne({
      where: { title },
    });

    return findCategory || null;
  }

}

export default EntityRepository;