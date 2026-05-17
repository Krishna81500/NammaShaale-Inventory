import React from 'react';
import { 
  Package, 
  MoreVertical, 
  MapPin, 
  Search, 
  Filter,
  AlertTriangle,
  History,
  Wrench
} from 'lucide-react';
import { Asset } from '../types';
import { format } from 'date-fns';
import { db, collection, addDoc, serverTimestamp } from '../lib/firebase';
import { motion } from 'motion/react';

interface AssetListProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
}

export default function AssetList({ assets, onEdit }: AssetListProps) {
  const [seeding, setSeeding] = React.useState(false);

  const seedSampleAssets = async () => {
    setSeeding(true);
    const SAMPLE_ASSETS = [
      { name: 'Science Lab Microscope X1', category: 'Lab', condition: 'Working', serialNumber: 'LAB-MIC-001', description: 'Nikon Eclipse E100', repairHint: 'None', estimatedRepairCost: 0 },
      { name: 'First Aid Medical Kit A', category: 'Medical', condition: 'Needs Repair', serialNumber: 'MED-KIT-01', description: 'Emergency trauma response kit', repairHint: 'Restock consumed bandages and antiseptics', estimatedRepairCost: 450 },
      { name: 'Professional Football (Leather)', category: 'Sports', condition: 'Working', serialNumber: 'SPT-FB-42', description: 'Nivia FIFA Pro', repairHint: 'Inflate regularly', estimatedRepairCost: 0 },
      { name: 'Chemistry Beaker Set (50ml-500ml)', category: 'Lab', condition: 'Needs Repair', serialNumber: 'LAB-BKR-09', description: 'Glassware set, one 250ml glass chipped', repairHint: 'Replace chipped 250ml beaker', estimatedRepairCost: 150 },
      { name: 'Digital BP Monitor', category: 'Medical', condition: 'Working', serialNumber: 'MED-BP-05', description: 'OMRON Automatic blood pressure monitor', repairHint: 'Check batteries every 6 months', estimatedRepairCost: 0 },
      { name: 'Educational Tablet (10-inch)', category: 'IT', condition: 'Broken', serialNumber: 'IT-TAB-104', description: 'Screen cracked during class', repairHint: 'Screen replacement required at service center', estimatedRepairCost: 2800 },
      { name: 'Projector (Classroom 3)', category: 'IT', condition: 'Needs Repair', serialNumber: 'IT-PRJ-012', description: 'Epson LCD Projector', repairHint: 'Lamp needs replacement', estimatedRepairCost: 4500 },
      { name: 'Cricket Bat (English Willow)', category: 'Sports', condition: 'Working', serialNumber: 'SPT-BAT-10', description: 'Grade A Willow Bat', repairHint: 'Needs oiling every season', estimatedRepairCost: 0 },
      { name: 'Classroom Benches (Set of 10)', category: 'Furniture', condition: 'Working', serialNumber: 'FUR-BNCH-05', description: 'High-quality teak wood benches', repairHint: 'Varnish to maintain shine', estimatedRepairCost: 0 },
      { name: 'Library Rack (Metal)', category: 'Furniture', condition: 'Needs Repair', serialNumber: 'FUR-RCK-02', description: '5-shelf heavy duty rack', repairHint: 'Tighten loose screws on 3rd shelf', estimatedRepairCost: 200 },
    ];

    try {
      for (const item of SAMPLE_ASSETS) {
        await addDoc(collection(db, 'assets'), {
          ...item,
          addedAt: serverTimestamp(),
          lastCheckedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error seeding assets:", error);
    } finally {
      setSeeding(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Asset Register</h1>
          <p className="text-sm text-gray-500">Track and manage all school equipment.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all flex items-center gap-2 text-sm font-medium">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Asset Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Condition</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Audit</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assets.length > 0 ? (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                          {asset.photoUrl ? (
                            <img src={asset.photoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package size={18} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{asset.name}</p>
                          <p className="text-xs text-gray-500 font-mono uppercase tracking-tight mb-1">#{asset.serialNumber || 'SN-UNKNOWN'}</p>
                          {asset.condition !== 'Working' && asset.condition !== 'Lost' && (
                            <div className="flex flex-col gap-1 mt-1">
                              {asset.repairHint && (
                                <p className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 w-fit flex items-center gap-1">
                                  <Wrench size={10} /> {asset.repairHint}
                                </p>
                              )}
                              {asset.estimatedRepairCost && asset.estimatedRepairCost > 0 && (
                                <p className="text-[10px] text-gray-500 font-bold">
                                  EST. COST: ₹{asset.estimatedRepairCost}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        {asset.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          asset.condition === 'Working' ? 'bg-emerald-500' :
                          asset.condition === 'Needs Repair' ? 'bg-amber-500' :
                          asset.condition === 'Broken' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`} />
                        <span className="text-sm font-medium text-gray-700">{asset.condition}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm text-gray-700">
                          {asset.lastCheckedAt ? format(new Date(asset.lastCheckedAt.toDate ? asset.lastCheckedAt.toDate() : asset.lastCheckedAt), 'MMM dd, yyyy') : 'Never'}
                        </p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 uppercase tracking-wider font-bold">
                          <History size={10} />
                          Check-up
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onEdit(asset)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <Package size={48} className="text-gray-100 mb-4" />
                      <p className="text-gray-500 font-medium mb-4">No items found matching your criteria.</p>
                      <button 
                        onClick={seedSampleAssets}
                        disabled={seeding}
                        className="bg-white text-blue-600 border border-blue-200 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-blue-50 transition-all flex items-center gap-2"
                      >
                        {seeding ? 'Adding Demo Assets...' : 'Populate Demo Assets'}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
