import { useDatabaseStore } from '@/store/databaseStore';
import { formatDistanceToNow } from '@/utils/date';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export function QueryHistory() {
  const queryHistory = useDatabaseStore((state) => state.queryHistory);

  if (queryHistory.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No query history yet
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {queryHistory.map((entry) => (
          <div
            key={entry.id}
            className="border rounded-lg p-4 space-y-2 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                  {entry.query}
                </pre>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(entry.timestamp)}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {entry.success ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">
                    Success
                    {entry.result && ` • ${entry.result.rowCount} rows`}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    {entry.error || 'Failed'}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}