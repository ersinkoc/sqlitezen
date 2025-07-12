import { useState } from 'react';
import { ChevronRight, ChevronDown, Table, Database as DatabaseIcon, X, RefreshCw } from 'lucide-react';
import { useDatabaseStore } from '@/store/databaseStore';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { TableContextMenu } from './TableContextMenu';

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const { connections, activeConnectionId, setActiveConnection, closeDatabase, sqliteService } = 
    useDatabaseStore();
  const [expandedDatabases, setExpandedDatabases] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  if (isCollapsed) {
    return (
      <div className="h-full bg-card border-r p-2">
        <div className="space-y-2">
          {connections.map((conn) => (
            <button
              key={conn.id}
              onClick={() => setActiveConnection(conn.id)}
              className={clsx(
                'p-2 rounded-md transition-colors',
                activeConnectionId === conn.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              )}
              title={conn.name}
            >
              <DatabaseIcon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const toggleDatabase = (id: string) => {
    const newExpanded = new Set(expandedDatabases);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDatabases(newExpanded);
  };

  return (
    <div className="h-full bg-card border-r flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Databases</h2>
        <button
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="p-1.5 hover:bg-accent rounded-md transition-colors"
          title="Refresh schema"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {connections.length === 0 ? (
          <p className="text-sm text-muted-foreground p-2">No databases open</p>
        ) : (
          <div className="space-y-1">
            {connections.map((conn) => (
              <DatabaseItem
                key={conn.id}
                connection={conn}
                isActive={activeConnectionId === conn.id}
                isExpanded={expandedDatabases.has(conn.id)}
                onToggle={() => toggleDatabase(conn.id)}
                onSelect={() => setActiveConnection(conn.id)}
                onClose={() => closeDatabase(conn.id)}
                sqliteService={sqliteService}
                refreshKey={refreshKey}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface DatabaseItemProps {
  connection: any;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onClose: () => void;
  sqliteService: any;
  refreshKey?: number;
}

function DatabaseItem({
  connection,
  isActive,
  isExpanded,
  onToggle,
  onSelect,
  onClose,
  sqliteService,
  refreshKey = 0,
}: DatabaseItemProps) {
  const { schemaVersion } = useDatabaseStore();
  
  const { data: schema } = useQuery({
    queryKey: ['schema', connection.id, schemaVersion, refreshKey],
    queryFn: () => sqliteService.getSchemaInfo(connection.id),
    enabled: isExpanded,
    staleTime: 0, // Always consider data stale
  });

  return (
    <div>
      <div
        className={clsx(
          'flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors group',
          isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
        )}
      >
        <button
          onClick={onToggle}
          className="p-0.5 hover:bg-black/10 rounded"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        
        <button
          onClick={onSelect}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <DatabaseIcon className="h-4 w-4" />
          <span className="text-sm truncate">{connection.name}</span>
          {connection.isModified && (
            <span className="text-xs text-orange-500">●</span>
          )}
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-black/10 rounded transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      
      {isExpanded && schema && (
        <div className="ml-6 mt-1 space-y-0.5">
          {schema.tables.map((table: any) => (
            <TableItem
              key={table.name}
              table={table}
              connectionId={connection.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TableItemProps {
  table: any;
  connectionId: string;
}

function TableItem({ table, connectionId }: TableItemProps) {
  const { setActiveConnection, executeQuery, setCurrentQuery } = useDatabaseStore();

  const handleTableClick = async () => {
    // Set active connection
    setActiveConnection(connectionId);
    
    // Generate and execute SELECT query
    const query = `SELECT * FROM "${table.name}" LIMIT 100;`;
    setCurrentQuery(query);
    await executeQuery(query);
    
    toast.success(`Viewing table: ${table.name}`);
  };

  return (
    <div
      className="group flex items-center gap-2 px-2 py-1 hover:bg-accent rounded-md cursor-pointer relative"
      onClick={handleTableClick}
    >
      <Table className="h-3 w-3 flex-shrink-0" />
      <span className="text-sm truncate flex-1">{table.name}</span>
      
      <TableContextMenu table={table} connectionId={connectionId} />
    </div>
  );
}