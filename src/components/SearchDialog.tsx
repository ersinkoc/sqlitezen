import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDatabaseStore } from '@/store/databaseStore';
import { SearchOptions } from '@/types/database';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const { searchInDatabase, searchResults, clearSearchResults, activeConnectionId } = useDatabaseStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery.trim() || !activeConnectionId) return;

    setIsSearching(true);
    const options: SearchOptions = {
      query: searchQuery,
      caseSensitive,
      wholeWord,
      limit: 100
    };

    await searchInDatabase(options);
    setIsSearching(false);
  };

  const handleClose = () => {
    clearSearchResults();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg shadow-lg w-[800px] max-h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Search Database</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter search text..."
              className="flex-1 px-3 py-2 border rounded-md bg-background"
              autoFocus
            />
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Case sensitive</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={wholeWord}
                onChange={(e) => setWholeWord(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Whole word</span>
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-auto border-t">
          {searchResults.length > 0 ? (
            <div className="p-4">
              <div className="text-sm text-muted-foreground mb-2">
                Found {searchResults.length} results
              </div>
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {result.table}.{result.column}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Row ID: {result.rowId}
                      </span>
                    </div>
                    <div className="text-sm font-mono bg-background p-2 rounded">
                      {String(result.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              {isSearching ? 'Searching...' : 'No results found'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}