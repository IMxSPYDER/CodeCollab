export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Project {
  id: string;
  name: string;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
  collaborators: string[];
}

export interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
  projectId: string;
  parentFolderId: string | null;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  projectId: string;
  parentFolderId: string | null;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Collaborator {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  color: string;
  active: boolean;
  lastSeen: number;
}

export type EditorLanguage = 
  | 'javascript'
  | 'typescript'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'python'
  | 'java'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby';

export interface EditorState {
  file: CodeFile | null;
  language: EditorLanguage;
  theme: 'light' | 'dark';
  fontSize: number;
  collaborators: Collaborator[];
}