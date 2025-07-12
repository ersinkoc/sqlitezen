import { useState, useEffect } from 'react';
import { useDatabaseStore } from '@/store/databaseStore';
import { DataGrid } from './DataGrid';
import { QueryHistory } from './QueryHistory';
import { TableStructure } from './TableStructure';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import { Table2, History, Edit3, Database, Activity } from 'lucide-react';

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
            {latestResult?.queryPlan && (
              <TabsTrigger value="queryPlan" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Query Plan
              </TabsTrigger>
            )}
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
        
        <TabsContent value="queryPlan" className="flex-1 overflow-hidden m-0">
          {latestResult?.queryPlan ? (
            <div className="h-full overflow-auto">
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">Query Execution Plan</h3>
                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <p className="mb-1"><strong>💡 What is this?</strong></p>
                    <p>This shows how SQLite will execute your query step by step. Useful for optimizing slow queries.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {latestResult.queryPlan.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border-l-2 border-primary/20"
                      style={{ marginLeft: `${step.parent * 16}px` }}
                    >
                      <div className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded">
                        Step {step.id}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">{step.detail}</div>
                        {step.detail.toLowerCase().includes('index') && (
                          <div className="text-xs text-green-600 mt-1">✓ Using index (efficient)</div>
                        )}
                        {step.detail.toLowerCase().includes('scan') && !step.detail.toLowerCase().includes('index') && (
                          <div className="text-xs text-yellow-600 mt-1">⚠ Table scan (may be slow on large tables)</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <p className="font-medium mb-1">Performance Tips:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Look for &quot;INDEX&quot; in steps - these are fast</li>
                    <li>&quot;SCAN TABLE&quot; without index can be slow on large tables</li>
                    <li>Consider adding indexes for frequently queried columns</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No query plan available</p>
                <p className="text-xs mt-1">Enable &quot;Query Plan&quot; and run a SELECT query to see execution details</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}