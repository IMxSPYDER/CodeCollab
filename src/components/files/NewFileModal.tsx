import { useState, FormEvent } from 'react';
import { X } from 'lucide-react';
import { EditorLanguage } from '../../types';

interface NewFileModalProps {
  onClose: () => void;
  onCreateFile: (name: string, language: string) => void;
}

const NewFileModal = ({ onClose, onCreateFile }: NewFileModalProps) => {
  const [fileName, setFileName] = useState('');
  const [language, setLanguage] = useState<EditorLanguage>('javascript');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!fileName.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await onCreateFile(fileName.trim(), language);
      onClose();
    } catch (error) {
      console.error('Error creating file:', error);
      setIsSubmitting(false);
    }
  };

  const languageOptions: { value: EditorLanguage; label: string }[] = [
    { value: 'javascript', label: 'JavaScript (.js)' },
    { value: 'typescript', label: 'TypeScript (.ts)' },
    { value: 'html', label: 'HTML (.html)' },
    { value: 'css', label: 'CSS (.css)' },
    { value: 'json', label: 'JSON (.json)' },
    { value: 'markdown', label: 'Markdown (.md)' },
    { value: 'python', label: 'Python (.py)' },
    { value: 'java', label: 'Java (.java)' },
    { value: 'c', label: 'C (.c)' },
    { value: 'cpp', label: 'C++ (.cpp)' },
    { value: 'csharp', label: 'C# (.cs)' },
    { value: 'go', label: 'Go (.go)' },
    { value: 'rust', label: 'Rust (.rs)' },
    { value: 'php', label: 'PHP (.php)' },
    { value: 'ruby', label: 'Ruby (.rb)' },
  ];

  // Helper to get file extension for the selected language
  const getExtensionForLanguage = (lang: EditorLanguage): string => {
    const found = languageOptions.find(option => option.value === lang);
    if (!found) return '';
    
    const match = found.label.match(/\((.*?)\)/);
    return match ? match[1] : '';
  };

  // Helper to check if the file name already includes an extension
  const hasExtension = (name: string): boolean => {
    return /\.\w+$/.test(name);
  };

  // Get the full file name with extension if needed
  const getFullFileName = (): string => {
    if (!fileName) return '';
    if (hasExtension(fileName)) return fileName;
    
    const extension = getExtensionForLanguage(language);
    return `${fileName}${extension}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white dark:bg-slate-800 rounded-md text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white" id="modal-title">
                  Create new file
                </h3>
                <div className="mt-4">
                  <form onSubmit={handleSubmit}>
                    <div>
                      <label htmlFor="file-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        File name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="file-name"
                          id="file-name"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          placeholder="my-file"
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                      {fileName && (
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Full name: {getFullFileName()}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="language" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Language
                      </label>
                      <div className="mt-1">
                        <select
                          id="language"
                          name="language"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value as EditorLanguage)}
                        >
                          {languageOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        disabled={isSubmitting || !fileName.trim()}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-700 text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                      >
                        {isSubmitting ? 'Creating...' : 'Create'}
                      </button>
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={onClose}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewFileModal;