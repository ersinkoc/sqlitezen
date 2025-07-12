import * as Dialog from '@radix-ui/react-dialog';
import { X, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDatabaseStore } from '@/store/databaseStore';
import toast from 'react-hot-toast';
import { ColumnInfo } from '@/types/database';
import { SQLiteService } from '@/services/sqliteService';

interface RowInsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  columns: string[];
}

export function RowInsertDialog({
  open,
  onOpenChange,
  tableName,
  columns
}: RowInsertDialogProps) {
  const [rowData, setRowData] = useState<(string | null)[]>(
    columns.map(() => '')
  );
  const [columnInfo, setColumnInfo] = useState<ColumnInfo[]>([]);
  const [autoIncrementColumns, setAutoIncrementColumns] = useState<Set<string>>(new Set());
  const { executeQuery, activeConnectionId } = useDatabaseStore();
  const sqliteService = SQLiteService.getInstance();

  useEffect(() => {
    const fetchColumnInfo = async () => {
      if (!activeConnectionId || !tableName || !open) return;
      
      try {
        // Get column information using a separate service call
        const result = await sqliteService.executeQuery(
          activeConnectionId,
          `PRAGMA table_info("${tableName}");`
        );
        
        if (result && result.values) {
          const info: ColumnInfo[] = result.values.map(row => ({
            cid: row[0] as number,
            name: row[1] as string,
            type: row[2] as string,
            notnull: row[3] as number,
            dflt_value: row[4],
            pk: row[5] as number,
          }));
          setColumnInfo(info);
          
          // Check for AUTOINCREMENT columns
          const tableInfoResult = await sqliteService.executeQuery(
            activeConnectionId,
            `SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}';`
          );
          
          if (tableInfoResult && tableInfoResult.values.length > 0) {
            const createStatement = tableInfoResult.values[0][0] as string;
            const autoIncCols = new Set<string>();
            
            // Check if table has AUTOINCREMENT or if it's INTEGER PRIMARY KEY (which is auto-increment by default in SQLite)
            if (createStatement) {
              info.forEach(col => {
                if (col.pk === 1 && col.type.toUpperCase().includes('INTEGER')) {
                  // In SQLite, INTEGER PRIMARY KEY is always auto-increment
                  autoIncCols.add(col.name);
                }
              });
            }
            
            setAutoIncrementColumns(autoIncCols);
          }
        }
      } catch (error) {
        console.error('Failed to fetch column info:', error);
      }
    };

    if (open) {
      fetchColumnInfo();
    }
  }, [open, tableName, activeConnectionId]);

  const handleFieldChange = (index: number, value: string | null) => {
    const newData = [...rowData];
    newData[index] = value;
    setRowData(newData);
  };

  const handleInsert = async () => {
    if (!activeConnectionId) return;

    try {
      // Filter out auto-increment columns
      const insertColumns: string[] = [];
      const insertValues: string[] = [];
      
      columns.forEach((col, index) => {
        if (!autoIncrementColumns.has(col)) {
          insertColumns.push(`"${col}"`);
          
          const value = rowData[index];
          if (value === null || value === '') {
            insertValues.push('NULL');
          } else if (!isNaN(Number(value)) && value !== '') {
            insertValues.push(value);
          } else {
            insertValues.push(`'${value.replace(/'/g, "''")}'`);
          }
        }
      });

      const columnList = insertColumns.join(', ');
      const valuesList = insertValues.join(', ');
      
      const insertQuery = `INSERT INTO "${tableName}" (${columnList}) VALUES (${valuesList});`;
      
      await executeQuery(insertQuery);
      toast.success('Row inserted successfully');
      onOpenChange(false);
      
      // Refresh the table view
      await executeQuery(`SELECT * FROM "${tableName}" LIMIT 100;`);
    } catch (error) {
      toast.error(`Failed to insert row: ${(error as Error).message}`);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Insert New Row - {tableName}
          </Dialog.Title>
          
          <Dialog.Close className="absolute right-4 top-4 p-1 hover:bg-accent rounded-md">
            <X className="h-4 w-4" />
          </Dialog.Close>

          <div className="space-y-4">
            {columnInfo.length > 0 ? columnInfo.map((colInfo) => {
              const columnIndex = columns.indexOf(colInfo.name);
              if (columnIndex === -1) return null;
              
              const isAutoIncrement = autoIncrementColumns.has(colInfo.name);
              
              return (
                <div key={colInfo.name}>
                  <label className="text-sm font-medium mb-1 block">
                    {colInfo.name}
                    {isAutoIncrement && (
                      <span className="text-xs text-muted-foreground ml-2">(Auto-increment)</span>
                    )}
                    {colInfo?.pk && !isAutoIncrement && (
                      <span className="text-xs text-muted-foreground ml-2">(Primary Key)</span>
                    )}
                    {colInfo?.notnull && (
                      <span className="text-xs text-destructive ml-2">*</span>
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={isAutoIncrement ? 'AUTO' : (rowData[columnIndex] || '')}
                      onChange={(e) => !isAutoIncrement && handleFieldChange(columnIndex, e.target.value)}
                      placeholder={isAutoIncrement ? "Will be generated automatically" : "Enter value or leave empty for NULL"}
                      className={`flex-1 px-3 py-2 border rounded-md ${
                        isAutoIncrement 
                          ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                          : 'bg-background'
                      }`}
                      disabled={isAutoIncrement}
                    />
                    {!isAutoIncrement && (
                      <button
                        onClick={() => handleFieldChange(columnIndex, null)}
                        className="px-3 py-2 text-sm border rounded-md hover:bg-accent"
                      >
                        Set NULL
                      </button>
                    )}
                  </div>
                  {colInfo && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Type: {colInfo.type}
                      {colInfo.dflt_value && ` • Default: ${colInfo.dflt_value}`}
                    </p>
                  )}
                </div>
              );
            }) : columns.map((column, index) => {
              // Fallback to original columns if columnInfo is not loaded yet
              if (!isNaN(Number(column))) return null;
              
              return (
                <div key={`${column}-${index}`}>
                  <label className="text-sm font-medium mb-1 block">
                    {column}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={rowData[index] || ''}
                      onChange={(e) => handleFieldChange(index, e.target.value)}
                      placeholder="Enter value or leave empty for NULL"
                      className="flex-1 px-3 py-2 border rounded-md bg-background"
                    />
                    <button
                      onClick={() => handleFieldChange(index, null)}
                      className="px-3 py-2 text-sm border rounded-md hover:bg-accent"
                    >
                      Set NULL
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-6 border-t mt-6">
            <Dialog.Close className="px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors">
              Cancel
            </Dialog.Close>
            
            <button
              onClick={handleInsert}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Insert Row
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}