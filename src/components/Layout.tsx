import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { EditorPanel } from './EditorPanel';
import { ResultsPanel } from './ResultsPanel';
import { WelcomeScreen } from './WelcomeScreen';
import { useDatabaseStore } from '@/store/databaseStore';

export function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const activeConnectionId = useDatabaseStore((state) => state.activeConnectionId);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" autoSaveId="main-layout">
          <Panel
            id="sidebar"
            defaultSize={20}
            minSize={15}
            maxSize={30}
            collapsible={true}
            onCollapse={() => setIsSidebarCollapsed(true)}
            onExpand={() => setIsSidebarCollapsed(false)}
          >
            <Sidebar isCollapsed={isSidebarCollapsed} />
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-border hover:bg-primary/20 transition-colors" />
          
          <Panel id="main" defaultSize={80}>
            {activeConnectionId ? (
              <PanelGroup direction="vertical" autoSaveId="editor-layout">
                <Panel id="editor" defaultSize={50} minSize={30}>
                  <EditorPanel />
                </Panel>
                
                <PanelResizeHandle className="h-1 bg-border hover:bg-primary/20 transition-colors" />
                
                <Panel id="results" defaultSize={50} minSize={20}>
                  <ResultsPanel />
                </Panel>
              </PanelGroup>
            ) : (
              <WelcomeScreen />
            )}
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}