import Link from "next/link";
import { BookOpen, ShieldCheck, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="px-6 h-16 flex items-center border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
          <BookOpen className="w-6 h-6" />
          <span>EngineerPortal</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4 text-slate-700 dark:text-slate-200"
            href="/login"
          >
            Sign In
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-slate-900 dark:text-white">
                Your Central Hub for Engineering Resources
              </h1>
              <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl dark:text-slate-400">
                Access study materials, manage projects, and connect with peers. Everything you need to succeed in your engineering journey.
              </p>
            </div>
            <div className="space-x-4">
              <Link
                className="inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-700 disabled:pointer-events-none disabled:opacity-50"
                href="/dashboard"
              >
                Browse Resources
              </Link>
              <Link
                className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:focus-visible:ring-slate-300"
                href="/dashboard"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-100 dark:bg-slate-900 px-4 md:px-6">
          <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-3 mx-auto max-w-6xl">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-indigo-100 px-3 py-1 text-sm dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                Students
              </div>
              <h2 className="text-lg font-bold">Access Resources</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Start learning with our comprehensive library of engineering materials and guides.
              </p>
            </div>
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-indigo-100 px-3 py-1 text-sm dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                Faculty
              </div>
              <h2 className="text-lg font-bold">Manage Content</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Admin tools to keep resources up to date and relevant for all students.
              </p>
            </div>
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-indigo-100 px-3 py-1 text-sm dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                Secure
              </div>
              <h2 className="text-lg font-bold">Authenticated Access</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Role-based access control ensuring the right content gets to the right people.
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 pt-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Enterprise grade security</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          © 2026 Engineering Portal. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-slate-500 dark:text-slate-400" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-slate-500 dark:text-slate-400" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
