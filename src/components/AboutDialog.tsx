import * as Dialog from '@radix-ui/react-dialog';
import { X, Database, Heart, Code, Shield, Zap, ExternalLink } from 'lucide-react';

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-2xl font-semibold mb-4 flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            SQLite Zen
          </Dialog.Title>
          
          <Dialog.Close className="absolute right-4 top-4 p-1 hover:bg-accent rounded-md">
            <X className="h-4 w-4" />
          </Dialog.Close>

          <div className="space-y-6">
            <div>
              <p className="text-lg text-muted-foreground mb-4">
                A professional browser-based SQLite database editor powered by WebAssembly
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Fast & Lightweight</h3>
                      <p className="text-sm text-muted-foreground">
                        Runs entirely in your browser with WebAssembly
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Secure & Private</h3>
                      <p className="text-sm text-muted-foreground">
                        Your data never leaves your browser
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Code className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Full-Featured</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete SQL editor with autocomplete
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Open Source</h3>
                      <p className="text-sm text-muted-foreground">
                        Built with modern web technologies
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'React 18',
                  'TypeScript',
                  'sql.js',
                  'WebAssembly',
                  'Monaco Editor',
                  'Tailwind CSS',
                  'IndexedDB',
                  'Zustand'
                ].map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-muted text-sm rounded-md"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">About SQLite</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  SQLite Zen is powered by <a href="https://www.sqlite.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    SQLite <ExternalLink className="h-3 w-3" />
                  </a>, the world&apos;s most widely deployed database engine. SQLite is a C-language library that implements a small, fast, self-contained, high-reliability, full-featured SQL database engine.
                </p>
                <p>
                  This application uses <a href="https://github.com/sql-js/sql.js" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    sql.js <ExternalLink className="h-3 w-3" />
                  </a>, a JavaScript library that allows SQLite to run in web browsers through WebAssembly. This means your databases run entirely in your browser with no server required.
                </p>
                <div className="bg-muted/50 p-4 rounded-md mt-4">
                  <h4 className="font-medium mb-2">SQLite Key Features:</h4>
                  <ul className="space-y-1">
                    <li>• Serverless - no configuration or administration needed</li>
                    <li>• Zero-configuration - no setup or installation required</li>
                    <li>• Cross-platform - works on any operating system</li>
                    <li>• Self-contained - single file database format</li>
                    <li>• ACID-compliant - reliable transactions</li>
                    <li>• Public domain - free for any use</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Create, open, and manage SQLite databases</li>
                <li>• Execute SQL queries with syntax highlighting</li>
                <li>• Visual data editing with row-based operations</li>
                <li>• Import/Export data in multiple formats (SQL, CSV, JSON)</li>
                <li>• Schema explorer with table structure visualization</li>
                <li>• Query history and result management</li>
                <li>• Dark/Light theme support</li>
                <li>• Offline functionality with PWA support</li>
              </ul>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Roadmap & Future Plans</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>SQLite Zen is actively developed with exciting features planned:</p>
                <ul className="space-y-2 mt-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span><strong>Visual Query Builder</strong> - Drag-and-drop interface for building complex queries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span><strong>Schema Designer</strong> - Visual table and relationship editor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span><strong>Migration Tracking</strong> - Version control for database schemas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span><strong>Advanced Search</strong> - Full-text search across all tables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span><strong>Plugin System</strong> - Extend functionality with custom plugins</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span><strong>Cloud Sync</strong> - Optional encrypted cloud backup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span><strong>Collaboration</strong> - Share read-only database snapshots</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-6 text-center text-sm text-muted-foreground">
              <p>Version 1.0.0</p>
              <p className="mt-1">
                Made with ❤️ using React and SQLite
              </p>
              <p className="mt-2">
                <a href="https://github.com/ersinkoc/sqlitezen" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  <Database className="h-4 w-4" />
                  github.com/ersinkoc/sqlitezen
                </a>
              </p>
              <p className="mt-2">
                <a href="https://sqlitezen.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  sqlitezen.com
                </a>
              </p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}