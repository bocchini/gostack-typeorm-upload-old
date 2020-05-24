import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import CreateCategoryService from './CreateCategoryService';
import TransactionRepository from '../repositories/TransactionsRepository';

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
    const transactionModel = getRepository(Transaction);

    const categoryRepository = new CreateCategoryService();
    const categoryCreate = await categoryRepository.execute({ category });

    const transactionRepository = getCustomRepository(TransactionRepository);
    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('Don´t have balance');
    }
    const transaction = transactionModel.create({
      title,
      value,
      type,
      category_id: categoryCreate.id,
    });

    await transactionModel.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
