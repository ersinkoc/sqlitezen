import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { DatabaseFile } from '@/types/database';

interface SQLiteZenDB extends DBSchema {
  databases: {
    key: string;
    value: DatabaseFile;
    indexes: { 'by-name': string };
  };
  preferences: {
    key: string;
    value: any;
  };
}

export class StorageService {
  private db: IDBPDatabase<SQLiteZenDB> | null = null;
  private readonly DB_NAME = 'SQLiteZen';
  private readonly DB_VERSION = 1;

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<SQLiteZenDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Create databases store
        if (!db.objectStoreNames.contains('databases')) {
          const databaseStore = db.createObjectStore('databases', { keyPath: 'id' });
          databaseStore.createIndex('by-name', 'name');
        }

        // Create preferences store
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences');
        }
      },
    });
  }

  async saveDatabase(database: DatabaseFile): Promise<void> {
    if (!this.db) throw new Error('Storage not initialized');
    
    await this.db.put('databases', database);
  }

  async getDatabase(id: string): Promise<DatabaseFile | undefined> {
    if (!this.db) throw new Error('Storage not initialized');
    
    return await this.db.get('databases', id);
  }

  async getDatabaseByName(name: string): Promise<DatabaseFile | undefined> {
    if (!this.db) throw new Error('Storage not initialized');
    
    const index = this.db.transaction('databases').store.index('by-name');
    return await index.get(name);
  }

  async getAllDatabases(): Promise<DatabaseFile[]> {
    if (!this.db) throw new Error('Storage not initialized');
    
    return await this.db.getAll('databases');
  }

  async deleteDatabase(id: string): Promise<void> {
    if (!this.db) throw new Error('Storage not initialized');
    
    await this.db.delete('databases', id);
  }

  async savePreference(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Storage not initialized');
    
    await this.db.put('preferences', value, key);
  }

  async getPreference(key: string): Promise<any> {
    if (!this.db) throw new Error('Storage not initialized');
    
    return await this.db.get('preferences', key);
  }

  async getAllPreferences(): Promise<Record<string, any>> {
    if (!this.db) throw new Error('Storage not initialized');
    
    const keys = await this.db.getAllKeys('preferences');
    const values = await this.db.getAll('preferences');
    
    const preferences: Record<string, any> = {};
    keys.forEach((key, index) => {
      preferences[key as string] = values[index];
    });
    
    return preferences;
  }

  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Storage not initialized');
    
    const tx = this.db.transaction(['databases', 'preferences'], 'readwrite');
    await Promise.all([
      tx.objectStore('databases').clear(),
      tx.objectStore('preferences').clear(),
    ]);
  }
}