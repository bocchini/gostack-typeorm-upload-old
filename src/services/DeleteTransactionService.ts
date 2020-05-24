import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

interface Request {
  id: string;
}
class DeleteTransactionService {
  public async execute(id: Request): Promise<void> {
    const transactionModel = getRepository(Transaction);

    const transactionExists = await transactionModel.findOne(id);

    if (!transactionExists) {
      throw new AppError('This transaction don´t exists');
    }

    await transactionModel.remove(transactionExists);
  }
}

export default DeleteTransactionService;
