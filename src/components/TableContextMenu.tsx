import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Eye, Table, Copy, Trash, Edit, FileText } from 'lucide-react';
import { useDatabaseStore } from '@/store/databaseStore';
import toast from 'react-hot-toast';

interface TableContextMenuProps {
  table: any;
  connectionId: string;
}

export function TableContextMenu({ table, connectionId }: TableContextMenuProps) {
  const { setActiveConnection, executeQuery, setCurrentQuery, setActiveResultTab } = useDatabaseStore();

  const handleViewData = async () => {
    setActiveConnection(connectionId);
    const query = `SELECT * FROM "${table.name}" LIMIT 100;`;
    setCurrentQuery(query);
    await executeQuery(query);
  };

  const handleViewStructure = async () => {
    setActiveConnection(connectionId);
    const query = `SELECT * FROM "${table.name}" LIMIT 100;`;
    setCurrentQuery(query);
    await executeQuery(query);
    // Switch to structure tab
    setActiveResultTab('structure');
  };

  const handleViewIndexes = async () => {
    setActiveConnection(connectionId);
    const query = `SELECT * FROM "${table.name}" LIMIT 100;`;
    setCurrentQuery(query);
    await executeQuery(query);
    // Switch to structure tab to show indexes
    setActiveResultTab('structure');
  };

  const handleCreateIndex = () => {
    setActiveConnection(connectionId);
    const query = `CREATE INDEX idx_${table.name}_column ON "${table.name}" (column_name);`;
    setCurrentQuery(query);
    toast('Edit the query to specify the column name', { duration: 3000 });
  };

  const handleDropTable = () => {
    setActiveConnection(connectionId);
    const query = `DROP TABLE "${table.name}";`;
    setCurrentQuery(query);
    toast('Review the query carefully before executing', { 
      icon: '⚠️',
      duration: 4000 
    });
  };

  const handleCopyCreateStatement = async () => {
    setActiveConnection(connectionId);
    const result = await executeQuery(
      `SELECT sql FROM sqlite_master WHERE type='table' AND name='${table.name}';`
    );
    if (result && result.values.length > 0 && result.values[0][0]) {
      navigator.clipboard.writeText(result.values[0][0] as string);
      toast.success('CREATE statement copied!');
    }
  };

  const handleCopyName = () => {
    navigator.clipboard.writeText(table.name);
    toast.success('Table name copied!');
  };

  const handleExportData = () => {
    setActiveConnection(connectionId);
    const query = `SELECT * FROM "${table.name}";`;
    setCurrentQuery(query);
    toast('Execute the query then use Export to save the data', { duration: 3000 });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="p-0.5 hover:bg-accent/50 dark:hover:bg-accent/30 rounded transition-colors opacity-0 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-3 w-3" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-popover rounded-md p-1 shadow-lg border border-border z-[100]"
          sideOffset={5}
          align="end"
          alignOffset={-5}
        >
          <DropdownMenu.Item
            className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm outline-none"
            onSelect={handleViewData}
          >
            <Table className="h-4 w-4" />
            View Data
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm outline-none"
            onSelect={handleViewStructure}
          >
            <Eye className="h-4 w-4" />
            View Structure
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm outline-none"
            onSelect={handleViewIndexes}
          >
            <FileText className="h-4 w-4" />
            View Indexes
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-border my-1" />

          <DropdownMenu.Item
            className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm outline-none"
            onSelect={handleCreateIndex}
          >
            <Edit className="h-4 w-4" />
            Create Index
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm outline-none"
            onSelect={handleCopyCreateStatement}
          >
            <Copy className="h-4 w-4" />
            Copy CREATE Statement
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm outline-none"
            onSelect={handleCopyName}
          >
            <Copy className="h-4 w-4" />
            Copy Table Name
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm outline-none"
            onSelect={handleExportData}
          >
            <FileText className="h-4 w-4" />
            Export Data
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-border my-1" />

          <DropdownMenu.Item
            className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm outline-none text-destructive"
            onSelect={handleDropTable}
          >
            <Trash className="h-4 w-4" />
            Drop Table
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}