import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Upload, Download, FileJson, FileText, Database, Table } from 'lucide-react';
import { useDatabaseStore } from '@/store/databaseStore';
import { ImportExportService } from '@/services/importExportService';
import { ExportOptions, ImportOptions } from '@/types/database';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

interface ImportExportDialogProps {
  mode: 'import' | 'export';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportExportDialog({ mode, open, onOpenChange }: ImportExportDialogProps) {
  const { activeConnectionId, sqliteService } = useDatabaseStore();
  const [selectedFormat, setSelectedFormat] = useState<'sqlite' | 'sql' | 'csv' | 'json'>('sql');
  const [selectedTables] = useState<string[]>([]);
  const [includeSchema, setIncludeSchema] = useState(true);
  const [includeData, setIncludeData] = useState(true);
  const [csvOptions, setCsvOptions] = useState({
    tableName: '',
    headerRow: true,
    delimiter: ',',
  });
  const [loading, setLoading] = useState(false);

  const importExportService = new ImportExportService(sqliteService);

  const handleExport = async () => {
    if (!activeConnectionId) return;

    setLoading(true);
    try {
      const options: ExportOptions = {
        format: selectedFormat,
        tables: selectedTables.length > 0 ? selectedTables : undefined,
        includeSchema,
        includeData,
      };

      await importExportService.exportDatabase(activeConnectionId, options);
      toast.success(`Database exported as ${selectedFormat.toUpperCase()}`);
      onOpenChange(false);
    } catch (error) {
      toast.error(`Export failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (file: File) => {
    if (!activeConnectionId) return;

    setLoading(true);
    try {
      const options: ImportOptions = {
        format: selectedFormat,
        tableName: csvOptions.tableName || undefined,
        headerRow: csvOptions.headerRow,
        delimiter: csvOptions.delimiter,
      };

      await importExportService.importData(activeConnectionId, file, options);
      toast.success('Data imported successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error(`Import failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-semibold mb-4">
            {mode === 'export' ? 'Export Database' : 'Import Data'}
          </Dialog.Title>
          
          <Dialog.Close className="absolute right-4 top-4 p-1 hover:bg-accent rounded-md">
            <X className="h-4 w-4" />
          </Dialog.Close>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedFormat('sqlite')}
                  className={clsx(
                    'p-3 rounded-md border-2 transition-colors flex items-center gap-2',
                    selectedFormat === 'sqlite'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                  disabled={mode === 'import'}
                >
                  <Database className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">SQLite</div>
                    <div className="text-xs text-muted-foreground">Binary database file</div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedFormat('sql')}
                  className={clsx(
                    'p-3 rounded-md border-2 transition-colors flex items-center gap-2',
                    selectedFormat === 'sql'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">SQL</div>
                    <div className="text-xs text-muted-foreground">SQL dump file</div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedFormat('csv')}
                  className={clsx(
                    'p-3 rounded-md border-2 transition-colors flex items-center gap-2',
                    selectedFormat === 'csv'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Table className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">CSV</div>
                    <div className="text-xs text-muted-foreground">Comma-separated values</div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedFormat('json')}
                  className={clsx(
                    'p-3 rounded-md border-2 transition-colors flex items-center gap-2',
                    selectedFormat === 'json'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <FileJson className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">JSON</div>
                    <div className="text-xs text-muted-foreground">JavaScript Object Notation</div>
                  </div>
                </button>
              </div>
            </div>

            {mode === 'export' && selectedFormat !== 'sqlite' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Options</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeSchema}
                        onChange={(e) => setIncludeSchema(e.target.checked)}
                        className="rounded border-border"
                      />
                      <span className="text-sm">Include schema (CREATE statements)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeData}
                        onChange={(e) => setIncludeData(e.target.checked)}
                        className="rounded border-border"
                      />
                      <span className="text-sm">Include data (INSERT statements)</span>
                    </label>
                  </div>
                </div>

                {selectedFormat === 'csv' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Select Tables to Export
                    </label>
                    <div className="text-sm text-muted-foreground">
                      CSV format requires selecting specific tables
                    </div>
                  </div>
                )}
              </>
            )}

            {mode === 'import' && selectedFormat === 'csv' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Table Name</label>
                  <input
                    type="text"
                    value={csvOptions.tableName}
                    onChange={(e) => setCsvOptions({ ...csvOptions, tableName: e.target.value })}
                    placeholder="Enter table name"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Delimiter</label>
                  <select
                    value={csvOptions.delimiter}
                    onChange={(e) => setCsvOptions({ ...csvOptions, delimiter: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value=",">Comma (,)</option>
                    <option value=";">Semicolon (;)</option>
                    <option value="\t">Tab</option>
                    <option value="|">Pipe (|)</option>
                  </select>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={csvOptions.headerRow}
                    onChange={(e) => setCsvOptions({ ...csvOptions, headerRow: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">First row contains headers</span>
                </label>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Dialog.Close className="px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                Cancel
              </Dialog.Close>
              
              {mode === 'export' ? (
                <button
                  onClick={handleExport}
                  disabled={loading || !activeConnectionId}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              ) : (
                <label className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Select File
                  <input
                    type="file"
                    accept={
                      selectedFormat === 'sql' ? '.sql' :
                      selectedFormat === 'csv' ? '.csv' :
                      selectedFormat === 'json' ? '.json' :
                      '*'
                    }
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}