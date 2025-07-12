import { Database, Moon, Sun, Menu, FileUp, Download, Upload, Info, Github, Play, Search } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useDatabaseStore } from '@/store/databaseStore';
import { useRef, useState, useEffect } from 'react';
import { ImportExportDialog } from './ImportExportDialog';
import { AboutDialog } from './AboutDialog';
import { SearchDialog } from './SearchDialog';
import { DemoDataService } from '@/services/demoDataService';
import toast from 'react-hot-toast';

export function Header() {
  const { theme, setTheme } = useTheme();
  const openDatabase = useDatabaseStore((state) => state.openDatabase);
  const createDatabase = useDatabaseStore((state) => state.createDatabase);
  const activeConnectionId = useDatabaseStore((state) => state.activeConnectionId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const handleFileOpen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await openDatabase(file);
      e.target.value = '';
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const loadDemoDatabase = async () => {
    try {
      const demoSQL = await DemoDataService.loadDemoSQL();
      await createDatabase('Northwind Demo');
      
      // Get the newly created database connection
      const { activeConnectionId, executeQuery } = useDatabaseStore.getState();
      
      if (activeConnectionId) {
        // Execute the demo SQL
        const queries = demoSQL.split(';').filter(q => q.trim());
        for (const query of queries) {
          if (query.trim()) {
            await executeQuery(query.trim() + ';');
          }
        }
        
        toast.success('Demo database loaded successfully!');
      }
    } catch (error) {
      console.error('Failed to load demo database:', error);
      toast.error('Failed to load demo database');
    }
  };

  // Close demo menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (demoMenuOpen && !(e.target as Element).closest('.demo-menu-container')) {
        setDemoMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [demoMenuOpen]);

  return (
    <header className="h-14 border-b bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">SQLite Zen</h1>
        </div>
        
        <nav className="flex items-center gap-2 ml-8">
          <button
            onClick={() => createDatabase('New Database')}
            className="px-3 py-1.5 text-sm hover:bg-accent rounded-md transition-colors"
          >
            New Database
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-sm hover:bg-accent rounded-md transition-colors flex items-center gap-2"
          >
            <FileUp className="h-4 w-4" />
            Open Database
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".db,.sqlite,.sqlite3,.db3"
            onChange={handleFileOpen}
            className="hidden"
          />
          
          {activeConnectionId && (
            <>
              <div className="w-px h-6 bg-border mx-2" />
              
              <button
                onClick={() => setImportDialogOpen(true)}
                className="px-3 py-1.5 text-sm hover:bg-accent rounded-md transition-colors flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>
              
              <button
                onClick={() => setExportDialogOpen(true)}
                className="px-3 py-1.5 text-sm hover:bg-accent rounded-md transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              
              <button
                onClick={() => setSearchDialogOpen(true)}
                className="px-3 py-1.5 text-sm hover:bg-accent rounded-md transition-colors flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </>
          )}
          
          <div className="w-px h-6 bg-border mx-2" />
          
          <div className="relative demo-menu-container">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="px-3 py-1.5 text-sm hover:bg-accent rounded-md transition-colors flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Demo
            </button>
            
            {demoMenuOpen && (
              <div className="absolute top-full mt-2 left-0 bg-card border rounded-md shadow-lg p-4 min-w-[280px] z-50">
                <h3 className="font-semibold mb-2">Demo Databases</h3>
                <div className="space-y-2">
                  <button
                    onClick={async () => {
                      setDemoMenuOpen(false);
                      await loadDemoDatabase();
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                  >
                    <div className="font-medium">Northwind Demo</div>
                    <div className="text-xs text-muted-foreground">Products, Orders, Customers</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setAboutDialogOpen(true)}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          aria-label="About"
          title="About SQLite Zen"
        >
          <Info className="h-5 w-5" />
        </button>
        
        <a
          href="https://github.com/ersinkoc/sqlitezen"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-accent rounded-md transition-colors"
          aria-label="GitHub"
          title="View on GitHub"
        >
          <Github className="h-5 w-5" />
        </a>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
        
        <button
          className="p-2 hover:bg-accent rounded-md transition-colors lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      
      <ImportExportDialog
        mode="import"
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
      
      <ImportExportDialog
        mode="export"
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
      />
      
      <AboutDialog
        open={aboutDialogOpen}
        onOpenChange={setAboutDialogOpen}
      />
      
      <SearchDialog
        isOpen={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
      />
    </header>
  );
}