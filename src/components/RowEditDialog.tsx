import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDatabaseStore } from '@/store/databaseStore';
import toast from 'react-hot-toast';
import { ColumnInfo } from '@/types/database';
import { SQLiteService } from '@/services/sqliteService';

interface RowEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  columns: string[];
  rowData: any[];
  primaryKeyColumn?: string;
}

export function RowEditDialog({
  open,
  onOpenChange,
  tableName,
  columns,
  rowData,
  primaryKeyColumn
}: RowEditDialogProps) {
  const [editedData, setEditedData] = useState<any[]>(rowData);
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
          const autoIncCols = new Set<string>();
          info.forEach(col => {
            if (col.pk === 1 && col.type.toUpperCase().includes('INTEGER')) {
              // In SQLite, INTEGER PRIMARY KEY is always auto-increment
              autoIncCols.add(col.name);
            }
          });
          
          setAutoIncrementColumns(autoIncCols);
        }
      } catch (error) {
        console.error('Failed to fetch column info:', error);
      }
    };

    if (open) {
      fetchColumnInfo();
    }
  }, [open, tableName, activeConnectionId]);

  const handleFieldChange = (index: number, value: any) => {
    const newData = [...editedData];
    newData[index] = value;
    setEditedData(newData);
  };

  const handleSave = async () => {
    if (!activeConnectionId) return;

    try {
      // Build UPDATE query (exclude auto-increment columns)
      const setClauses = columns
        .map((col, idx) => {
          if (autoIncrementColumns.has(col)) return null; // Skip auto-increment columns
          const value = editedData[idx];
          if (value === null) return `"${col}" = NULL`;
          if (typeof value === 'number') return `"${col}" = ${value}`;
          return `"${col}" = '${String(value).replace(/'/g, "''")}'`;
        })
        .filter(clause => clause !== null)
        .join(', ');

      let whereClause = '';
      if (primaryKeyColumn) {
        const pkIndex = columns.indexOf(primaryKeyColumn);
        const pkValue = rowData[pkIndex];
        whereClause = ` WHERE "${primaryKeyColumn}" = ${
          typeof pkValue === 'number' ? pkValue : `'${pkValue}'`
        }`;
      } else {
        // If no primary key, use all original values for WHERE clause
        const conditions = columns
          .map((col, idx) => {
            const value = rowData[idx];
            if (value === null) return `"${col}" IS NULL`;
            if (typeof value === 'number') return `"${col}" = ${value}`;
            return `"${col}" = '${String(value).replace(/'/g, "''")}'`;
          })
          .join(' AND ');
        whereClause = ` WHERE ${conditions}`;
      }

      const updateQuery = `UPDATE "${tableName}" SET ${setClauses}${whereClause};`;
      
      await executeQuery(updateQuery);
      toast.success('Row updated successfully');
      onOpenChange(false);
      
      // Refresh the table view
      await executeQuery(`SELECT * FROM "${tableName}" LIMIT 100;`);
    } catch (error) {
      toast.error(`Failed to update row: ${(error as Error).message}`);
    }
  };

  const handleDelete = async () => {
    if (!activeConnectionId) return;
    
    if (!confirm('Are you sure you want to delete this row?')) return;

    try {
      let whereClause = '';
      if (primaryKeyColumn) {
        const pkIndex = columns.indexOf(primaryKeyColumn);
        const pkValue = rowData[pkIndex];
        whereClause = ` WHERE "${primaryKeyColumn}" = ${
          typeof pkValue === 'number' ? pkValue : `'${pkValue}'`
        }`;
      } else {
        // If no primary key, use all values for WHERE clause
        const conditions = columns
          .map((col, idx) => {
            const value = rowData[idx];
            if (value === null) return `"${col}" IS NULL`;
            if (typeof value === 'number') return `"${col}" = ${value}`;
            return `"${col}" = '${String(value).replace(/'/g, "''")}'`;
          })
          .join(' AND ');
        whereClause = ` WHERE ${conditions}`;
      }

      const deleteQuery = `DELETE FROM "${tableName}"${whereClause};`;
      
      await executeQuery(deleteQuery);
      toast.success('Row deleted successfully');
      onOpenChange(false);
      
      // Refresh the table view
      await executeQuery(`SELECT * FROM "${tableName}" LIMIT 100;`);
    } catch (error) {
      toast.error(`Failed to delete row: ${(error as Error).message}`);
    }
  };

  const getInputType = (value: any) => {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'checkbox';
    return 'text';
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Edit Row - {tableName}
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
                      <span className="text-xs text-muted-foreground ml-2">(Auto-increment - Read Only)</span>
                    )}
                    {colInfo?.pk && !isAutoIncrement && (
                      <span className="text-xs text-muted-foreground ml-2">(Primary Key)</span>
                    )}
                    {colInfo?.notnull && (
                      <span className="text-xs text-destructive ml-2">*</span>
                    )}
                  </label>
                  {isAutoIncrement ? (
                    <input
                      type="text"
                      value={editedData[columnIndex]}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  ) : editedData[columnIndex] === null ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value="NULL"
                        disabled
                        className="flex-1 px-3 py-2 border rounded-md bg-muted text-muted-foreground"
                      />
                      <button
                        onClick={() => handleFieldChange(columnIndex, '')}
                        className="px-3 py-2 text-sm border rounded-md hover:bg-accent"
                      >
                        Set Value
                      </button>
                    </div>
                  ) : getInputType(editedData[columnIndex]) === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={editedData[columnIndex]}
                      onChange={(e) => handleFieldChange(columnIndex, e.target.checked)}
                      className="rounded border-border"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type={getInputType(editedData[columnIndex])}
                        value={editedData[columnIndex]}
                        onChange={(e) => handleFieldChange(
                          columnIndex,
                          getInputType(editedData[columnIndex]) === 'number' 
                            ? parseFloat(e.target.value) || 0
                            : e.target.value
                        )}
                        className="flex-1 px-3 py-2 border rounded-md bg-background"
                      />
                      <button
                        onClick={() => handleFieldChange(columnIndex, null)}
                        className="px-3 py-2 text-sm border rounded-md hover:bg-accent"
                      >
                        Set NULL
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Type: {colInfo.type}
                    {colInfo.dflt_value && ` • Default: ${colInfo.dflt_value}`}
                  </p>
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
                  {editedData[index] === null ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value="NULL"
                        disabled
                        className="flex-1 px-3 py-2 border rounded-md bg-muted text-muted-foreground"
                      />
                      <button
                        onClick={() => handleFieldChange(index, '')}
                        className="px-3 py-2 text-sm border rounded-md hover:bg-accent"
                      >
                        Set Value
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type={getInputType(editedData[index])}
                        value={editedData[index]}
                        onChange={(e) => handleFieldChange(
                          index,
                          getInputType(editedData[index]) === 'number' 
                            ? parseFloat(e.target.value) || 0
                            : e.target.value
                        )}
                        className="flex-1 px-3 py-2 border rounded-md bg-background"
                      />
                      <button
                        onClick={() => handleFieldChange(index, null)}
                        className="px-3 py-2 text-sm border rounded-md hover:bg-accent"
                      >
                        Set NULL
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between gap-2 pt-6 border-t mt-6">
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors flex items-center gap-2"
            >
              <Trash className="h-4 w-4" />
              Delete Row
            </button>
            
            <div className="flex gap-2">
              <Dialog.Close className="px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                Cancel
              </Dialog.Close>
              
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}