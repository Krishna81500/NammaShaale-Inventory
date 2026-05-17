/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  auth, 
  signInWithPopup, 
  googleProvider,
  User,
  db,
  collection,
  onSnapshot,
  query,
  orderBy
} from './lib/firebase';
import { 
  LayoutDashboard, 
  Package, 
  CheckCircle2, 
  FileText, 
  LogOut, 
  Plus, 
  AlertCircle,
  School,
  Search,
  Filter,
  ArrowRight,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import AssetList from './components/AssetList';
import AssetForm from './components/AssetForm';
import AuditMode from './components/AuditMode';
import Reports from './components/Reports';
import Members from './components/Members';
import { Asset, Member, HealthCheck } from './types';

type View = 'dashboard' | 'assets' | 'audit' | 'reports' | 'add' | 'members';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'assets'), orderBy('addedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const assetData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Asset));
      setAssets(assetData);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, 'members'), (snapshot) => {
      const memberData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Member));
      setMembers(memberData);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'health_checks'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const checkData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HealthCheck));
      setHealthChecks(checkData);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => auth.signOut();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="text-blue-600"
        >
          <School size={48} />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="bg-blue-600 text-white p-4 rounded-3xl inline-block mb-6 shadow-xl">
            <School size={64} />
          </div>
          <h1 className="text-4xl font-bold font-serif mb-4 text-gray-900 leading-tight">
            Namma-Shaale <br/><span className="text-blue-600">Inventory</span>
          </h1>
          <p className="text-gray-600 mb-10 text-lg">
            Empowering schools to better manage their laboratory, sports, and technical assets with digital audits.
          </p>
          <button 
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 mr-2" />
            Sign in with School Google Account
          </button>
          <p className="mt-6 text-sm text-gray-400">
            For teachers and administrative staff only.
          </p>
        </motion.div>
      </div>
    );
  }

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: assets.length,
    needsRepair: assets.filter(a => a.condition === 'Needs Repair').length,
    broken: assets.filter(a => a.condition === 'Broken').length,
    working: assets.filter(a => a.condition === 'Working').length,
    membersCount: members.length
  };

  return (
    <div className="flex min-h-screen bg-gray-50 print:bg-white print:block">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex no-print">
        <div className="p-6 border-bottom">
          <div className="flex items-center gap-3 text-blue-600 font-bold text-xl font-serif">
            <School size={32} />
            <span>Namma-Shaale</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 mt-4">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'assets', icon: Package, label: 'Asset Register' },
            { id: 'members', icon: Users, label: 'Members & Staff' },
            { id: 'audit', icon: CheckCircle2, label: 'Monthly Audit' },
            { id: 'reports', icon: FileText, label: 'Summary Reports' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                currentView === item.id 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
              alt={user.displayName || 'User'} 
              className="w-10 h-10 rounded-full border border-gray-100"
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 no-print">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search assets (e.g. Football, Computer)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div className="md:hidden flex items-center gap-2 text-blue-600 font-bold">
              <School size={24} />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentView('add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all shadow-blue-100 active:scale-95"
            >
              <Plus size={18} />
              New Asset
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'dashboard' && (
                <Dashboard stats={stats} assets={assets} healthChecks={healthChecks} onNavigate={setCurrentView} />
              )}
              {currentView === 'assets' && (
                <AssetList assets={filteredAssets} onEdit={(asset) => { /* TODO: Open edit modal */ }} />
              )}
              {currentView === 'audit' && (
                <AuditMode assets={assets} onComplete={() => setCurrentView('dashboard')} />
              )}
              {currentView === 'reports' && (
                <Reports assets={assets} members={members} />
              )}
              {currentView === 'members' && (
                <Members />
              )}
              {currentView === 'add' && (
                <AssetForm onCancel={() => setCurrentView('dashboard')} onSave={() => setCurrentView('assets')} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Mobile Nav */}
        <div className="md:hidden h-16 bg-white border-t border-gray-200 flex items-center justify-around px-4 shrink-0">
          {[
            { id: 'dashboard', icon: LayoutDashboard },
            { id: 'assets', icon: Package },
            { id: 'members', icon: Users },
            { id: 'audit', icon: CheckCircle2 },
            { id: 'reports', icon: FileText },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`p-2 rounded-lg ${currentView === item.id ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
            >
              <item.icon size={24} />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
