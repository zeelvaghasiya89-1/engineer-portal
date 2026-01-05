import Link from "next/link";
import { BookOpen, ShieldCheck, Users, GraduationCap, ArrowRight, Sparkles, FileText, Layers } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0b0d11] text-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-[#282e39] bg-[#111318]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#135bec] text-white">
            <span className="material-symbols-outlined text-[20px]">hub</span>
          </div>
          <span className="text-lg font-bold tracking-tight">EngineerHub</span>
        </div>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium text-[#9da6b9] hover:text-white transition-colors"
            href="/dashboard"
          >
            Resources
          </Link>
          <Link
            className="inline-flex items-center gap-2 bg-[#135bec] hover:bg-[#1d66f0] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-[#135bec]/20"
            href="/login"
          >
            Sign In
            <ArrowRight className="w-4 h-4" />
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 xl:py-40 px-4 md:px-6 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#135bec]/10 via-transparent to-transparent"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#135bec]/20 rounded-full blur-[120px] opacity-50"></div>
          <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-20 left-10 w-[200px] h-[200px] bg-cyan-500/10 rounded-full blur-[60px]"></div>

          <div className="relative z-10 flex flex-col items-center space-y-6 text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#135bec]/10 px-4 py-1.5 text-sm font-medium text-[#135bec] border border-[#135bec]/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              Your Academic Resource Portal
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-b from-white via-white to-[#9da6b9] bg-clip-text text-transparent">
                Your Central Hub for
                <br />
                <span className="text-[#135bec]">Engineering Resources</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-[#9da6b9] text-base md:text-lg lg:text-xl leading-relaxed">
                Access study materials, past papers, lab manuals, and notes. Everything you need to succeed in your engineering journey.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                className="inline-flex items-center justify-center gap-2 h-12 bg-[#135bec] hover:bg-[#1d66f0] text-white px-6 rounded-xl text-base font-bold transition-all shadow-lg shadow-[#135bec]/30 hover:-translate-y-0.5"
                href="/dashboard"
              >
                <BookOpen className="w-5 h-5" />
                Browse Resources
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 h-12 bg-[#1a1d24] hover:bg-[#282e39] text-white px-6 rounded-xl text-base font-medium transition-all border border-[#282e39] hover:border-[#3b4354]"
                href="/dashboard"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-8 border-t border-[#282e39]/50">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">500+</div>
                <div className="text-sm text-[#9da6b9]">Resources</div>
              </div>
              <div className="w-px h-10 bg-[#282e39]"></div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">8</div>
                <div className="text-sm text-[#9da6b9]">Semesters</div>
              </div>
              <div className="w-px h-10 bg-[#282e39]"></div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">5+</div>
                <div className="text-sm text-[#9da6b9]">Branches</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 px-4 md:px-6 bg-[#111318]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Everything You Need to <span className="text-[#135bec]">Excel</span>
              </h2>
              <p className="text-[#9da6b9] max-w-2xl mx-auto">
                A comprehensive platform designed for engineering students and faculty.
              </p>
            </div>

            <div className="grid gap-6 md:gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative bg-[#1a1d24] rounded-2xl p-6 border border-[#282e39] hover:border-[#135bec]/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#135bec]/5">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20 mb-3">
                  Students
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Access Resources</h3>
                <p className="text-sm text-[#9da6b9] leading-relaxed">
                  Start learning with our comprehensive library of engineering materials, notes, and past papers.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative bg-[#1a1d24] rounded-2xl p-6 border border-[#282e39] hover:border-[#135bec]/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#135bec]/5">
                <div className="flex size-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="inline-block rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400 border border-purple-500/20 mb-3">
                  Faculty
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Manage Content</h3>
                <p className="text-sm text-[#9da6b9] leading-relaxed">
                  Admin tools to upload, organize, and keep resources up to date and relevant for all students.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative bg-[#1a1d24] rounded-2xl p-6 border border-[#282e39] hover:border-[#135bec]/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#135bec]/5">
                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-3">
                  Secure
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Authenticated Access</h3>
                <p className="text-sm text-[#9da6b9] leading-relaxed">
                  Role-based access control ensuring the right content gets to the right people securely.
                </p>
                <div className="flex items-center gap-2 text-sm text-emerald-400 mt-3">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enterprise grade security</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 px-4 md:px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#135bec]/10 via-transparent to-purple-500/10"></div>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-[#9da6b9] mb-8">
              Join thousands of engineering students already using EngineerHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                className="inline-flex items-center justify-center gap-2 h-12 bg-[#135bec] hover:bg-[#1d66f0] text-white px-8 rounded-xl text-base font-bold transition-all shadow-lg shadow-[#135bec]/30"
                href="/signup"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 h-12 bg-transparent text-[#9da6b9] hover:text-white px-6 rounded-xl text-base font-medium transition-all"
                href="/dashboard"
              >
                Browse as Guest
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-6 border-t border-[#282e39] bg-[#111318]">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-6 items-center justify-center rounded bg-[#135bec] text-white">
              <span className="material-symbols-outlined text-[14px]">hub</span>
            </div>
            <p className="text-sm text-[#9da6b9]">
              © 2026 EngineerHub. All rights reserved.
            </p>
          </div>
          <nav className="flex gap-6">
            <Link className="text-sm text-[#9da6b9] hover:text-white transition-colors" href="#">
              Terms of Service
            </Link>
            <Link className="text-sm text-[#9da6b9] hover:text-white transition-colors" href="#">
              Privacy
            </Link>
            <Link className="text-sm text-[#9da6b9] hover:text-white transition-colors" href="#">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
