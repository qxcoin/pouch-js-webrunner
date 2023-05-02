import dataSource from '@app/data-source.js';
import { Pair } from '@entities/pair.js';

export class PairService {

  public static async get<T>(key: string, def?: T): Promise<T | undefined> {
    const pair = await dataSource.getRepository(Pair).findOneBy({ key });
    if (null === pair) {
      return def;
    } else {
      return pair.value;
    }
  }

  public static async set(key: string, value: any): Promise<void> {
    const pair = new Pair();
    pair.key = key;
    pair.value = value;
    await dataSource.getRepository(Pair).save(pair);
  }

}
