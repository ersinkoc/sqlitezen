import { useEffect, useState } from 'react';
import { useDatabaseStore } from '@/store/databaseStore';
import { SQLiteService } from '@/services/sqliteService';
import { ColumnInfo } from '@/types/database';
import { Code2, Table } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';

interface TableStructureProps {
  tableName: string;
  activeTab?: 'columns' | 'ddl' | 'indexes';
}

export function TableStructure({ tableName, activeTab = 'columns' }: TableStructureProps) {
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [createStatement, setCreateStatement] = useState<string>('');
  const [indexes, setIndexes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeConnectionId, structureActiveTab, setStructureActiveTab } = useDatabaseStore();
  const sqliteService = SQLiteService.getInstance();
  
  // Use controlled tab value
  const tabValue = activeTab !== 'columns' ? activeTab : structureActiveTab;

  useEffect(() => {
    const fetchTableInfo = async () => {
      if (!activeConnectionId || !tableName) return;
      
      setLoading(true);
      try {
        // Fetch table structure
        const tableInfo = await sqliteService.executeQuery(
          activeConnectionId,
          `PRAGMA table_info("${tableName}");`
        );
        
        if (tableInfo && tableInfo.values) {
          const cols: ColumnInfo[] = tableInfo.values.map(row => ({
            cid: row[0] as number,
            name: row[1] as string,
            type: row[2] as string,
            notnull: row[3] as number,
            dflt_value: row[4],
            pk: row[5] as number,
          }));
          setColumns(cols);
        }
        
        // Fetch CREATE TABLE statement
        const createResult = await sqliteService.executeQuery(
          activeConnectionId,
          `SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}';`
        );
        
        if (createResult && createResult.values.length > 0) {
          setCreateStatement(createResult.values[0][0] as string);
        }
        
        // Fetch indexes
        const indexResult = await sqliteService.executeQuery(
          activeConnectionId,
          `PRAGMA index_list("${tableName}");`
        );
        
        if (indexResult && indexResult.values) {
          setIndexes(indexResult.values);
        }
        
      } catch (error) {
        console.error('Failed to fetch table info:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTableInfo();
  }, [activeConnectionId, tableName]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Loading table structure...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={tabValue} onValueChange={setStructureActiveTab} className="h-full flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="h-9">
            <TabsTrigger value="columns" className="text-xs flex items-center gap-1.5">
              <Table className="h-3.5 w-3.5" />
              Columns
            </TabsTrigger>
            {indexes.length > 0 && (
              <TabsTrigger value="indexes" className="text-xs flex items-center gap-1.5">
                <Table className="h-3.5 w-3.5" />
                Indexes ({indexes.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="ddl" className="text-xs flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5" />
              DDL
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="columns" className="flex-1 overflow-auto m-0 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Table: {tableName}</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 text-sm font-medium">Column</th>
                      <th className="text-left py-2 px-3 text-sm font-medium">Type</th>
                      <th className="text-left py-2 px-3 text-sm font-medium">Nullable</th>
                      <th className="text-left py-2 px-3 text-sm font-medium">Default</th>
                      <th className="text-left py-2 px-3 text-sm font-medium">Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columns.map((col) => (
                      <tr key={col.cid} className="border-b hover:bg-accent/50">
                        <td className="py-2 px-3 font-mono text-sm">{col.name}</td>
                        <td className="py-2 px-3 text-sm">{col.type}</td>
                        <td className="py-2 px-3 text-sm">{col.notnull ? 'NO' : 'YES'}</td>
                        <td className="py-2 px-3 text-sm font-mono">
                          {col.dflt_value !== null ? String(col.dflt_value) : 'NULL'}
                        </td>
                        <td className="py-2 px-3 text-sm">
                          {col.pk === 1 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                              PRIMARY
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </TabsContent>
        
        {indexes.length > 0 && (
          <TabsContent value="indexes" className="flex-1 overflow-auto m-0 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Table Indexes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-sm font-medium">Name</th>
                        <th className="text-left py-2 px-3 text-sm font-medium">Unique</th>
                        <th className="text-left py-2 px-3 text-sm font-medium">Origin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indexes.map((idx, i) => (
                        <tr key={i} className="border-b hover:bg-accent/50">
                          <td className="py-2 px-3 font-mono text-sm">{idx[1]}</td>
                          <td className="py-2 px-3 text-sm">{idx[2] ? 'YES' : 'NO'}</td>
                          <td className="py-2 px-3 text-sm">{idx[3]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
        )}
        
        <TabsContent value="ddl" className="flex-1 overflow-auto m-0 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">CREATE TABLE Statement</h3>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                <code className="text-sm font-mono">{createStatement}</code>
              </pre>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}