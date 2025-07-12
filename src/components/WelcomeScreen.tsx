import { Database, FileUp, Plus, BookOpen, Github, Play } from 'lucide-react';
import { useDatabaseStore } from '@/store/databaseStore';
import { useRef } from 'react';
import { DemoDataService } from '@/services/demoDataService';
import toast from 'react-hot-toast';

export function WelcomeScreen() {
  const { createDatabase, openDatabase } = useDatabaseStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileOpen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await openDatabase(file);
      e.target.value = '';
    }
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

  const features = [
    'Full SQLite database support in your browser',
    'SQL editor with syntax highlighting and autocomplete',
    'Import/Export in multiple formats (SQL, CSV, JSON)',
    'Schema explorer with table structure visualization',
    'Query history and results management',
    'Dark/Light theme support',
    'Offline functionality with service worker',
    'Keyboard shortcuts for productivity',
  ];

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Database className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Welcome to SQLite Zen</h1>
          <p className="text-xl text-muted-foreground">
            A professional browser-based SQLite database editor
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => createDatabase('New Database')}
            className="p-6 bg-card border rounded-lg hover:bg-accent transition-colors text-left space-y-2"
          >
            <Plus className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold">Create New Database</h3>
            <p className="text-sm text-muted-foreground">
              Start fresh with a new SQLite database
            </p>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-6 bg-card border rounded-lg hover:bg-accent transition-colors text-left space-y-2"
          >
            <FileUp className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold">Open Existing Database</h3>
            <p className="text-sm text-muted-foreground">
              Load a .db, .sqlite, or .sqlite3 file
            </p>
          </button>
          
          <button
            onClick={loadDemoDatabase}
            className="p-6 bg-card border rounded-lg hover:bg-accent transition-colors text-left space-y-2"
          >
            <Play className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold">Try Demo Database</h3>
            <p className="text-sm text-muted-foreground">
              Explore with Northwind sample data
            </p>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".db,.sqlite,.sqlite3,.db3"
            onChange={handleFileOpen}
            className="hidden"
          />
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Features</h2>
          <div className="grid md:grid-cols-2 gap-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://www.sqlite.org/docs.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            SQLite Documentation
          </a>
          
          <a
            href="https://github.com/ersinkoc/sqlitezen"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}