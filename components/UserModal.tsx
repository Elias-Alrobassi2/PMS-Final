
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { User, Role } from '../types';
import { ROLES_HIERARCHY } from '../utils/permissions';
import Modal from './Modal';
import toast from 'react-hot-toast';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  user: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, mode, user }) => {
  const { addUser, updateUser, currentUser } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer' as Role,
    password: '',
  });
  
  const availableRoles = ROLES_HIERARCHY.filter(role => {
      // Admins can assign any role. Managers can assign roles below them.
      if (currentUser?.role === 'admin') return true;
      if (currentUser?.role === 'manager') return role !== 'admin';
      return false;
  });

  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '', // Password is not edited here, but can be reset
      });
    } else {
      setFormData({ name: '', email: '', role: 'viewer', password: '' });
    }
  }, [user, mode, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
        toast.error('الاسم والبريد الإلكتروني حقول إلزامية.');
        return;
    }
    if (mode === 'add' && !formData.password) {
        toast.error('كلمة المرور مطلوبة عند إضافة مستخدم جديد.');
        return;
    }

    try {
        if (mode === 'edit' && user) {
            const updatedUser: User = { 
                ...user, 
                name: formData.name, 
                email: formData.email, 
                role: formData.role
            };
            if(formData.password){
                updatedUser.passwordHash = formData.password;
                toast.success("تم تحديث المستخدم وكلمة المرور.");
            }
            updateUser(updatedUser);
        } else {
            addUser({
                name: formData.name,
                email: formData.email,
                role: formData.role,
                password: formData.password,
                status: 'active'
            });
        }
        onClose();
    } catch (error) {
        if(error instanceof Error) {
            toast.error(error.message);
        }
    }
  };

  const title = mode === 'add' ? 'إضافة مستخدم جديد' : 'تعديل المستخدم';

  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">الدور</label>
          <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
            {availableRoles.map(role => (
              <option key={role} value={role}>{roleMap[role].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">كلمة المرور</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" placeholder={mode === 'edit' ? 'اتركه فارغاً لعدم التغيير' : ''} required={mode === 'add'} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 p-2 px-4 rounded-md">إلغاء</button>
          <button type="submit" className="bg-accent-blue text-white p-2 px-4 rounded-md">حفظ</button>
        </div>
      </form>
    </Modal>
  );
};

const roleMap: Record<Role, { label: string }> = {
    admin: { label: 'مدير' },
    manager: { label: 'مشرف' },
    user: { label: 'مستخدم' },
    viewer: { label: 'مشاهد' },
};

export default UserModal;
