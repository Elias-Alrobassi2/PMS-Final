
import React, { useState, useContext, useMemo } from 'react';
// FIX: Corrected import paths
import { AppContext } from '../context/AppContext';
import { User, Role, UserStatus, Permission } from '../types';
import { PlusIcon, EditIcon, TrashIcon, UserCheckIcon, UserXIcon, UsersIcon, ShieldCheckIcon } from './Icons';
import UserModal from './UserModal';
import { format } from 'date-fns';
import { checkPermission, ROLES_HIERARCHY, permissionDescriptions } from '../utils/permissions';
import toast from 'react-hot-toast';

const roleMap: Record<Role, { label: string; color: string }> = {
    admin: { label: 'مدير', color: 'bg-red-500' },
    manager: { label: 'مشرف', color: 'bg-yellow-500' },
    user: { label: 'مستخدم', color: 'bg-blue-500' },
    viewer: { label: 'مشاهد', color: 'bg-gray-500' },
};

const statusMap: Record<UserStatus, { label: string; icon: React.ReactNode }> = {
    active: { label: 'نشط', icon: <UserCheckIcon className="text-green-500" /> },
    suspended: { label: 'موقوف', icon: <UserXIcon className="text-red-500" /> },
};


const RolesEditor: React.FC = () => {
    const { permissions, updatePermission, currentUser } = useContext(AppContext);
    
    const handlePermissionChange = (role: Role, permission: Permission, granted: boolean) => {
        updatePermission(role, permission, granted);
    };

    const allPermissions = Object.keys(permissionDescriptions).sort() as Permission[];
    const currentUserRoleIndex = currentUser ? ROLES_HIERARCHY.indexOf(currentUser.role) : -1;

    return (
        <div className="space-y-6">
            {ROLES_HIERARCHY.map(role => {
                const targetRoleIndex = ROLES_HIERARCHY.indexOf(role);
                const canEditRole = currentUserRoleIndex <= targetRoleIndex;

                return (
                    <div key={role} className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${!canEditRole ? 'opacity-70' : ''}`}>
                        <div className="flex items-center gap-3 mb-4 border-b dark:border-gray-700 pb-3">
                            <span className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${roleMap[role].color}`}>
                                {roleMap[role].label}
                            </span>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {!canEditRole && '(لا يمكنك تعديل دور أعلى من دورك)'}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                            {allPermissions.map(perm => {
                                const isChecked = new Set(permissions[role] || []).has(perm);
                                return (
                                <label key={perm} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-accent-blue focus:ring-accent-blue disabled:opacity-50"
                                        checked={isChecked}
                                        onChange={(e) => handlePermissionChange(role, perm, e.target.checked)}
                                        disabled={!canEditRole}
                                    />
                                    <span>{permissionDescriptions[perm] || perm}</span>
                                </label>
                                );
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};


const Users: React.FC = () => {
    const { users, deleteUser, deleteUsers, updateUsersStatus, currentUser, permissions } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const canCreate = checkPermission(currentUser, 'users:create', permissions);
    const canEdit = checkPermission(currentUser, 'users:edit', permissions);
    const canDelete = checkPermission(currentUser, 'users:delete', permissions);

    const filteredUsers = useMemo(() => {
        return users
            .filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(user => roleFilter === 'all' || user.role === roleFilter)
            .filter(user => statusFilter === 'all' || user.status === statusFilter);
    }, [users, searchTerm, roleFilter, statusFilter]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredUsers.map(u => u.id));
        } else {
            setSelectedIds([]);
        }
    };
    
    const handleSelectOne = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const openModal = (mode: 'add' | 'edit', user?: User) => {
        setModalMode(mode);
        setSelectedUser(user || null);
        setIsModalOpen(true);
    };

    const handleDelete = (user: User) => {
        if (user.id === currentUser?.id) {
            toast.error("لا يمكنك حذف حسابك الخاص.");
            return;
        }
        if (window.confirm(`هل أنت متأكد من حذف المستخدم ${user.name}؟`)) {
            deleteUser(user.id);
        }
    };

    const handleBulkDelete = () => {
        if(selectedIds.length === 0) return;
        if(selectedIds.includes(currentUser?.id || '')) {
            toast.error("لا يمكنك حذف حسابك الخاص ضمن عملية الحذف الجماعي.");
            return;
        }
        if(window.confirm(`هل أنت متأكد من حذف ${selectedIds.length} مستخدمين؟`)) {
            deleteUsers(selectedIds);
            setSelectedIds([]);
        }
    }
    
    const handleBulkStatusChange = (status: UserStatus) => {
         if(selectedIds.length === 0) return;
         updateUsersStatus(selectedIds, status);
         setSelectedIds([]);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">إدارة الوصول</h1>
                {activeTab === 'users' && canCreate && (
                    <button onClick={() => openModal('add')} className="flex items-center justify-center gap-2 bg-accent-blue text-white p-2 px-4 rounded-md hover:bg-blue-700">
                        <PlusIcon /> إضافة مستخدم
                    </button>
                )}
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6 space-x-reverse">
                    <button onClick={() => setActiveTab('users')} className={`py-4 px-1 inline-flex items-center gap-2 text-sm font-medium whitespace-nowrap ${activeTab === 'users' ? 'border-accent-blue text-accent-blue border-b-2' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                        <UsersIcon/> المستخدمون
                    </button>
                    <button onClick={() => setActiveTab('roles')} className={`py-4 px-1 inline-flex items-center gap-2 text-sm font-medium whitespace-nowrap ${activeTab === 'roles' ? 'border-accent-blue text-accent-blue border-b-2' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                        <ShieldCheckIcon /> الأدوار والصلاحيات
                    </button>
                </nav>
            </div>

            {activeTab === 'users' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="ابحث بالاسم أو البريد الإلكتروني..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 md:col-span-1"/>
                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as Role | 'all')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option value="all">كل الأدوار</option>
                            {Object.entries(roleMap).map(([key, {label}]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as UserStatus | 'all')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option value="all">كل الحالات</option>
                            {Object.entries(statusMap).map(([key, {label}]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                    </div>
                    
                    {selectedIds.length > 0 && canEdit && (
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg flex items-center justify-between gap-4">
                            <span className="font-semibold">{selectedIds.length} مستخدمين محددين</span>
                            <div className="flex gap-2">
                                <button onClick={() => handleBulkStatusChange('active')} className="bg-green-500 text-white px-3 py-1 text-sm rounded-md">تفعيل</button>
                                <button onClick={() => handleBulkStatusChange('suspended')} className="bg-yellow-500 text-white px-3 py-1 text-sm rounded-md">إيقاف</button>
                                {canDelete && <button onClick={handleBulkDelete} className="bg-red-500 text-white px-3 py-1 text-sm rounded-md">حذف</button>}
                            </div>
                        </div>
                    )}

                    {filteredUsers.length > 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto custom-scrollbar">
                            <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        {canEdit && <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0} className="rounded" /></th>}
                                        <th scope="col" className="px-6 py-3">المستخدم</th>
                                        <th scope="col" className="px-6 py-3">الدور</th>
                                        <th scope="col" className="px-6 py-3">الحالة</th>
                                        <th scope="col" className="px-6 py-3">تاريخ الإنشاء</th>
                                        {(canEdit || canDelete) && <th scope="col" className="px-6 py-3 text-center">إجراءات</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className={`bg-white dark:bg-gray-800 border-b dark:border-gray-700 ${selectedIds.includes(user.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-600'}`}>
                                            {canEdit && <td className="p-4"><input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => handleSelectOne(user.id)} className="rounded" /></td>}
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-accent-blue font-bold">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div>{user.name}</div>
                                                        <div className="text-xs text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </th>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${roleMap[user.role].color}`}>
                                                    {roleMap[user.role].label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {statusMap[user.status].icon}
                                                    <span>{statusMap[user.status].label}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {format(new Date(user.createdAt), 'yyyy/MM/dd')}
                                            </td>
                                            {(canEdit || canDelete) && (
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {canEdit && <button onClick={() => openModal('edit', user)} className="p-2 text-gray-500 hover:text-accent-blue" title="تعديل"><EditIcon /></button>}
                                                        {canDelete && <button onClick={() => handleDelete(user)} className="p-2 text-red-500 hover:text-red-700" title="حذف"><TrashIcon /></button>}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <UsersIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold">لا يوجد مستخدمون</h2>
                            <p className="text-gray-500 mt-2">ابدأ بإضافة مستخدم جديد أو قم بتعديل فلاتر البحث.</p>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'roles' && <RolesEditor />}

            {isModalOpen && (
                <UserModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    mode={modalMode}
                    user={selectedUser}
                />
            )}
        </div>
    );
};

export default Users;
