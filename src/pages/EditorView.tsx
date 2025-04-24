import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, updateDoc,  getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CodeFile, Collaborator, EditorState, EditorLanguage } from '../types';
import { ArrowLeft, Save, Users, Share2, Settings } from 'lucide-react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { MonacoBinding } from 'y-monaco';

const EditorView = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [file, setFile] = useState<CodeFile | null>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    file: null,
    language: 'javascript',
    theme: 'dark',
    fontSize: 14,
    collaborators: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  
  // References for editor synchronization
  const editorRef = useRef<any>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);
  const yTextRef = useRef<Y.Text | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  useEffect(() => {
    if (!isShareModalOpen) return;
  
    const fetchUsers = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(u => u.uid !== user?.uid); // exclude current user
      setAllUsers(users);
    };
  
    fetchUsers();
  }, [isShareModalOpen]);

  const handleShare = async () => {
    if (!file || !selectedUserId) return;
  
    const projectRef = doc(db, 'projects', file.projectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return;
  
    const projectData = projectSnap.data();
    const existingCollaborators = projectData.collaborators || [];
  
    if (!existingCollaborators.includes(selectedUserId)) {
      await updateDoc(projectRef, {
        collaborators: [...existingCollaborators, selectedUserId]
      });
    }
  
    setIsShareModalOpen(false);
    setSelectedUserId(null);
  };

  useEffect(() => {
    const fetchFileData = async () => {
      if (!fileId || !user) return;
      
      setIsLoading(true);
      try {
        // Fetch file
        const fileDoc = await getDoc(doc(db, 'files', fileId));
        
        if (!fileDoc.exists()) {
          setError('File not found');
          setIsLoading(false);
          return;
        }
        
        const fileData = { id: fileDoc.id, ...fileDoc.data() } as CodeFile;
        
        // Fetch project to check permissions
        const projectDoc = await getDoc(doc(db, 'projects', fileData.projectId));
        
        if (!projectDoc.exists()) {
          setError('Project not found');
          setIsLoading(false);
          return;
        }
        
        const projectData = projectDoc.data();
        
        // Check if user is owner or collaborator
        if (projectData.ownerId !== user.uid && !projectData.collaborators.includes(user.uid)) {
          setError('You do not have access to this file');
          setIsLoading(false);
          return;
        }
        
        setFile(fileData);
        setEditorState(prev => ({
          ...prev,
          file: fileData,
          language: fileData.language as EditorLanguage
        }));
        
      } catch (error) {
        console.error('Error fetching file data:', error);
        setError('Failed to load file data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFileData();
    
    // Clean up collaborators on unmount
    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
      }
    };
  }, [fileId, user]);

  // Setup collaborative editing when file is loaded
  useEffect(() => {
    if (!file || !user) return;
    
    try {
      // Initialize Yjs document
      const ydoc = new Y.Doc();
      ydocRef.current = ydoc;
      
      // Create shared text
      const yText = ydoc.getText('monaco');
      yTextRef.current = yText;
      
      // Set random color for user
      const colors = [
        '#2563EB', // blue
        '#059669', // emerald
        '#D97706', // amber
        '#DC2626', // red
        '#7C3AED', // violet
        '#DB2777', // pink
        '#4F46E5', // indigo
        '#0891B2', // cyan
      ];
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Initialize WebRTC provider with awareness
      const provider = new WebrtcProvider(`codecollab-${file.id}`, ydoc, {
        signaling: ['wss://signaling.yjs.dev'],
        password: file.id,
      });
      
      providerRef.current = provider;
      
      // Track collaborators through awareness
      provider.awareness.setLocalState({
        uid: user.uid,
        name: user.displayName || 'Anonymous',
        color,
        active: true,
      });
      
      const updateCollaborators = () => {
        const states = Array.from(provider.awareness.getStates().entries())
          .filter(([clientId]) => clientId !== provider.awareness.clientID)
          .map(([, state]) => ({
            uid: state.uid || 'unknown',
            displayName: state.name || 'Anonymous',
            photoURL: null,
            color: state.color || '#000000',
            active: state.active || false,
            lastSeen: Date.now()
          }));
        
        setEditorState(prev => ({
          ...prev,
          collaborators: states
        }));
      };
      
      provider.awareness.on('change', updateCollaborators);
      
      return () => {
        provider.awareness.off('change', updateCollaborators);
        provider.destroy();
      };
    } catch (error) {
      console.error('Error setting up collaboration:', error);
      setError('Failed to initialize collaborative editing');
    }
  }, [file, user]);

  // Handle editor mounting and binding
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    if (file && ydocRef.current && yTextRef.current && providerRef.current) {
      // Initialize editor with file content
      // Initialize Yjs shared text with file content (only if Yjs text is empty)
if (yTextRef.current && yTextRef.current.length === 0) {
  yTextRef.current.insert(0, file.content || '');
}

// Bind Yjs to Monaco
const binding = new MonacoBinding(
  yTextRef.current,
  editor.getModel(),
  new Set([editor]),
  providerRef.current.awareness
);
      
      bindingRef.current = binding;
    }
  };

  const saveFile = async () => {
    if (!file || !editorRef.current) return;
    
    setIsSaving(true);
    try {
      const content = editorRef.current.getValue();
      
      // Update file in Firestore
      await updateDoc(doc(db, 'files', file.id), {
        content,
        updatedAt: Date.now()
      });
      
      // Update local state
      setFile(prev => prev ? { ...prev, content, updatedAt: Date.now() } : null);
    } catch (error) {
      console.error('Error saving file:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>Please check the file URL or return to your project.</p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    type="button"
                    onClick={() => navigate('/app/dashboard')}
                    className="bg-red-50 dark:bg-red-900/30 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  

  return (
    <div className="h-full flex flex-col">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700 dark:border-blue-400"></div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-800 shadow-sm z-10 p-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/app/project/${file?.projectId}`)}
                className="mr-3 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
              <div>
                <h1 className="text-lg font-medium text-slate-900 dark:text-white">{file?.name}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {editorState.language.charAt(0).toUpperCase() + editorState.language.slice(1)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {editorState.collaborators.length > 0 && (
                <div className="flex -space-x-2 mr-2">
                  {editorState.collaborators.slice(0, 3).map((collaborator, index) => (
                    <div
                      key={index}
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: collaborator.color }}
                      title={collaborator.displayName || 'Anonymous'}
                    >
                      {collaborator.displayName?.[0]?.toUpperCase() || 'A'}
                    </div>
                  ))}
                  {editorState.collaborators.length > 3 && (
                    <div className="h-8 w-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 text-sm font-medium">
                      +{editorState.collaborators.length - 3}
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={saveFile}
                disabled={isSaving}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Save
                  </>
                )}
              </button>
              
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Share2 className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Share
              </button>
              
              <button
                className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Settings className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Settings
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage={editorState.language}
              defaultValue={file?.content || ''}
              theme={editorState.theme === 'dark' ? 'vs-dark' : 'light'}
              onMount={handleEditorDidMount}
              options={{
                fontSize: editorState.fontSize,
                minimap: { enabled: true },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          </div>
        </>
      )}
      {isShareModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white dark:bg-slate-800 p-6 rounded shadow-md w-full max-w-md">
      <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Share with a user</h2>
      <select
        className="w-full p-2 border rounded mb-4 dark:bg-slate-700 dark:text-white"
        onChange={e => setSelectedUserId(e.target.value)}
        value={selectedUserId || ''}
      >
        <option value="">Select a user</option>
        {allUsers.map(user => (
          <option key={user.uid} value={user.uid}>
            {user.displayName || user.email}
          </option>
        ))}
      </select>
      <div className="flex justify-end space-x-2">
        <button onClick={() => setIsShareModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded">Cancel</button>
        <button onClick={handleShare} className="px-4 py-2 bg-blue-700 text-white rounded">Share</button>
      </div>
    </div>
  </div>
)}


    </div>

    
  );
};

export default EditorView;