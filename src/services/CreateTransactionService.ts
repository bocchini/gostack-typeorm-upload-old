import { getRepository } from 'typeorm';

// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import CreateCategoryService from './CreateCategoryService';

interface Request {
  title: string;
  value: number;
  type: 'outcome' | 'income';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getRepository(Transaction);
    
    const categoryRepository = new CreateCategoryService();
    const { id } = categoryRepository.execute({ category });
    
    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: id,
    });

    return transaction;
  }
}

export default CreateTransactionService;
