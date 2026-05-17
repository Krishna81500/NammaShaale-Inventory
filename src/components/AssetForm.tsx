import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  Save, 
  AlertCircle,
  Package,
  Hash,
  Tag,
  Info,
  Wrench,
  Banknote
} from 'lucide-react';
import { db, collection, addDoc, serverTimestamp } from '../lib/firebase';
import { motion } from 'motion/react';
import { AssetCategory, AssetCondition } from '../types';

interface AssetFormProps {
  onCancel: () => void;
  onSave: () => void;
}

export default function AssetForm({ onCancel, onSave }: AssetFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sports' as AssetCategory,
    serialNumber: '',
    condition: 'Working' as AssetCondition,
    description: '',
    photoUrl: '',
    repairHint: '',
    estimatedRepairCost: 0
  });

  const categories: AssetCategory[] = ["Sports", "Lab", "IT", "Classroom", "Furniture", "Medical", "Other"];
  const conditions: AssetCondition[] = ["Working", "Needs Repair", "Broken", "Lost"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'assets'), {
        ...formData,
        addedAt: serverTimestamp(),
        lastCheckedAt: serverTimestamp(),
      });
      onSave();
    } catch (error) {
      console.error("Error adding asset:", error);
      alert("Failed to save asset. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Register New Asset</h1>
          <p className="text-sm text-gray-500">Carefully catalog every school resource.</p>
        </div>
        <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
              <Package size={14} /> Item Name
            </label>
            <input 
              required
              type="text" 
              placeholder="e.g. Science Lab Microscope"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                <Tag size={14} /> Category
              </label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                <Hash size={14} /> Serial Number
              </label>
              <input 
                type="text" 
                placeholder="Unique ID or Tag"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
              Condition Overview
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {conditions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, condition: c })}
                  className={`px-3 py-3 rounded-xl text-xs font-bold border transition-all ${
                    formData.condition === c 
                    ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' 
                    : 'border-gray-100 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
              <Info size={14} /> Additional Description
            </label>
            <textarea 
              rows={2}
              placeholder="Provide more context about the item's location or usage..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                <Wrench size={14} /> Repair Hint (Method)
              </label>
              <input 
                type="text" 
                placeholder="e.g. Replace batteries, patch leather"
                value={formData.repairHint}
                onChange={(e) => setFormData({ ...formData, repairHint: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                <Banknote size={14} /> Estimated Cost (₹)
              </label>
              <input 
                type="number" 
                placeholder="e.g. 500"
                value={formData.estimatedRepairCost}
                onChange={(e) => setFormData({ ...formData, estimatedRepairCost: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
              <Camera size={14} /> Evidence Photo URL
            </label>
            <input 
              type="url" 
              placeholder="Link to item photo..."
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <p className="text-[10px] text-gray-400">High-value items must have a photo attached.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 px-6 border border-gray-200 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Save size={20} />
              </motion.div>
            ) : (
              <><Save size={20} /> Register Item</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
