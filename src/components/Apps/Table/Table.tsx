import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2 } from 'lucide-react';

interface TableProps {
  onClose: () => void;
}

interface TableData {
  id: string;
  cells: string[];
}

export function Table({ onClose }: TableProps) {
  const [tableName, setTableName] = useState('My Table');
  const [isEditingName, setIsEditingName] = useState(false);
  const [headers, setHeaders] = useState(['Column 1', 'Column 2', 'Column 3']);
  const [rows, setRows] = useState<TableData[]>([
    { id: '1', cells: ['Data 1', 'Data 2', 'Data 3'] },
    { id: '2', cells: ['Data 4', 'Data 5', 'Data 6'] }
  ]);

  const addRow = () => {
    const newRow = {
      id: crypto.randomUUID(),
      cells: headers.map(() => '')
    };
    setRows([...rows, newRow]);
  };

  const addColumn = () => {
    const newColumnIndex = headers.length + 1;
    setHeaders([...headers, `Column ${newColumnIndex}`]);
    setRows(rows.map(row => ({
      ...row,
      cells: [...row.cells, '']
    })));
  };

  const deleteRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const updateCell = (rowId: string, columnIndex: number, value: string) => {
    setRows(rows.map(row => 
      row.id === rowId 
        ? { ...row, cells: row.cells.map((cell, i) => i === columnIndex ? value : cell) }
        : row
    ));
  };

  const updateHeader = (index: number, value: string) => {
    setHeaders(headers.map((header, i) => i === index ? value : header));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter' && isEditingName) {
      setIsEditingName(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800">
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={handleKeyDown}
              className="bg-gray-700 text-white text-sm px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              autoFocus
            />
          ) : (
            <>
              <span className="text-sm font-medium text-gray-300">{tableName}</span>
              <button
                onClick={() => setIsEditingName(true)}
                className="p-1 hover:bg-gray-700 rounded-full"
              >
                <Edit2 className="w-3 h-3 text-gray-400" />
              </button>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded-full"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto p-4 card-scrollbar">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="border border-gray-700 bg-gray-800 p-2">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(index, e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent text-white text-center focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 rounded px-2 py-1"
                      placeholder={`Column ${index + 1}`}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  </th>
                ))}
                <th className="border border-gray-700 bg-gray-800 p-2 w-10">
                  <button
                    onClick={addColumn}
                    className="w-6 h-6 flex items-center justify-center hover:bg-gray-700 rounded-full transition-colors"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Plus className="w-4 h-4 text-pink-500" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {row.cells.map((cell, columnIndex) => (
                    <td key={columnIndex} className="border border-gray-700 p-2">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(row.id, columnIndex, e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 rounded px-2 py-1"
                        placeholder="Enter value..."
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    </td>
                  ))}
                  <td className="border border-gray-700 p-2">
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={addRow}
          className="w-8 h-8 flex items-center justify-center bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
