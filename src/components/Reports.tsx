import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Share2, 
  RefreshCcw,
  BookOpen,
  Mail,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Layout
} from 'lucide-react';
import { motion } from 'motion/react';
import { Asset, Member } from '../types';
import { generateInventorySummary } from '../lib/gemini';
import Markdown from 'react-markdown';

interface ReportsProps {
  assets: Asset[];
  members: Member[];
}

export default function Reports({ assets, members }: ReportsProps) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'inventory' | 'attendance'>('inventory');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const summary = await generateInventorySummary(assets);
      setReport(summary);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const attendanceStats = {
    present: members.filter(m => m.attendanceStatus === 'Present').length,
    absent: members.filter(m => m.attendanceStatus === 'Absent').length,
    onLeave: members.filter(m => m.attendanceStatus === 'On Leave').length,
    total: members.length
  };

  const exportToExcel = () => {
    const headers = ['Staff ID', 'Name', 'Position', 'Email', 'Attendance Status', 'Last Active'];
    const rows = members.map(m => [
      m.staffId,
      m.name,
      m.position,
      m.email,
      m.attendanceStatus,
      m.lastActive ? new Date(m.lastActive.toDate ? m.lastActive.toDate() : m.lastActive).toLocaleString() : 'N/A'
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_audit_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Audit & Reports</h1>
          <p className="text-sm text-gray-500">Generate formal documents for school administration.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setView('inventory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'inventory' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Inventory AI Summary
          </button>
          <button 
            onClick={() => setView('attendance')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'attendance' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Attendance Audit Sheet
          </button>
        </div>
      </div>

      {view === 'inventory' ? (
        <>
          {!report ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={40} className="animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Summary Report</h2>
              <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">
                Let Gemini analyze your current inventory health and generate a professional summary for the SDMC.
              </p>
              <button 
                onClick={handleGenerate}
                disabled={loading || assets.length === 0}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-3 mx-auto shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <RefreshCcw size={20} />
                  </motion.div>
                ) : (
                  <Zap size={20} />
                )}
                {loading ? 'Analyzing Data...' : assets.length === 0 ? 'Add Assets First' : 'Generate AI Summary'}
              </button>
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <BookOpen size={20} className="text-blue-600 mb-2" />
                  <p className="text-xs font-bold text-gray-900 uppercase">Audit Insights</p>
                  <p className="text-[10px] text-gray-500 mt-1">Understands the context of your school equipment.</p>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <TrendingUp size={20} className="text-emerald-600 mb-2" />
                  <p className="text-xs font-bold text-gray-900 uppercase">Growth Tracking</p>
                  <p className="text-[10px] text-gray-500 mt-1">Identifies trends in asset degradation or loss.</p>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <Mail size={20} className="text-amber-600 mb-2" />
                  <p className="text-xs font-bold text-gray-900 uppercase">Admin Ready</p>
                  <p className="text-[10px] text-gray-500 mt-1">Formatted perfectly for formal administrative emails.</p>
                </div>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl"
            >
              <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-widest">
                  <FileText size={16} /> Asset Audit Report
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleGenerate}
                    title="Regenerate"
                    className="p-2 text-gray-400 hover:text-blue-600 transition-all rounded-lg"
                  >
                    <RefreshCcw size={18} />
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-sm"
                  >
                    <Download size={14} /> PRINT AS PDF
                  </button>
                </div>
              </div>
              
              <div className="p-10 font-serif">
                <div className="max-w-none prose prose-slate">
                   <div className="markdown-body">
                    <Markdown>{report}</Markdown>
                   </div>
                </div>
              </div>
              
              <div className="p-8 bg-blue-50 border-t border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg">
                    <Sparkles size={16} />
                  </div>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">AI Content • Verify Before Sharing</p>
                </div>
                <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
                  <Share2 size={16} /> Share via WhatsApp
                </button>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase">Staff Attendance Audit Sheet</h2>
              <p className="text-[10px] text-gray-500 font-medium">Auto-generated audit log as of {new Date().toLocaleDateString()}</p>
            </div>
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-sm"
            >
              <Download size={14} /> EXPORT TO EXCEL
            </button>
          </div>

          <div className="p-4 grid grid-cols-3 gap-4 border-b border-gray-100">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Present</p>
                <p className="text-2xl font-bold text-emerald-700">{attendanceStats.present}</p>
              </div>
              <CheckCircle className="text-emerald-500" size={24} />
            </div>
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-red-600 uppercase">Absent</p>
                <p className="text-2xl font-bold text-red-700">{attendanceStats.absent}</p>
              </div>
              <XCircle className="text-red-500" size={24} />
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase">On Leave</p>
                <p className="text-2xl font-bold text-amber-700">{attendanceStats.onLeave}</p>
              </div>
              <Clock className="text-amber-500" size={24} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase">Staff ID</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase">Name</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase">Position</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase">Audit Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {member.staffId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{member.name}</p>
                      <p className="text-[10px] text-gray-500">{member.email}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 font-medium">{member.position}</td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        member.attendanceStatus === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                        member.attendanceStatus === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          member.attendanceStatus === 'Present' ? 'bg-emerald-500' :
                          member.attendanceStatus === 'Absent' ? 'bg-red-500' : 'bg-amber-500'
                        }`} />
                        {member.attendanceStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                        <Layout size={12} /> Verified
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {members.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-400 text-sm font-medium">
                No staff members found in the current audit register.
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
