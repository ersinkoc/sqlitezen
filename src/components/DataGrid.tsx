import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash, Plus } from 'lucide-react';
import { RowEditDialog } from './RowEditDialog';
import { RowInsertDialog } from './RowInsertDialog';
import { useDatabaseStore } from '@/store/databaseStore';
import toast from 'react-hot-toast';

interface DataGridProps {
  columns: string[];
  data: any[][];
  executionTime?: number;
  tableName?: string;
  editable?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataGrid({ columns, data, executionTime, tableName, editable = false }: DataGridProps) {
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [editingRow, setEditingRow] = useState<{ index: number; data: any[] } | null>(null);
  const [showInsertDialog, setShowInsertDialog] = useState(false);
  const { executeQuery, activeConnectionId } = useDatabaseStore();

  const sortedData = useMemo(() => {
    if (sortColumn === null || sortDirection === null) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDirection === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sortColumn, sortDirection]);

  const handleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
  };

  const formatValue = (value: any): string => {
    if (value === null) return 'NULL';
    if (value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const handleEditRow = (_rowIndex: number, rowData: any[]) => {
    setEditingRow({ index: _rowIndex, data: rowData });
  };

  const handleDeleteRow = async (_rowIndex: number, rowData: any[]) => {
    if (!confirm('Are you sure you want to delete this row?')) return;
    
    if (!tableName || !activeConnectionId) {
      toast.error('Cannot delete: table information missing');
      return;
    }

    try {
      // Build DELETE query using all column values
      const conditions = columns
        .map((col, idx) => {
          const value = rowData[idx];
          if (value === null) return `"${col}" IS NULL`;
          if (typeof value === 'number') return `"${col}" = ${value}`;
          return `"${col}" = '${String(value).replace(/'/g, "''")}'`;
        })
        .join(' AND ');

      const deleteQuery = `DELETE FROM "${tableName}" WHERE ${conditions};`;
      await executeQuery(deleteQuery);
      
      toast.success('Row deleted successfully');
      
      // Refresh the table
      await executeQuery(`SELECT * FROM "${tableName}" LIMIT 100;`);
    } catch (error) {
      toast.error(`Failed to delete row: ${(error as Error).message}`);
    }
  };

  const handleAddRow = () => {
    if (!tableName || !activeConnectionId) {
      toast.error('Cannot add row: table information missing');
      return;
    }

    setShowInsertDialog(true);
  };

  return (
    <div className="h-full flex flex-col">
      {executionTime !== undefined && (
        <div className="px-4 py-2 text-sm text-muted-foreground border-b flex items-center justify-between">
          <span>Query executed in {executionTime.toFixed(2)}ms • {data.length} rows</span>
          {editable && tableName && (
            <button
              onClick={handleAddRow}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              <Plus className="h-3 w-3" />
              Add Row
            </button>
          )}
        </div>
      )}
      
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-card border-b">
            <tr>
              {editable && <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Actions</th>}
              {columns.map((column, i) => (
                <th
                  key={i}
                  className="px-4 py-2 text-left text-sm font-medium text-muted-foreground"
                >
                  <button
                    onClick={() => handleSort(i)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {column}
                    {sortColumn === i ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, i) => (
              <tr
                key={i}
                className={clsx(
                  'border-b transition-colors',
                  i % 2 === 0 ? 'bg-background' : 'bg-muted/50',
                  'hover:bg-accent/50'
                )}
              >
                {editable && (
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditRow(i, row)}
                        className="p-1 hover:bg-accent rounded transition-colors"
                        title="Edit row"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteRow(i, row)}
                        className="p-1 hover:bg-destructive/20 text-destructive rounded transition-colors"
                        title="Delete row"
                      >
                        <Trash className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                )}
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="px-4 py-2 text-sm font-mono"
                  >
                    {formatValue(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No data returned
          </div>
        )}
      </div>
      
      {editingRow && tableName && (
        <RowEditDialog
          open={!!editingRow}
          onOpenChange={(open) => !open && setEditingRow(null)}
          tableName={tableName}
          columns={columns}
          rowData={editingRow.data}
        />
      )}
      
      {showInsertDialog && tableName && (
        <RowInsertDialog
          open={showInsertDialog}
          onOpenChange={setShowInsertDialog}
          tableName={tableName}
          columns={columns}
        />
      )}
    </div>
  );
}