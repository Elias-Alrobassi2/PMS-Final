
import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ActivityIcon, UsersIcon } from './Icons';

const Activity: React.FC = () => {
    const { activityLog, users } = useContext(AppContext);
    const [filterUser, setFilterUser] = useState<string>('all');

    const filteredLogs = useMemo(() => {
        if (filterUser === 'all') {
            return activityLog;
        }
        return activityLog.filter(log => log.userId === filterUser);
    }, [activityLog, filterUser]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold flex items-center gap-2"><ActivityIcon /> سجل النشاط</h1>
                <div className="w-full md:w-auto md:max-w-xs">
                    <select 
                        value={filterUser} 
                        onChange={e => setFilterUser(e.target.value)} 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="all">كل المستخدمين</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredLogs.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">المستخدم</th>
                                    <th scope="col" className="px-6 py-3">الإجراء</th>
                                    <th scope="col" className="px-6 py-3">الوقت</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {log.userName}
                                        </th>
                                        <td className="px-6 py-4">
                                            {log.action}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap" title={format(new Date(log.timestamp), 'yyyy/MM/dd HH:mm:ss')}>
                                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: ar })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <UsersIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto" />
                    <h2 className="mt-4 text-xl font-semibold">لا توجد سجلات نشاط</h2>
                    <p className="text-gray-500 mt-2">لم يتم تسجيل أي نشاط حتى الآن أو أن الفلتر لا يطابق أي نتائج.</p>
                </div>
            )}
        </div>
    );
};

export default Activity;
