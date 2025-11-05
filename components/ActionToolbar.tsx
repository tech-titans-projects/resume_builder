import React, { useState } from 'react';
import type { TemplateId } from '../types';
import { Loader } from './Loader';
import { EyeIcon, ArrowDownTrayIcon } from './IconComponents';

interface ActionToolbarProps {
  setTemplate: (template: TemplateId) => void;
  currentTemplate: TemplateId;
  onExportPDF: () => void;
  onExportHTML: () => void;
  onExportDOCX: () => void;
  isLoading: boolean;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  setTemplate,
  currentTemplate,
  onExportPDF,
  onExportHTML,
  onExportDOCX,
  isLoading,
}) => {
  const [isTemplateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [isExportMenuOpen, setExportMenuOpen] = useState(false);

  const templates: { id: TemplateId; name: string }[] = [
    { id: 'modern', name: 'Modern' },
    { id: 'classic', name: 'Classic' },
    { id: 'creative', name: 'Creative' },
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="relative">
        <button
          onClick={() => setTemplateMenuOpen(!isTemplateMenuOpen)}
          className="toolbar-button"
          aria-haspopup="true"
          aria-expanded={isTemplateMenuOpen}
        >
          <EyeIcon />
          <span className="hidden sm:inline">Template</span>
        </button>
        {isTemplateMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-30 ring-1 ring-black ring-opacity-5">
            {templates.map((template) => (
              <a
                key={template.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setTemplate(template.id);
                  setTemplateMenuOpen(false);
                }}
                className={`block px-4 py-2 text-sm ${
                  currentTemplate === template.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {template.name}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setExportMenuOpen(!isExportMenuOpen)}
          disabled={isLoading}
          className="toolbar-button"
          aria-haspopup="true"
          aria-expanded={isExportMenuOpen}
        >
          {isLoading ? <Loader /> : <ArrowDownTrayIcon />}
          <span className="hidden sm:inline">{isLoading ? 'Exporting...' : 'Export'}</span>
        </button>
        {isExportMenuOpen && !isLoading && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-30 ring-1 ring-black ring-opacity-5">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onExportPDF();
                setExportMenuOpen(false);
              }}
              className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Export as PDF
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onExportDOCX();
                setExportMenuOpen(false);
              }}
              className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Export as DOCX
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onExportHTML();
                setExportMenuOpen(false);
              }}
              className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Export as HTML
            </a>
          </div>
        )}
      </div>
      <style>{`
        .toolbar-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 600;
          transition: background-color 0.2s;
          border: 1px solid #d1d5db; /* slate-300 */
        }
        .dark .toolbar-button {
            border-color: #4b5563; /* slate-600 */
        }
        .toolbar-button:hover:not(:disabled) {
            background-color: #f3f4f6; /* slate-100 */
        }
        .dark .toolbar-button:hover:not(:disabled) {
            background-color: #374151; /* slate-700 */
        }
        .toolbar-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
