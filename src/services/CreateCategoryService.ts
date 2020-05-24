import { getRepository } from 'typeorm';
import Category from '../models/Category';

interface Request {
  category: string;
}

class CreateCategoryService {
  public async execute({ category }: Request): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const title = category;
    const titleCapitalize = title
      .toLowerCase()
      .split(' ')
      .map(
        titleUpper =>
          titleUpper.charAt(0).toUpperCase() + titleUpper.substring(1),
      )
      .join(' ');

    const categoryExits = await categoryRepository.findOne({
      where: { title: titleCapitalize },
    });

    if (categoryExits) {
      return categoryExits;
    }

    const categoryCreate = categoryRepository.create({
      title: titleCapitalize,
    });
    await categoryRepository.save(categoryCreate);

    return categoryCreate;
  }
}

export default CreateCategoryService;
