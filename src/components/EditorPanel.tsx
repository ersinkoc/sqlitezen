import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Code2, FileText, Activity } from 'lucide-react';
import { useDatabaseStore } from '@/store/databaseStore';
import { SQLFormatter } from '@/utils/sqlFormatter';
import { MonacoService } from '@/services/monacoService';
import toast from 'react-hot-toast';
import type { editor } from 'monaco-editor';

export function EditorPanel() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoServiceRef = useRef<MonacoService | null>(null);
  
  const { 
    executeQuery, 
    activeConnectionId, 
    saveDatabase, 
    sqliteService, 
    currentQuery, 
    setCurrentQuery,
    showQueryPlan,
    setShowQueryPlan,
    queryTemplates,
    applyQueryTemplate 
  } = useDatabaseStore();
  const [localQuery, setLocalQuery] = useState(currentQuery);

  useEffect(() => {
    if (activeConnectionId && monacoServiceRef.current) {
      monacoServiceRef.current.updateSchema(activeConnectionId);
    }
  }, [activeConnectionId]);

  useEffect(() => {
    if (currentQuery !== localQuery && editorRef.current) {
      setLocalQuery(currentQuery);
      editorRef.current.setValue(currentQuery);
    }
  }, [currentQuery, localQuery]);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = editor;
    editor.focus();
    
    // Initialize Monaco service
    if (!monacoServiceRef.current) {
      monacoServiceRef.current = MonacoService.getInstance(sqliteService);
      monacoServiceRef.current.initialize();
    }
    
    // Update schema for autocomplete
    if (activeConnectionId) {
      monacoServiceRef.current.updateSchema(activeConnectionId);
    }
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, handleExecute);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, handleSave);
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, formatSQL);
  };

  const handleExecute = async () => {
    if (!localQuery.trim()) {
      toast.error('Please enter a query');
      return;
    }

    setIsExecuting(true);
    try {
      await executeQuery(localQuery);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSave = async () => {
    if (activeConnectionId) {
      await saveDatabase(activeConnectionId);
    }
  };

  const formatSQL = () => {
    if (!editorRef.current) return;
    
    const currentValue = editorRef.current.getValue();
    const formatted = SQLFormatter.format(currentValue);
    
    if (formatted !== currentValue) {
      editorRef.current.setValue(formatted);
      toast.success('SQL formatted');
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleExecute}
            disabled={isExecuting || !activeConnectionId}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4" />
            Execute
          </button>
          
          <button
            onClick={handleSave}
            disabled={!activeConnectionId}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
          
          <button
            onClick={formatSQL}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent rounded-md transition-colors"
          >
            <Code2 className="h-4 w-4" />
            Format
          </button>
          
          <div className="h-4 w-px bg-border" />
          
          <button
            onClick={() => setShowQueryPlan(!showQueryPlan)}
            className={`flex items-center gap-2 px-3 py-1.5 hover:bg-accent rounded-md transition-colors ${
              showQueryPlan ? 'bg-accent' : ''
            }`}
            title="Toggle query plan"
          >
            <Activity className="h-4 w-4" />
            Query Plan
          </button>
          
          <button
            onClick={() => {
              console.log('Templates button clicked! Current showTemplates:', showTemplates);
              setShowTemplates(!showTemplates);
              console.log('Templates array:', queryTemplates);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 hover:bg-accent rounded-md transition-colors ${
              showTemplates ? 'bg-accent' : ''
            }`}
            title="Query templates"
          >
            <FileText className="h-4 w-4" />
            Templates
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex">
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="sql"
            value={localQuery}
            onChange={(value) => {
              setLocalQuery(value || '');
              setCurrentQuery(value || '');
            }}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
              lineNumbers: 'on',
              rulers: [],
              scrollBeyondLastLine: false,
              renderLineHighlight: 'all',
              suggestOnTriggerCharacters: true,
              quickSuggestions: {
                other: true,
                comments: false,
                strings: false,
              },
              parameterHints: {
                enabled: true,
              },
              tabSize: 2,
              insertSpaces: true,
              automaticLayout: true,
            }}
          />
        </div>
        
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-lg w-[600px] max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Query Templates</h3>
                <p className="text-xs text-muted-foreground mt-1">Click a template to use it</p>
              </div>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {queryTemplates.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No templates available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {queryTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 bg-muted/50 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => {
                        const variables: Record<string, any> = {};
                        if (template.variables && template.variables.length > 0) {
                          let cancelled = false;
                          template.variables.forEach(v => {
                            if (!cancelled) {
                              const value = prompt(
                                `Enter value for ${v.name}${v.description ? ` (${v.description})` : ''}:`, 
                                v.defaultValue?.toString() || ''
                              );
                              if (value === null) {
                                cancelled = true;
                              } else {
                                variables[v.name] = value;
                              }
                            }
                          });
                          if (cancelled) return;
                        }
                        
                        try {
                          applyQueryTemplate(template.id, variables);
                          setShowTemplates(false);
                        } catch (error) {
                          // Fallback: manual template application
                          let query = template.query;
                          if (template.variables) {
                            template.variables.forEach(variable => {
                              const value = variables[variable.name];
                              if (value !== undefined) {
                                const regex = new RegExp(`{{\\s*${variable.name}\\s*}}`, 'g');
                                query = query.replace(regex, String(value));
                              }
                            });
                          }
                          setCurrentQuery(query);
                          setShowTemplates(false);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <div className="text-xs text-muted-foreground bg-primary/20 px-2 py-1 rounded">
                          {template.category}
                        </div>
                      </div>
                      {template.description && (
                        <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                      )}
                      <div className="text-xs font-mono text-muted-foreground bg-card p-2 rounded border">
                        {template.query.substring(0, 150)}{template.query.length > 150 ? '...' : ''}
                      </div>
                      {template.variables && template.variables.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Variables: {template.variables.map(v => v.name).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}