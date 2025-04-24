import { useEffect, useState } from 'react';
import { Plus, Folder, Clock, FileCode } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Project, CodeFile } from '../types';
import NewProjectModal from '../components/projects/NewProjectModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentFiles, setRecentFiles] = useState<CodeFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(searchParams.get('new') === 'project');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch user's projects - simplified query without complex ordering
        const projectsQuery = query(
          collection(db, 'projects'),
          where('ownerId', '==', user.uid),
          limit(4)
        );
        
        const collaboratingQuery = query(
          collection(db, 'projects'),
          where('collaborators', 'array-contains', user.uid),
          limit(4)
        );
        
        // Fetch recent files - simplified query
        const filesQuery = query(
          collection(db, 'files'),
          where('ownerId', '==', user.uid),
          limit(5)
        );
        
        const [projectsSnapshot, collaboratingSnapshot, filesSnapshot] = await Promise.all([
          getDocs(projectsQuery),
          getDocs(collaboratingQuery),
          getDocs(filesQuery)
        ]);
        
        const ownedProjects = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Project));
        
        const collaboratingProjects = collaboratingSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Project));
        
        // Combine projects and remove duplicates
        const allProjects = [...ownedProjects];
        collaboratingProjects.forEach(project => {
          if (!allProjects.some(p => p.id === project.id)) {
            allProjects.push(project);
          }
        });
        
        // Sort in memory instead of using orderBy
        allProjects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        
        setProjects(allProjects.slice(0, 4));
        
        const files = filesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as CodeFile));
        
        // Sort files in memory
        files.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        
        setRecentFiles(files);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleCreateProject = async (name: string) => {
    if (!user) return;
    
    try {
      const newProject = await addDoc(collection(db, 'projects'), {
        name,
        ownerId: user.uid,
        collaborators: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      navigate(`/app/project/${newProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Welcome back, {user?.displayName || 'Coder'}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">Your Projects</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Recently updated projects
              </p>
            </div>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="inline-flex items-center px-2 py-1 border border-transparent rounded-md text-sm font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </button>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {isLoading ? (
              <div className="px-4 py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-700 dark:border-blue-400"></div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Loading your projects...</p>
              </div>
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="px-4 py-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                  onClick={() => navigate(`/app/project/${project.id}`)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Folder className="h-6 w-6 text-blue-700 dark:text-blue-400" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="font-medium text-slate-900 dark:text-white truncate">
                        {project.name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Updated {formatDate(project.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-12 text-center">
                <Folder className="mx-auto h-10 w-10 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No projects</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Get started by creating a new project.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowNewProjectModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    New Project
                  </button>
                </div>
              </div>
            )}
          </div>
          {projects.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 sm:px-6">
              <div className="text-sm">
                <button
                  onClick={() => navigate('/app/dashboard/projects')}
                  className="font-medium text-blue-700 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                >
                  View all projects
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white">Recent Files</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Files you've recently worked on
            </p>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {isLoading ? (
              <div className="px-4 py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-700 dark:border-blue-400"></div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Loading your recent files...</p>
              </div>
            ) : recentFiles.length > 0 ? (
              recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="px-4 py-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                  onClick={() => navigate(`/app/editor/${file.id}`)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileCode className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="font-medium text-slate-900 dark:text-white truncate">
                        {file.name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(file.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-12 text-center">
                <FileCode className="mx-auto h-10 w-10 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No recent files</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Create a project and start coding to see your recent files here.
                </p>
              </div>
            )}
          </div>
          {recentFiles.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 sm:px-6">
              <div className="text-sm">
                <button
                  onClick={() => navigate('/dashboard/files')}
                  className="font-medium text-blue-700 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                >
                  View all files
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onCreateProject={handleCreateProject}
        />
      )}
    </div>
  );
};

export default Dashboard;