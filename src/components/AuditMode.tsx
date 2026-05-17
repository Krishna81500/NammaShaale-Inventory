import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronRight, 
  ChevronLeft,
  Zap,
  Package,
  Wrench,
  AlertCircle,
  HelpCircle,
  Trophy,
  History
} from 'lucide-react';
import { db, doc, updateDoc, collection, addDoc, serverTimestamp } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Asset, AssetCondition } from '../types';

interface AuditModeProps {
  assets: Asset[];
  onComplete: () => void;
}

export default function AuditMode({ assets, onComplete }: AuditModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [auditorInfo, setAuditorInfo] = useState({
    name: '',
    phone: '',
    address: '',
    position: 'Teacher'
  });
  const [showProfileForm, setShowProfileForm] = useState(true);
  const [auditStats, setAuditStats] = useState({
    checked: 0,
    working: 0,
    needsRepair: 0,
    broken: 0
  });

  const currentAsset = assets[currentIndex];

  const handleAudit = async (condition: AssetCondition) => {
    if (!currentAsset) return;
    setLoading(true);

    try {
      // 1. Update Asset Status
      await updateDoc(doc(db, 'assets', currentAsset.id), {
        condition,
        lastCheckedAt: serverTimestamp()
      });

      // 2. Create Health Check Log
      await addDoc(collection(db, 'health_checks'), {
        assetId: currentAsset.id,
        condition,
        timestamp: serverTimestamp(),
        auditorName: auditorInfo.name,
        auditorPhone: auditorInfo.phone,
        auditorAddress: auditorInfo.address,
        auditorPosition: auditorInfo.position
      });

      // Update local stats
      setAuditStats(prev => ({
        ...prev,
        checked: prev.checked + 1,
        working: prev.working + (condition === 'Working' ? 1 : 0),
        needsRepair: prev.needsRepair + (condition === 'Needs Repair' ? 1 : 0),
        broken: prev.broken + (condition === 'Broken' ? 1 : 0)
      }));

      // Move to next or complete
      if (currentIndex < assets.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Handled below with a "Finish" screen
      }
    } catch (error) {
      console.error("Audit error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (showProfileForm) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-gray-100 shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <History size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-serif">Auditor Identity</h2>
          <p className="text-sm text-gray-500 mt-2">Please provide your details for the health check record.</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if(auditorInfo.name) setShowProfileForm(false); }}>
          <div className="bg-gray-50 p-4 rounded-2xl mb-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Quick Fill Sample Auditors</p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Ramesh Kumar', pos: 'Head Science Teacher' },
                { name: 'Savita Devi', pos: 'SDMC President' },
                { name: 'Meena Reddy', pos: 'Asset Administrator' }
              ].map(auditor => (
                <button
                  key={auditor.name}
                  type="button"
                  onClick={() => setAuditorInfo({ ...auditorInfo, name: auditor.name, position: auditor.pos })}
                  className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-xs font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all"
                >
                  {auditor.name}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Ramesh Kumar" 
              value={auditorInfo.name}
              onChange={(e) => setAuditorInfo({ ...auditorInfo, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Position / Role</label>
            <select 
              value={auditorInfo.position}
              onChange={(e) => setAuditorInfo({ ...auditorInfo, position: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option>Teacher</option>
              <option>SDMC Member</option>
              <option>Headmaster</option>
              <option>Volunteer</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
            <input 
              type="tel" 
              placeholder="10-digit mobile" 
              value={auditorInfo.phone}
              onChange={(e) => setAuditorInfo({ ...auditorInfo, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Address / Department</label>
            <input 
              type="text" 
              placeholder="e.g. Physical Ed. Dept" 
              value={auditorInfo.address}
              onChange={(e) => setAuditorInfo({ ...auditorInfo, address: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all mt-4 shadow-lg shadow-blue-100"
          >
            Start Audit Session
          </button>
          <button 
            type="button"
            onClick={onComplete}
            className="w-full py-2 text-gray-400 font-bold hover:text-gray-600 transition-all mt-2 text-sm"
          >
            Cancel
          </button>
        </form>
      </motion.div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
        <Package size={64} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">No Assets to Audit</h2>
        <p className="text-gray-500 mt-2">Add some items to the register first.</p>
        <button onClick={onComplete} className="mt-6 text-blue-600 font-bold hover:underline">Back to Dashboard</button>
      </div>
    );
  }

  const isFinished = currentIndex >= assets.length || (currentIndex === assets.length - 1 && auditStats.checked === assets.length);

  if (isFinished) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md mx-auto bg-white p-10 rounded-3xl border border-gray-100 shadow-xl text-center"
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy size={40} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 font-serif">Audit Complete!</h2>
        <p className="text-gray-500 mt-2 mb-8">You've successfully verified all school resources for this month.</p>
        
        <div className="grid grid-cols-2 gap-4 mb-10 text-left">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Verified</p>
            <p className="text-2xl font-bold text-gray-900">{auditStats.checked}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl">
            <p className="text-xs font-bold text-emerald-400 uppercase mb-1">Functional</p>
            <p className="text-2xl font-bold text-emerald-600">{auditStats.working}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl">
            <p className="text-xs font-bold text-amber-400 uppercase mb-1">Repair Needed</p>
            <p className="text-2xl font-bold text-amber-600">{auditStats.needsRepair}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-xl">
            <p className="text-xs font-bold text-red-400 uppercase mb-1">Broken</p>
            <p className="text-2xl font-bold text-red-600">{auditStats.broken}</p>
          </div>
        </div>

        <button 
          onClick={onComplete}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
        >
          Return to Dashboard
        </button>
      </motion.div>
    );
  }

  const progress = ((currentIndex + 1) / assets.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={18} className="text-yellow-500 fill-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Monthly Audit</h1>
          </div>
          <p className="text-sm text-gray-500">Quickly verify the health of each item.</p>
        </div>
        <button onClick={onComplete} className="text-sm font-bold text-gray-400 hover:text-gray-600 uppercase border-b-2 border-transparent hover:border-gray-300 transition-all">
          Exit Mode
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="bg-blue-600 h-full"
        />
      </div>

      <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
        <span>ITEM {currentIndex + 1} OF {assets.length}</span>
        <span>{Math.round(progress)}% DONE</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentAsset.id}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm"
        >
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
              {currentAsset.photoUrl ? (
                <img src={currentAsset.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <Package size={64} className="text-gray-200" />
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                  {currentAsset.category}
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">{currentAsset.name}</h2>
                <p className="text-gray-500 font-mono text-sm mt-1">SN: {currentAsset.serialNumber || 'N/A'}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                  <History size={12} /> Last Known Condition
                </p>
                <div className="flex items-center gap-2">
                   <div className={`w-3 h-3 rounded-full ${
                      currentAsset.condition === 'Working' ? 'bg-emerald-500' :
                      currentAsset.condition === 'Needs Repair' ? 'bg-amber-500' :
                      currentAsset.condition === 'Broken' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`} />
                    <p className="font-bold text-gray-700">{currentAsset.condition}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Select Current Health Status</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Working', val: 'Working' as AssetCondition, icon: CheckCircle2, color: 'emerald' },
                { label: 'Repair', val: 'Needs Repair' as AssetCondition, icon: Wrench, color: 'amber' },
                { label: 'Broken', val: 'Broken' as AssetCondition, icon: XCircle, color: 'red' },
                { label: 'Lost', val: 'Lost' as AssetCondition, icon: HelpCircle, color: 'gray' }
              ].map((btn) => (
                <button
                  key={btn.val}
                  disabled={loading}
                  onClick={() => handleAudit(btn.val)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 ${
                    loading ? 'opacity-50 grayscale cursor-not-allowed' : ''
                  } border-gray-50 hover:border-${btn.color}-200 hover:bg-${btn.color}-50/30 group`}
                >
                  <div className={`p-4 rounded-full bg-${btn.color}-50 text-${btn.color}-600 group-hover:bg-white border border-transparent shadow-sm transition-all`}>
                    <btn.icon size={28} />
                  </div>
                  <span className={`font-bold text-sm text-gray-600 transition-colors group-hover:text-${btn.color}-700`}>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between text-gray-400 px-4">
        <button 
          disabled={currentIndex === 0 || loading}
          onClick={() => setCurrentIndex(currentIndex - 1)}
          className="flex items-center gap-2 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 transition-all font-bold text-sm"
        >
          <ChevronLeft size={20} /> Previous
        </button>
        <button 
          onClick={onComplete}
          className="text-xs font-bold uppercase tracking-widest hover:text-red-500 transition-all"
        >
          Cancel Audit
        </button>
      </div>
    </div>
  );
}
