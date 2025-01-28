import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { ChatInterface } from './components/ChatInterface';
import { TransactionList } from './components/TransactionList';
import { Transaction } from './types';
import { supabase } from './lib/supabase';
import { Wallet } from 'lucide-react';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      const fetchTransactions = async () => {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          toast.error('Failed to load transactions');
          return;
        }

        setTransactions(data || []);
      };

      fetchTransactions();
    }
  }, [session]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningUp(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Welcome! Please check your email to confirm your account', {
        icon: '✉️',
        duration: 5000,
        style: {
          background: '#3b82f6',
          color: 'white',
        },
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account', {
        icon: '❌', 
        duration: 4000,
        style: {
          background: '#ef4444',
          color: 'white',
        },
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Welcome back!', {
        icon: '👋',
        duration: 3000,
        style: {
          background: '#22c55e',
          color: 'white',
        },
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in', {
        icon: '❌',
        duration: 4000,
        style: {
          background: '#ef4444',
          color: 'white',
        },
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      setTransactions([]);
    }
  };

  const handleTransactionAdd = async (
    transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>
  ) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) {
      toast.error('Failed to add transaction');
      return;
    }

    setTransactions([data, ...transactions]);
    toast.success(
      `${transaction.type === 'income' ? 'Income' : 'Expense'} added successfully`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <Wallet className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">AI Expense Tracker</h1>
          </div>
          
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSigningIn}
                className={`flex-1 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  disabled:opacity-70 disabled:cursor-not-allowed
                  transition duration-200 ease-in-out transform hover:scale-102
                  ${isSigningIn ? 'animate-pulse' : ''}`}
              >
                {isSigningIn ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleSignUp}
                disabled={isSigningUp}
                className={`flex-1 bg-gray-50 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-100
                  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                  disabled:opacity-70 disabled:cursor-not-allowed
                  transition duration-200 ease-in-out transform hover:scale-102
                  ${isSigningUp ? 'animate-pulse' : ''}`}
              >
                {isSigningUp ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">AI Expense Tracker</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <ChatInterface onTransactionAdd={handleTransactionAdd} />
        <TransactionList transactions={transactions} />
      </main>
    </div>
  );
}

export default App;