import * as Dialog from '@radix-ui/react-dialog';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { category: 'General', items: [
    { keys: ['Ctrl/Cmd', 'N'], description: 'Create new database' },
    { keys: ['Ctrl/Cmd', 'O'], description: 'Open database' },
    { keys: ['Ctrl/Cmd', 'S'], description: 'Save database' },
    { keys: ['Ctrl/Cmd', 'Shift', 'I'], description: 'Import data' },
    { keys: ['Ctrl/Cmd', 'Shift', 'E'], description: 'Export database' },
  ]},
  { category: 'SQL Editor', items: [
    { keys: ['Ctrl/Cmd', 'Enter'], description: 'Execute query' },
    { keys: ['Shift', 'Alt', 'F'], description: 'Format SQL' },
    { keys: ['Ctrl/Cmd', 'Space'], description: 'Trigger autocomplete' },
    { keys: ['Ctrl/Cmd', '/'], description: 'Toggle line comment' },
    { keys: ['F1'], description: 'Show command palette' },
  ]},
  { category: 'Navigation', items: [
    { keys: ['Ctrl/Cmd', 'P'], description: 'Quick open table' },
    { keys: ['Ctrl/Cmd', 'Shift', 'P'], description: 'Command palette' },
    { keys: ['Ctrl/Cmd', 'B'], description: 'Toggle sidebar' },
    { keys: ['Alt', '←/→'], description: 'Navigate between tabs' },
  ]},
  { category: 'Data Grid', items: [
    { keys: ['↑/↓'], description: 'Navigate rows' },
    { keys: ['←/→'], description: 'Navigate columns' },
    { keys: ['Ctrl/Cmd', 'C'], description: 'Copy cell value' },
    { keys: ['Ctrl/Cmd', 'A'], description: 'Select all' },
  ]},
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </Dialog.Title>
          
          <Dialog.Close className="absolute right-4 top-4 p-1 hover:bg-accent rounded-md">
            <X className="h-4 w-4" />
          </Dialog.Close>

          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
            <p>
              Tip: Most keyboard shortcuts work across all platforms. On macOS, use Cmd instead of Ctrl.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}