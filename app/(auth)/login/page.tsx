import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-md border border-green-500/30 rounded-2xl p-8 shadow-2xl shadow-green-900/20">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 flex items-center justify-center mb-4 overflow-hidden rounded-xl shadow-md border border-green-500/50">
            <img src="/logo.png" alt="Deck Assemble Logo" width={64} height={64} className="object-cover" />
          </div>
          <h1 className="text-3xl font-extrabold text-white text-center">Welcome Back</h1>
          <p className="text-zinc-400 text-center mt-2">Log in to your Deck Assemble account</p>
        </div>

        <a
          href="/auth/login"
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2 group"
        >
          Log In
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>

        <div className="mt-8 text-center text-zinc-500 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
