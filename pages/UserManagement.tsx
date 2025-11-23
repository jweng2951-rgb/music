import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { User } from '../types';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
      username: '',
      password: '',
      ratio: '100.00'
  });

  const loadUsers = () => {
      setUsers(dataService.getUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreateModal = () => {
      setIsEditMode(false);
      setEditingUserId(null);
      setFormData({ username: '', password: '', ratio: '100.00' });
      setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
      setIsEditMode(true);
      setEditingUserId(user.id);
      setFormData({
          username: user.username,
          password: user.password || '',
          ratio: (user.revenueRatio * 100).toFixed(2)
      });
      setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (isEditMode && editingUserId) {
            // Update Existing
            dataService.updateUser(editingUserId, {
                // Username typically immutable in simple systems to avoid conflicts, but can be updated if needed.
                // Here we mainly focus on password and ratio.
                password: formData.password,
                revenueRatio: parseFloat(formData.ratio) / 100
            });
        } else {
            // Create New
            dataService.createUser({
                username: formData.username,
                password: formData.password,
                revenueRatio: parseFloat(formData.ratio) / 100
            });
        }
        loadUsers();
        setIsModalOpen(false);
    } catch (e) {
        alert("Error saving user. Username might already exist.");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this sub-account?')) {
        dataService.deleteUser(id);
        loadUsers();
    }
  };

  return (
    <div>
       <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sub-Account Management</h1>
            <p className="text-slate-400">Create and manage partner accounts.</p>
        </div>
        <button 
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition"
        >
            + Create Sub-Account
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 text-xs uppercase">
                    <th className="p-4">Username</th>
                    <th className="p-4">Password (Visible)</th>
                    <th className="p-4">Display Ratio (%)</th>
                    <th className="p-4">Created At</th>
                    <th className="p-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-4 font-bold text-white">{user.username}</td>
                        <td className="p-4 font-mono text-slate-400">{user.password}</td>
                        <td className="p-4">
                            <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-sm font-bold border border-indigo-500/30">
                                {(user.revenueRatio * 100).toFixed(2)}%
                            </span>
                        </td>
                        <td className="p-4 text-slate-500 text-sm">{user.createdAt.split('T')[0]}</td>
                        <td className="p-4 text-right space-x-2">
                            <button 
                                onClick={() => openEditModal(user)}
                                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                            >
                                Edit
                            </button>
                            <span className="text-slate-600">|</span>
                            <button 
                                onClick={() => handleDelete(user.id)}
                                className="text-red-400 hover:text-red-300 text-sm font-medium"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                {users.length === 0 && (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 italic">No sub-accounts created yet.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-lg shadow-2xl">
                  <h2 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Sub-Account' : 'New Sub-Account'}</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold mb-1 text-slate-400">Username</label>
                          <input 
                             required 
                             type="text" 
                             className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white disabled:opacity-50" 
                             value={formData.username} 
                             onChange={e => setFormData({...formData, username: e.target.value})}
                             disabled={isEditMode} // Usually better not to change usernames
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold mb-1 text-slate-400">Password</label>
                          <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white" 
                             value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-bold mb-1 text-slate-400">Revenue Display Ratio (0-100%)</label>
                          <input required type="number" step="0.01" min="0" max="100" className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white" 
                             value={formData.ratio} onChange={e => setFormData({...formData, ratio: e.target.value})} />
                          <p className="text-xs text-slate-500 mt-1">If set to 80%, user will see $80 for every $100 earned.</p>
                      </div>
                      <div className="flex gap-4 mt-8 pt-4 border-t border-slate-800">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-400 hover:text-white">Cancel</button>
                          <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded">
                              {isEditMode ? 'Save Changes' : 'Create Account'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};