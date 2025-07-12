import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Code2 } from 'lucide-react';
import { useDatabaseStore } from '@/store/databaseStore';
import { SQLFormatter } from '@/utils/sqlFormatter';
import { MonacoService } from '@/services/monacoService';
import toast from 'react-hot-toast';
import type { editor } from 'monaco-editor';

export function EditorPanel() {
  const [isExecuting, setIsExecuting] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoServiceRef = useRef<MonacoService | null>(null);
  
  const { executeQuery, activeConnectionId, saveDatabase, sqliteService, currentQuery, setCurrentQuery } = useDatabaseStore();
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
        </div>
      </div>
      
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
  );
}