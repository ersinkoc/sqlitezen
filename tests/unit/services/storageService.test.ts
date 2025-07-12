import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DatabaseFile } from '@/types/database';

// Mock idb before importing StorageService
vi.mock('idb', () => ({
  openDB: vi.fn(() => Promise.resolve({
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(),
    clear: vi.fn(),
  })),
}));

import { StorageService } from '@/services/storageService';
import { openDB } from 'idb';

describe('StorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save database', async () => {
    const service = new StorageService();
    const mockPut = vi.fn();
    const mockDatabase: DatabaseFile = {
      id: 'test-id',
      name: 'test.db',
      data: new Uint8Array([1, 2, 3]),
      size: 3,
      lastModified: Date.now(),
    };
    
    vi.mocked(openDB).mockResolvedValueOnce({
      put: mockPut,
    } as any);
    
    // Initialize first
    await service.initialize();
    
    await service.saveDatabase(mockDatabase);
    
    expect(openDB).toHaveBeenCalled();
    expect(mockPut).toHaveBeenCalledWith('databases', mockDatabase);
  });

  it('should load database', async () => {
    const service = new StorageService();
    const mockDatabase: DatabaseFile = {
      id: 'test-id',
      name: 'test.db',
      data: new Uint8Array([1, 2, 3]),
      size: 3,
      lastModified: Date.now(),
    };
    
    vi.mocked(openDB).mockResolvedValueOnce({
      get: vi.fn().mockResolvedValue(mockDatabase),
    } as any);
    
    await service.initialize();
    const result = await service.getDatabase('test-id');
    
    expect(result).toEqual(mockDatabase);
  });

  it('should get all databases', async () => {
    const service = new StorageService();
    const mockDatabases: DatabaseFile[] = [
      { id: '1', name: 'test1.db', data: new Uint8Array(), size: 1024, lastModified: Date.now() },
      { id: '2', name: 'test2.db', data: new Uint8Array(), size: 2048, lastModified: Date.now() },
    ];
    
    vi.mocked(openDB).mockResolvedValueOnce({
      getAll: vi.fn().mockResolvedValue(mockDatabases),
    } as any);
    
    await service.initialize();
    const result = await service.getAllDatabases();
    
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('test1.db');
  });

  it('should delete database', async () => {
    const service = new StorageService();
    const mockDelete = vi.fn();
    
    vi.mocked(openDB).mockResolvedValueOnce({
      delete: mockDelete,
    } as any);
    
    await service.initialize();
    await service.deleteDatabase('test-id');
    
    expect(mockDelete).toHaveBeenCalledWith('databases', 'test-id');
  });
});