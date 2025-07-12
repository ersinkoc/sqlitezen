import { useEffect } from 'react';
import { useDatabaseStore } from './store/databaseStore';
import { Layout } from './components/Layout';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  const initializeDatabase = useDatabaseStore((state) => state.initialize);

  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  );
}

export default App;