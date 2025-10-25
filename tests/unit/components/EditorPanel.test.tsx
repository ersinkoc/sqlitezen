import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EditorPanel } from '@/components/EditorPanel';
import { useDatabaseStore } from '@/store/databaseStore';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('@/store/databaseStore');
vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, onChange }) => (
    <textarea
      data-testid="mock-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));
vi.mock('react-hot-toast');

const mockUseDatabaseStore = useDatabaseStore as unknown as vi.Mock;

const mockTemplate = {
  id: '1',
  name: 'Test Template',
  query: 'SELECT * FROM {{table}} WHERE id = {{id}}',
  variables: [
    { name: 'table', defaultValue: 'users', description: 'Table name' },
    { name: 'id', defaultValue: '1', description: 'Record ID' },
  ],
  category: 'Test',
  description: 'A test template',
};

describe('EditorPanel', () => {
  let applyQueryTemplateMock;
  let setCurrentQueryMock;

  beforeEach(() => {
    applyQueryTemplateMock = vi.fn();
    setCurrentQueryMock = vi.fn();

    mockUseDatabaseStore.mockReturnValue({
      executeQuery: vi.fn(),
      activeConnectionId: 'test-db',
      saveDatabase: vi.fn(),
      sqliteService: {},
      currentQuery: '',
      setCurrentQuery: setCurrentQueryMock,
      showQueryPlan: false,
      setShowQueryPlan: vi.fn(),
      queryTemplates: [mockTemplate],
      applyQueryTemplate: applyQueryTemplateMock,
    });

    // Mock window.prompt
    window.prompt = vi.fn();

    // Mock toast
    vi.spyOn(toast, 'error');
  });

  // Helper to render the component and open the templates modal
  const renderAndOpenTemplates = () => {
    render(<EditorPanel />);
    // The modal is controlled by internal state `showTemplates`, triggered by a button.
    const templatesButton = screen.getByTitle('Query templates');
    fireEvent.click(templatesButton);
  };

  it('should not apply template if user cancels the first prompt', async () => {
    (window.prompt as vi.Mock).mockReturnValueOnce(null);

    renderAndOpenTemplates();

    const templateItem = screen.getByText('Test Template');
    await act(async () => {
      fireEvent.click(templateItem);
    });

    expect(window.prompt).toHaveBeenCalledTimes(1);
    expect(window.prompt).toHaveBeenCalledWith('Enter value for table (Table name):', 'users');
    expect(toast.error).toHaveBeenCalledWith('Template application cancelled.');
    expect(applyQueryTemplateMock).not.toHaveBeenCalled();
    expect(setCurrentQueryMock).not.toHaveBeenCalled();
  });

  it('should not apply template if user cancels the second prompt', async () => {
    (window.prompt as vi.Mock)
      .mockReturnValueOnce('my_table')
      .mockReturnValueOnce(null);

    renderAndOpenTemplates();

    const templateItem = screen.getByText('Test Template');
    await act(async () => {
      fireEvent.click(templateItem);
    });

    expect(window.prompt).toHaveBeenCalledTimes(2);
    expect(window.prompt).toHaveBeenCalledWith('Enter value for id (Record ID):', '1');
    expect(toast.error).toHaveBeenCalledWith('Template application cancelled.');
    expect(applyQueryTemplateMock).not.toHaveBeenCalled();
    expect(setCurrentQueryMock).not.toHaveBeenCalled();
  });

  it('should apply template if user provides all values', async () => {
    (window.prompt as vi.Mock)
      .mockReturnValueOnce('my_table')
      .mockReturnValueOnce('123');

    renderAndOpenTemplates();

    const templateItem = screen.getByText('Test Template');
    await act(async () => {
        fireEvent.click(templateItem);
    });

    expect(window.prompt).toHaveBeenCalledTimes(2);
    expect(applyQueryTemplateMock).toHaveBeenCalledWith('1', {
      table: 'my_table',
      id: '123',
    });
    // The fallback is also called
    expect(setCurrentQueryMock).toHaveBeenCalled();
  });
});
