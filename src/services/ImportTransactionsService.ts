import csvParse from 'csv-parse';
import path from 'path';
import fs from 'fs';
import { getCustomRepository, getRepository, In } from 'typeorm';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  fileName: string;
}
interface TransactionDTO {
  title: string;
  value: number;
  type: 'outcome' | 'income';
  category: string;
}

class ImportTransactionsService {
  async execute({ fileName }: Request): Promise<Transaction[]> {
    const file = path.join(uploadConfig.directory, fileName);
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);

    const contactReadStream = fs.createReadStream(file);
    const parses = csvParse({
      from_line: 2,
    });

    const transactions: TransactionDTO[] = [];
    const categories: string[] = [];

    const parseCSV = contactReadStream.pipe(parses);

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );
      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existsCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });
    const exitentCategoriesTitles = existsCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !exitentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategory = [...newCategories, ...existsCategories];

    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategory.find(
          category => category.title === transaction.title,
        ),
      })),
    );

    await transactionRepository.save(createdTransactions);

    const fileExists = await fs.promises.stat(file);
    if (fileExists) {
      await fs.promises.unlink(file);
    }

    return createdTransactions;
  }
}

export default ImportTransactionsService;
