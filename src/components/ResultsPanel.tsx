import { useState, useEffect } from 'react';
import { useDatabaseStore } from '@/store/databaseStore';
import { DataGrid } from './DataGrid';
import { QueryHistory } from './QueryHistory';
import { TableStructure } from './TableStructure';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import { Table2, History, Edit3, Database } from 'lucide-react';

export function ResultsPanel() {
  const [currentTableName, setCurrentTableName] = useState<string | null>(null);
  const [isPragmaQuery, setIsPragmaQuery] = useState(false);
  const { queryHistory, currentQuery, activeResultTab, setActiveResultTab, structureActiveTab, setStructureActiveTab } = useDatabaseStore();
  
  const latestResult = queryHistory.find(h => h.success)?.result;
  
  // Extract table name from query and auto-switch to structure tab for PRAGMA queries
  useEffect(() => {
    if (currentQuery) {
      const selectMatch = currentQuery.match(/FROM\s+"?(\w+)"?/i);
      const pragmaTableInfoMatch = currentQuery.match(/PRAGMA\s+table_info\("?(\w+)"?\)/i);
      const pragmaIndexMatch = currentQuery.match(/PRAGMA\s+index_list\("?(\w+)"?\)/i);
      const createTableMatch = currentQuery.match(/CREATE\s+TABLE\s+"?(\w+)"?/i);
      
      // Check if it's any PRAGMA query
      const isPragma = /^\s*PRAGMA\s+/i.test(currentQuery);
      setIsPragmaQuery(isPragma);
      
      if (selectMatch) {
        setCurrentTableName(selectMatch[1]);
      } else if (pragmaTableInfoMatch) {
        setCurrentTableName(pragmaTableInfoMatch[1]);
        // Auto-switch to structure tab for PRAGMA queries
        setActiveResultTab('structure');
      } else if (pragmaIndexMatch) {
        setCurrentTableName(pragmaIndexMatch[1]);
        // Auto-switch to structure tab and indexes sub-tab
        setActiveResultTab('structure');
        setStructureActiveTab('indexes');
      } else if (createTableMatch) {
        setCurrentTableName(createTableMatch[1]);
      }
    }
  }, [currentQuery, setActiveResultTab, setStructureActiveTab]);

  return (
    <div className="h-full bg-card">
      <Tabs value={activeResultTab} onValueChange={setActiveResultTab} className="h-full flex flex-col">
        <div className="border-b px-4">
          <TabsList className="h-10">
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Table2 className="h-4 w-4" />
              Results
            </TabsTrigger>
            {currentTableName && latestResult && (
              <>
                <TabsTrigger value="structure" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Structure
                </TabsTrigger>
                {!isPragmaQuery && (
                  <TabsTrigger value="edit" className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    Edit Data
                  </TabsTrigger>
                )}
              </>
            )}
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="results" className="flex-1 overflow-hidden m-0">
          {latestResult ? (
            <DataGrid
              columns={latestResult.columns}
              data={latestResult.values}
              executionTime={latestResult.executionTime}
              tableName={currentTableName || undefined}
              editable={false}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Execute a query to see results
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="edit" className="flex-1 overflow-hidden m-0">
          {latestResult && currentTableName ? (
            <DataGrid
              columns={latestResult.columns}
              data={latestResult.values}
              executionTime={latestResult.executionTime}
              tableName={currentTableName}
              editable={true}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data to edit
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="structure" className="flex-1 overflow-hidden m-0">
          {currentTableName ? (
            <TableStructure tableName={currentTableName} activeTab={structureActiveTab as any} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No table selected
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="flex-1 overflow-hidden m-0">
          <QueryHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}