import { openDB, DBSchema } from 'idb';
import { Car } from './types.ts';

const DB_NAME = 'car-maintenance-db';
const DB_VERSION = 1;
const CARS_STORE_NAME = 'cars';

interface CarMaintenanceDB extends DBSchema {
  [CARS_STORE_NAME]: {
    key: string;
    value: Car;
  };
}

const dbPromise = openDB<CarMaintenanceDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(CARS_STORE_NAME)) {
      db.createObjectStore(CARS_STORE_NAME, { keyPath: 'id' });
    }
  },
});

export const getCarsFromDB = async (): Promise<Car[]> => {
  const db = await dbPromise;
  return db.getAll(CARS_STORE_NAME);
};

export const saveCarsToDB = async (cars: Car[]): Promise<void> => {
  const db = await dbPromise;
  const tx = db.transaction(CARS_STORE_NAME, 'readwrite');
  await tx.objectStore(CARS_STORE_NAME).clear();
  await Promise.all(cars.map(car => tx.objectStore(CARS_STORE_NAME).put(car)));
  await tx.done;
};
