# 🌐 Cloud-Based Collaborative Code Editor Platform

A real-time collaborative, browser-based code editor designed to empower developers, students, and educators to write, edit, and manage code together — anytime, anywhere — without relying on third-party SaaS platforms.

## 🚀 Overview

In the modern world of remote development and online education, collaboration is key. This platform provides a self-hosted, secure, and scalable environment for real-time code collaboration. Built using **ReactJS**, **TailwindCSS**, and **Firebase**, it offers a seamless and accessible experience across devices and browsers.

## 🧩 Features

- 🔄 **Real-Time Collaboration**  
  Multiple users can write and edit code simultaneously with real-time sync using Firebase Firestore.

- 💻 **Advanced Code Editor**  
  Integrated with syntax highlighting, autocompletion, and error detection powered by Monaco Editor.

- 🧠 **Auto Code Correction**  
  Get intelligent suggestions to improve code structure and syntax in real time.

- 📁 **File Sharing & Management**  
  Upload, create, rename, and manage code files and folders directly within the platform.

- 🔐 **Secure Authentication**  
  Firebase Authentication for secure and easy user sign-in/sign-up.

- 🌍 **Responsive Design**  
  Built with TailwindCSS to work seamlessly across all devices.

---

## 🛠️ Tech Stack

| Layer           | Technology / Tool            |
|-----------------|------------------------------|
| Frontend        | ReactJS                      |
| Styling         | Tailwind CSS                 |
| Code Editor     | Monaco Editor                |
| Authentication  | Firebase Auth                |
| Database        | Firebase Firestore           |
| Hosting         | Vercel                       |
| Version Control | Git & GitHub                 |

---

## 🧪 Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/cloud-code-editor.git
cd cloud-code-editor
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Firebase
- Create a .env file in the root.
- Add your Firebase credentials:
```bash
REACT_APP_API_KEY=your_api_key
REACT_APP_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_PROJECT_ID=your_project_id
REACT_APP_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_MESSAGING_SENDER_ID=your_messaging_id
REACT_APP_APP_ID=your_app_id
```

### 4. Run the development server
```bash
npm run dev
```
