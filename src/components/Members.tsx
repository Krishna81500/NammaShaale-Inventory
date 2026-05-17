import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  BadgeCheck,
  Calendar,
  MoreVertical,
  Briefcase,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, onSnapshot, query, orderBy, updateDoc, doc, serverTimestamp, addDoc, deleteDoc } from '../lib/firebase';
import { Member, AttendanceStatus } from '../types';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [idError, setIdError] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    if (menuOpenId) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [menuOpenId]);
  const [newMember, setNewMember] = useState({
    name: '',
    staffId: '',
    position: 'Teacher',
    phoneNumber: '',
    address: '',
    email: '',
    bio: '',
    responsibilities: '',
    attendanceStatus: 'Present' as AttendanceStatus
  });

  useEffect(() => {
    const q = query(collection(db, 'members'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const memberData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Member));
      setMembers(memberData);
      setLoading(false);
    }, (error) => {
      console.error("Snapshot error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const idPattern = /^SCH-[A-Z]+-[A-Z0-9]+$/;
    if (!idPattern.test(newMember.staffId)) {
      setIdError("Format must be SCH-ROLE-ID (e.g., SCH-TCH-001)");
      return;
    }

    if (!newMember.name || !newMember.staffId) return;

    try {
      await addDoc(collection(db, 'members'), {
        ...newMember,
        lastActive: serverTimestamp()
      });
      setShowAddForm(false);
      setNewMember({
        name: '',
        staffId: '',
        position: 'Teacher',
        phoneNumber: '',
        address: '',
        email: '',
        bio: '',
        responsibilities: '',
        attendanceStatus: 'Present'
      });
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    try {
      await deleteDoc(doc(db, 'members', id));
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const seedSampleStaff = async () => {
    setSeeding(true);
    const SAMPLE_MEMBERS = [
      { name: 'Ramesh Kumar', staffId: 'SCH-TCH-001', position: 'Head Science Teacher', phoneNumber: '9876543210', address: 'Block A, Teachers Colony', email: 'ramesh.k@nammashaale.edu', attendanceStatus: 'Present', bio: 'Oversees the entire Science department and laboratory maintenance.', responsibilities: 'Lab inventory, Science kits, Microscope maintenance' },
      { name: 'Savita Devi', staffId: 'SCH-SDM-04', position: 'SDMC President', phoneNumber: '9880011223', address: 'Ward 5, Town Hall Road', email: 'savita.devi@community.org', attendanceStatus: 'Present', bio: 'Dedicated community leader focused on school infrastructure improvement.', responsibilities: 'Budget approval, SDMC liaison, Resource procurement' },
      { name: 'Anil Deshpande', staffId: 'SCH-PE-02', position: 'Physical Education Lead', phoneNumber: '9123456789', address: 'Sports Complex Staff Quarters', email: 'anil.d@nammashaale.edu', attendanceStatus: 'On Leave', bio: 'Former athlete passionate about grass-roots sports development.', responsibilities: 'Sports kit auditing, Playground equipment, Yoga sessions' },
      { name: 'Meena Reddy', staffId: 'SCH-ADMIN-01', position: 'Asset Administrator', phoneNumber: '9554433221', address: 'Administrative Block', email: 'meena.r@nammashaale.edu', attendanceStatus: 'Present', bio: 'Expert in digital record keeping and procurement logistics.', responsibilities: 'Database management, Annual auditing, IT assets' },
      { name: 'Prakash Hegde', staffId: 'SCH-TCH-102', position: 'Mathematics Teacher', phoneNumber: '9001122334', address: 'Green View Apartments, City Center', email: 'prakash.h@nammashaale.edu', attendanceStatus: 'Present', bio: 'Passionate mathematician with 15 years of teaching experience.', responsibilities: 'Math lab, Statistical reports, Exam coordination' },
      { name: 'Sushma Patil', staffId: 'SCH-LAB-01', position: 'Lab Assistant', phoneNumber: '9988776655', address: 'Old Town Square', email: 'sushma.p@nammashaale.edu', attendanceStatus: 'Absent', bio: 'Highly skilled in chemical management and spill protocols.', responsibilities: 'Chemical inventory, glassware cleaning, Lab safety checks' },
      { name: 'Govind Rao', staffId: 'SCH-SEC-01', position: 'Campus Security Lead', phoneNumber: '9776655443', address: 'School Security Cabin', email: 'govind.r@nammashaale.edu', attendanceStatus: 'Present', bio: 'Retired Army Sergeant ensuring school safety and order.', responsibilities: 'Gate passes, visitor logs, outdoor asset protection' },
    ];

    try {
      for (const member of SAMPLE_MEMBERS) {
        await addDoc(collection(db, 'members'), {
          ...member,
          lastActive: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error seeding staff:", error);
    } finally {
      setSeeding(false);
    }
  };

  const updateAttendance = async (id: string, status: AttendanceStatus) => {
    try {
      await updateDoc(doc(db, 'members', id), {
        attendanceStatus: status,
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.position?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || m.attendanceStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900">Staff & Members</h1>
          <p className="text-gray-500 mt-1">Directory of inventory managers, auditors, and staff.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['All', 'Present', 'Absent', 'On Leave'] as (AttendanceStatus | 'All')[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === status 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID, or position..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all w-64"
            />
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <UserPlus size={18} />
            Add Staff
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-blue-100 rounded-3xl p-8 shadow-xl shadow-blue-50 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UserPlus className="text-blue-600" size={24} />
                Register New Staff Member
              </h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name *</label>
                <input 
                  required
                  type="text" 
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Staff ID / Code *</label>
                <input 
                  required
                  type="text" 
                  placeholder="SCH-ROLE-001"
                  value={newMember.staffId}
                  onChange={(e) => {
                    setNewMember({...newMember, staffId: e.target.value.toUpperCase()});
                    setIdError(null);
                  }}
                  className={`w-full px-4 py-2 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    idError ? 'border-red-500 bg-red-50/10' : 'border-gray-100'
                  }`}
                />
                {idError ? (
                  <p className="text-[10px] text-red-500 font-bold animate-pulse">{idError}</p>
                ) : (
                  <p className="text-[10px] text-gray-400">Required format: SCH-ROLE-ID</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Position</label>
                <select 
                  value={newMember.position}
                  onChange={(e) => setNewMember({...newMember, position: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>Teacher</option>
                  <option>SDMC Member</option>
                  <option>Headmaster</option>
                  <option>Laboratory Asst</option>
                  <option>PE Instructor</option>
                  <option>Administrator</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</label>
                <input 
                  type="tel" 
                  value={newMember.phoneNumber}
                  onChange={(e) => setNewMember({...newMember, phoneNumber: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address</label>
                <input 
                  type="email" 
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Home Address</label>
                <input 
                  type="text" 
                  value={newMember.address}
                  onChange={(e) => setNewMember({...newMember, address: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Brief Bio</label>
                <input 
                  type="text" 
                  placeholder="e.g. 10 years experience in science education"
                  value={newMember.bio}
                  onChange={(e) => setNewMember({...newMember, bio: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Responsibilities (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Lab kits, Field equipment, Auditing"
                  value={newMember.responsibilities}
                  onChange={(e) => setNewMember({...newMember, responsibilities: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100"
                >
                  Save Member Details
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Users size={48} className="text-gray-200" />
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredMembers.map((member) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setExpandedMemberId(expandedMemberId === member.id ? null : member.id)}
                className={`bg-white rounded-3xl border transition-all flex flex-col md:flex-row gap-6 relative group cursor-pointer ${
                  expandedMemberId === member.id ? 'border-blue-200 shadow-xl p-8 z-10' : 'border-gray-100 p-6 shadow-sm hover:shadow-md'
                }`}
              >
                <div className={`${expandedMemberId === member.id ? 'w-32 h-32' : 'w-24 h-24'} rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 relative transition-all`}>
                  <span className={`${expandedMemberId === member.id ? 'text-4xl' : 'text-2xl'} font-bold`}>{member.name.charAt(0)}</span>
                  <div className={`absolute -bottom-1 -right-1 ${expandedMemberId === member.id ? 'w-8 h-8' : 'w-6 h-6'} rounded-full border-2 border-white transition-all ${
                    member.attendanceStatus === 'Present' ? 'bg-emerald-500' :
                    member.attendanceStatus === 'Absent' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`${expandedMemberId === member.id ? 'text-2xl' : 'text-xl'} font-bold text-gray-900 transition-all`}>{member.name}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                          {member.staffId}
                        </span>
                      </div>
                      <p className="text-blue-600 text-sm font-medium flex items-center gap-1">
                        <Briefcase size={14} /> {member.position}
                      </p>
                    </div>
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === member.id ? null : member.id);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50"
                      >
                        <MoreVertical size={20} />
                      </button>
                      <AnimatePresence>
                        {menuOpenId === member.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 mt-2 w-48 bg-white border border-blue-50 rounded-xl shadow-2xl z-30 py-2"
                          >
                            <div className="px-4 py-2 border-b border-gray-50 mb-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase">Staff Actions</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMember(member.id);
                                setMenuOpenId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold transition-colors"
                            >
                              <Trash2 size={16} />
                              Delete Record
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedMemberId(member.id);
                                setMenuOpenId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 font-medium transition-colors"
                            >
                              <BadgeCheck size={16} />
                              View Full Profile
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedMemberId === member.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 text-sm overflow-hidden"
                      >
                        {member.bio && (
                          <div className="space-y-2">
                             <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                              <Users size={12} className="text-gray-400" /> Biography & Background
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100 border-dashed">
                              {member.bio}
                            </p>
                          </div>
                        )}
                        {member.responsibilities && member.responsibilities.split(',').some(r => r.trim()) && (
                          <div className="space-y-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                              <BadgeCheck size={12} className="text-blue-500" /> Assigned Responsibilities
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {member.responsibilities.split(',')
                                .map(r => r.trim())
                                .filter(Boolean)
                                .map((tag, i) => (
                                  <span key={i} className="px-3 py-1.5 bg-blue-50/50 text-blue-600 rounded-xl text-[10px] font-black border border-blue-100/50 uppercase tracking-tight">
                                    {tag}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                        <div className="space-y-4 pt-4 border-t border-gray-50">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                              <Calendar size={12} className="text-blue-500" /> Attendance History (Last 30 Days)
                            </p>
                            <div className="flex gap-4">
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[8px] font-bold text-gray-400 uppercase">Present</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <span className="text-[8px] font-bold text-gray-400 uppercase">Absent</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span className="text-[8px] font-bold text-gray-400 uppercase">Leave</span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-10 gap-x-2 gap-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                            {[...Array(30)].map((_, i) => {
                              const date = new Date();
                              date.setDate(date.getDate() - (29 - i));
                              // Consistent "random" status based on member ID and date
                              const seed = (member.id.charCodeAt(0) + i) % 10;
                              const status = seed > 8 ? 'Absent' : seed > 7 ? 'On Leave' : 'Present';
                              
                              return (
                                <div key={i} className="flex flex-col items-center gap-1">
                                  <div 
                                    title={`${format(date, 'MMM dd')}: ${status}`}
                                    className={`w-3 h-3 rounded-full shadow-sm transition-all hover:scale-150 cursor-help ${
                                      status === 'Present' ? 'bg-emerald-500 shadow-emerald-100' :
                                      status === 'Absent' ? 'bg-red-500 shadow-red-100' : 'bg-amber-500 shadow-amber-100'
                                    }`} 
                                  />
                                  {i % 5 === 0 && <span className="text-[7px] font-bold text-gray-300 uppercase">{format(date, 'MMM d')}</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {member.phoneNumber}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {member.email}
                    </div>
                    {expandedMemberId === member.id && (
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <MapPin size={14} className="text-gray-400" />
                        {member.address}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Attendance</span>
                      <div className="flex bg-gray-50 p-1 rounded-lg gap-1">
                        {(['Present', 'Absent', 'On Leave'] as AttendanceStatus[]).map((status) => (
                          <button
                            key={status}
                            onClick={() => updateAttendance(member.id, status)}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                              member.attendanceStatus === status 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-400 hover:bg-white hover:text-gray-600'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Last Active</p>
                      <p className="text-xs text-gray-600 font-medium">
                        {member.lastActive ? format(new Date(member.lastActive.toDate ? member.lastActive.toDate() : member.lastActive), 'MMM dd, HH:mm') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredMembers.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center">
               <Users size={48} className="text-gray-200 mb-4" />
               <p className="text-gray-500 font-medium">No staff members found.</p>
               <button 
                 onClick={seedSampleStaff}
                 disabled={seeding}
                 className="mt-6 bg-white text-blue-600 border border-blue-200 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-blue-50 transition-all flex items-center gap-2"
               >
                 {seeding ? 'Adding Demo Staff...' : 'Populate Demo Staff Members'}
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
