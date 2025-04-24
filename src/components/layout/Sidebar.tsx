import { Link, useLocation } from 'react-router-dom';
import { X, Home, Folder, Settings, FileCode, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { Project } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const projectsQuery = query(
          collection(db, 'projects'),
          where('ownerId', '==', user.uid)
        );
        
        const collaboratorQuery = query(
          collection(db, 'projects'),
          where('collaborators', 'array-contains', user.uid)
        );
        
        const [ownedSnapshot, collaboratorSnapshot] = await Promise.all([
          getDocs(projectsQuery),
          getDocs(collaboratorQuery)
        ]);
        
        const ownedProjects = ownedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
        
        const collaboratingProjects = collaboratorSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
        
        // Combine projects and remove duplicates
        const allProjects = [...ownedProjects];
        collaboratingProjects.forEach(project => {
          if (!allProjects.some(p => p.id === project.id)) {
            allProjects.push(project);
          }
        });
        
        allProjects.sort((a, b) => b.updatedAt - a.updatedAt);
        
        setProjects(allProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [user]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:translate-x-0 z-30 inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:z-0`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 md:hidden">
            <Link to="/app/dashboard" className="flex items-center">
              <FileCode className="h-6 w-6 text-blue-700 dark:text-blue-400" />
              <span className="ml-2 text-lg font-semibold text-slate-900 dark:text-white">
                CodeCollab
              </span>
            </Link>
            <button
              className="h-10 w-10 rounded-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 py-4 overflow-y-auto">
            <nav className="px-2 space-y-1">
              <Link
                to="/app/dashboard"
                className={`${
                  location.pathname === '/dashboard'
                    ? 'bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                onClick={() => onClose()}
              >
                <Home className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              
              <div className="mt-6 mb-2">
                <div className="flex items-center justify-between px-3">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Projects
                  </h3>
                  <Link
                    to="/app/dashboard?new=project"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    onClick={() => onClose()}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Link>
                </div>
                
                <div className="mt-2 space-y-1">
                  {isLoading ? (
                    <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                      Loading projects...
                    </div>
                  ) : projects.length > 0 ? (
                    projects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/app/project/${project.id}`}
                        className={`${
                          location.pathname === `/project/${project.id}`
                            ? 'bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-400'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                        onClick={() => onClose()}
                      >
                        <Folder className="mr-3 h-4 w-4" />
                        <span className="truncate">{project.name}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                      No projects yet
                    </div>
                  )}
                </div>
              </div>
            </nav>
          </div>
          
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <Link
              to="/app/profile"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              onClick={() => onClose()}
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;