import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Project, CodeFile, Folder } from '../types';
import { FileCode, FolderPlus, FilePlus, Users, Trash2, Share2, Edit, Folder as FolderIcon, ArrowLeft, MoreVertical } from 'lucide-react';
import NewFileModal from '../components/files/NewFileModal';

const ProjectView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId || !user) return;
      
      setIsLoading(true);
      try {
        // Fetch project
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        
        if (!projectDoc.exists()) {
          setError('Project not found');
          setIsLoading(false);
          return;
        }
        
        const projectData = { id: projectDoc.id, ...projectDoc.data() } as Project;
        
        // Check if user is owner or collaborator
        if (projectData.ownerId !== user.uid && !projectData.collaborators.includes(user.uid)) {
          setError('You do not have access to this project');
          setIsLoading(false);
          return;
        }
        
        setProject(projectData);
        
        // Fetch folders
        const foldersQuery = query(
          collection(db, 'folders'),
          where('projectId', '==', projectId),
          where('parentFolderId', '==', currentFolder)
        );
        
        // Fetch files
        const filesQuery = query(
          collection(db, 'files'),
          where('projectId', '==', projectId),
          where('parentFolderId', '==', currentFolder)
        );
        
        const [foldersSnapshot, filesSnapshot] = await Promise.all([
          getDocs(foldersQuery),
          getDocs(filesQuery)
        ]);
        
        setFolders(foldersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Folder)));
        
        setFiles(filesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as CodeFile)));
        
      } catch (error) {
        console.error('Error fetching project data:', error);
        setError('Failed to load project data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectData();
  }, [projectId, user, currentFolder]);

  const handleCreateFile = async (name: string, language: string) => {
    if (!projectId || !user) return;
    
    try {
      const fileData = {
        name,
        content: '',
        language,
        projectId,
        parentFolderId: currentFolder,
        ownerId: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const fileRef = await addDoc(collection(db, 'files'), fileData);
      
      // Navigate to the editor with the new file
      navigate(`/app/editor/${fileRef.id}`);
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (!projectId || !user) return;
    
    const folderName = prompt('Enter folder name:');
    
    if (!folderName) return;
    
    try {
      const folderData = {
        name: folderName,
        projectId,
        parentFolderId: currentFolder,
        ownerId: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      await addDoc(collection(db, 'folders'), folderData);
      
      // Refresh the folders list
      const foldersQuery = query(
        collection(db, 'folders'),
        where('projectId', '==', projectId),
        where('parentFolderId', '==', currentFolder)
      );
      
      const foldersSnapshot = await getDocs(foldersQuery);
      
      setFolders(foldersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Folder)));
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const navigateToParentFolder = async () => {
    if (!currentFolder) return;
    
    if (!projectId) return;
    
    try {
      const folderDoc = await getDoc(doc(db, 'folders', currentFolder));
      
      if (folderDoc.exists()) {
        const folderData = folderDoc.data() as Folder;
        setCurrentFolder(folderData.parentFolderId);
      }
    } catch (error) {
      console.error('Error navigating to parent folder:', error);
    }
  };

  const navigateToFolder = (folderId: string) => {
    setCurrentFolder(folderId);
  };

  const navigateToFile = (fileId: string) => {
    navigate(`/app/editor/${fileId}`);
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
                <p>Please check the project URL or return to the dashboard.</p>
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
    <div className="max-w-7xl mx-auto">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700 dark:border-blue-400"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <div className="flex items-center">
                {currentFolder && (
                  <button
                    onClick={navigateToParentFolder}
                    className="mr-2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </button>
                )}
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project?.name}</h1>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {currentFolder ? 'Browse files and folders' : 'Project root'}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button
                onClick={() => setShowNewFileModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FilePlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New File
              </button>
              <button
                onClick={handleCreateFolder}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FolderPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Folder
              </button>
              <button
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Share2 className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Share
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">
                {currentFolder ? 'Current Folder' : 'Project Files'}
              </h3>
            </div>
            
            <ul role="list" className="divide-y divide-slate-200 dark:divide-slate-700">
              {folders.length === 0 && files.length === 0 ? (
                <li className="px-4 py-12 text-center">
                  <FolderIcon className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No files or folders</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Get started by creating a new file or folder.
                  </p>
                  <div className="mt-6 flex justify-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowNewFileModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FilePlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      New File
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateFolder}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FolderPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      New Folder
                    </button>
                  </div>
                </li>
              ) : (
                <>
                  {folders.map((folder) => (
                    <li
                      key={folder.id}
                      className="px-4 py-4 flex items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                      onClick={() => navigateToFolder(folder.id)}
                    >
                      <div className="min-w-0 flex-1 flex items-center">
                        <div className="flex-shrink-0">
                          <FolderIcon className="h-6 w-6 text-blue-700 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1 px-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {folder.name}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            Folder
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open folder options
                          }}
                          className="p-1 rounded-full text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                  
                  {files.map((file) => (
                    <li
                      key={file.id}
                      className="px-4 py-4 flex items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                      onClick={() => navigateToFile(file.id)}
                    >
                      <div className="min-w-0 flex-1 flex items-center">
                        <div className="flex-shrink-0">
                          <FileCode className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="min-w-0 flex-1 px-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {file.name}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {file.language.charAt(0).toUpperCase() + file.language.slice(1)}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open file options
                          }}
                          className="p-1 rounded-full text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>
          
          {showNewFileModal && (
            <NewFileModal
              onClose={() => setShowNewFileModal(false)}
              onCreateFile={handleCreateFile}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ProjectView;