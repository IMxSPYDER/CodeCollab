// Home.tsx
import { Link } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
import { ArrowRight, Code2, Users, FileCode, Zap, Database, FileLock } from 'lucide-react';

export default function Home() {
  return (
    <div className='flex items-center align-middle'>
    <div className="flex flex-col min-h-screen m-auto">
      <header className="border-b rounded-l-lg rounded-r-lg">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
          <Code2 className="h-8 w-8 text-blue-700 dark:text-blue-400" />
              <span className="ml-2 text-xl font-bold text-slate-900 dark:text-white">
                CodeCollab
              </span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </a>
            <a href="#about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </a>
            <a href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <button className='font-medium text-blue-700 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300'>Log In</button>
            </Link>
            <Link to="/signup">
              <button className='font-medium text-white bg-blue-600 border rounded-lg px-2 py-1 hover:bg-blue-800 '>Sign Up</button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Collaborate on Code in Real-Time
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Write, edit, and execute code together with your team from anywhere in the world.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row items-center">
                  <Link to="/signup">
                    <button className='bg-blue-600 hover:bg-blue-800 text-white font-medium rounded-lg border px-4 py-2'>
                      Get Started
                    </button>
                  </Link>
                  <Link to="/login">
                    <button className='font-medium text-blue-700 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300'>Try Demo</button>
                  </Link>
                </div>
              </div>

              {/* Code Preview Box */}
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[600px] aspect-video overflow-hidden rounded-xl border bg-white shadow-xl dark:bg-gray-800">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
                    <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=800')] bg-center bg-no-repeat opacity-50"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4/5 h-4/5 rounded-lg bg-gray-900/90 p-4 shadow-lg">
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                      </div>
                      <div className="font-mono text-xs text-green-400">
                        <div>{"function calculateSum(a, b) {"}</div>
                        <div className="pl-4">{"return a + b;"}</div>
                        <div>{"}"}</div>
                        <div className="mt-2">{"// User 1 is typing..."}</div>
                        <div>{"const result = calculateSum(5, 10);"}</div>
                        <div className="text-blue-400 mt-2">{"// User 2 is typing..."}</div>
                        <div>{"console.log(`The sum is ${result}`);"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* End Code Preview */}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Everything You Need for Collaborative Coding
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our platform combines powerful features to make team coding seamless and efficient.
                </p>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {/* Repeatable Feature Card */}
              <FeatureCard icon={<Users />} title="Real-Time Collaboration" description="Multiple users can write and edit code simultaneously with instant updates." />
              <FeatureCard icon={<Code2 />} title="Modern Code Editor" description="Syntax highlighting, autocompletion, and real-time error detection." />
              <FeatureCard icon={<FileCode />} title="File Management" description="Upload, organize, and share code files with your team effortlessly." />
              <FeatureCard icon={<Zap />} title="Auto Code Correction" description="Intelligent suggestions and improvements offered in real-time." />
              <FeatureCard icon={<Database/>} title="Secure Storage" description="Your code is securely stored and backed up with Firebase Cloud Storage." />
              <FeatureCard icon={<FileLock/>} title="Authentication" description="Secure user authentication and access control with Firebase Auth." />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
            © 2023 CodeCollab. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm font-medium hover:underline underline-offset-4">Terms</a>
            <a href="#" className="text-sm font-medium hover:underline underline-offset-4">Privacy</a>
            <a href="#" className="text-sm font-medium hover:underline underline-offset-4">Contact</a>
          </div>
        </div>
      </footer>
    </div>
    </div>
  );
}

// Optional: FeatureCard helper component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
      {icon && <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">{icon}</div>}
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-center text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
