# SQLite Zen

A powerful, browser-based SQLite database management tool built with React, TypeScript, and WebAssembly. SQLite Zen provides a comprehensive interface for managing SQLite databases directly in your browser with no server required.

## 🚀 Live Demo

Visit [sqlitezen.com](https://sqlitezen.com) to try the application.

## 📋 Overview

SQLite Zen is a full-featured SQLite database management system that runs entirely in your browser. It leverages WebAssembly to run SQLite directly in the browser, providing a desktop-like experience without any installation required.

## ✨ Key Features

### 📊 **Database Management**
- **Full SQLite Support**: Complete SQLite functionality via WebAssembly
- **Multiple Databases**: Manage multiple database connections simultaneously
- **Visual Schema Explorer**: Browse tables, columns, indexes, and relationships
- **Table Operations**: Create, alter, drop tables with visual tools
- **Data Editing**: Direct cell editing in the data grid
- **Row Operations**: Insert, update, delete rows with dialog interfaces
- **Context Menus**: Right-click operations for tables and database objects

### 🔄 **Import/Export Capabilities**
- **Export Formats**: 
  - SQLite database files (.db)
  - SQL dump scripts
  - CSV with custom delimiters
  - JSON format
- **Import Support**:
  - SQL scripts execution
  - CSV files with auto-detection
  - JSON data import
- **Advanced Options**:
  - Schema-only or data-only exports
  - Batch operations for multiple tables
  - Custom delimiter support

### 🖊️ **SQL Editor**
- **Monaco Editor**: Industry-standard code editor
- **Syntax Highlighting**: Full SQLite language support
- **Intelligent Autocomplete**:
  - SQL keywords and functions
  - Table and column names from current schema
  - Context-aware suggestions
- **Advanced Features**:
  - Multi-query execution
  - SQL formatting (Shift+Alt+F)
  - Error highlighting
  - Query history with timestamps
  - Execution time tracking

### 🎨 **User Interface**
- **Modern Design**: Clean, intuitive interface
- **Responsive Layout**: Works on desktop and tablet
- **Resizable Panels**: Customize your workspace
- **Dark/Light Themes**: Eye-friendly viewing modes
- **Keyboard Shortcuts**: Productivity-focused navigation
- **Context Menus**: Right-click functionality throughout

### ⚡ **Performance & Storage**
- **WebAssembly Powered**: Near-native performance
- **IndexedDB Integration**: Automatic database persistence
- **Lazy Loading**: Fast initial load times
- **Offline Support**: Works without internet connection
- **PWA Ready**: Install as a desktop application

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ersinkoc/sqlitezen.git
cd sqlitezen

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview

# Output will be in the `dist` directory
```

### Docker Support

```bash
# Build Docker image
docker build -t sqlitezen .

# Run container
docker run -p 8080:80 sqlitezen
```

## 🛠️ Technical Stack

### Core Technologies
- **Frontend Framework**: React 18 with TypeScript
- **Database Engine**: sql.js (SQLite 3.40+ compiled to WebAssembly)
- **Code Editor**: Monaco Editor (VS Code's editor)
- **State Management**: Zustand for reactive state
- **Styling**: Tailwind CSS for modern UI
- **Build Tool**: Vite for fast development
- **Storage**: IndexedDB for persistent storage

### Additional Libraries
- **UI Components**: Radix UI for accessible components
- **Icons**: Lucide React for consistent iconography
- **Data Grid**: AG-Grid for high-performance tables
- **File Handling**: File System Access API
- **Tooltips**: Floating UI for positioning

## 📁 Project Structure

```
sqlitezen/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI primitives
│   │   ├── dialogs/        # Modal dialogs
│   │   ├── Layout.tsx      # Main app layout
│   │   ├── Header.tsx      # App header with actions
│   │   ├── Sidebar.tsx     # Database explorer
│   │   ├── EditorPanel.tsx # SQL query editor
│   │   ├── ResultsPanel.tsx # Query results display
│   │   ├── DataGrid.tsx    # Table data viewer
│   │   └── ...
│   ├── services/           # Business logic layer
│   │   ├── sqliteService.ts    # SQLite operations
│   │   ├── storageService.ts   # IndexedDB persistence
│   │   ├── importExportService.ts # Data import/export
│   │   └── queryService.ts     # Query execution
│   ├── store/              # Application state
│   │   ├── databaseStore.ts    # Database connections
│   │   ├── editorStore.ts      # Editor state
│   │   └── uiStore.ts          # UI preferences
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Helper functions
│   ├── hooks/              # Custom React hooks
│   └── App.tsx             # Root component
├── public/                 # Static assets
├── tests/                  # Test files
└── package.json           # Dependencies
```

## ⌨️ Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Execute Query | `Ctrl + Enter` | `Cmd + Enter` |
| Format SQL | `Shift + Alt + F` | `Shift + Option + F` |
| Save Database | `Ctrl + S` | `Cmd + S` |
| Open Database | `Ctrl + O` | `Cmd + O` |
| New Database | `Ctrl + N` | `Cmd + N` |
| Trigger Autocomplete | `Ctrl + Space` | `Cmd + Space` |
| Toggle Comment | `Ctrl + /` | `Cmd + /` |
| Find | `Ctrl + F` | `Cmd + F` |
| Replace | `Ctrl + H` | `Cmd + H` |

## 🔧 Configuration

### Environment Variables

```bash
# Feature flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=true
```

### User Preferences

User preferences are stored in browser's localStorage:
- Theme selection (dark/light)
- Editor settings (font size, word wrap)
- Panel sizes
- Recent databases

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📈 Roadmap

### Planned Features
- [ ] Visual query builder with drag-and-drop interface
- [ ] Database schema visualization
- [ ] Query performance analyzer
- [ ] Advanced search across database content
- [ ] Export to more formats (Excel, XML)
- [ ] Query templates and snippets
- [ ] Table relationships visualization
- [ ] Data comparison tools

## 🐛 Known Issues

- Large database files (>100MB) may cause performance issues
- Some advanced SQLite features may not be fully supported
- Export functionality limited to 50MB files

## 📚 Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [sql.js Documentation](https://sql.js.org/)
- [React Documentation](https://react.dev/)
- [Monaco Editor Documentation](https://microsoft.github.io/monaco-editor/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- SQLite team for the amazing database engine
- sql.js contributors for WebAssembly port
- Microsoft for Monaco Editor
- All our contributors and users

---

Made with ❤️ by the SQLite Zen Team