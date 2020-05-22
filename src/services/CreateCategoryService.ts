import Category from "../models/Category";
import { getRepository } from "typeorm";

interface Request {
  category: string;
}

class CreateCategoryService {
  public async execute({ category }: Request): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const title = category;
    const titleCapitalize = title.toLowerCase()
    .split(' ')
    .map((title) => title.charAt(0).toUpperCase() + title.substring(1))
    .join(' ');
    
    const categoryExits = categoryRepository.findOne({where: { title: titleCapitalize }});

    if(categoryExits){
      const category = categoryRepository.create({title: titleCapitalize});

      return category;
    }

    return categoryExits;

  }
}

export default CreateCategoryService;