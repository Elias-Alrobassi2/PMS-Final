
import React from 'react';
import Modal from './Modal';

interface MfaSetupModalProps {
    onClose: () => void;
}

const MfaSetupModal: React.FC<MfaSetupModalProps> = ({ onClose }) => {
    return (
        <Modal title="إعداد المصادقة الثنائية" isOpen={true} onClose={onClose}>
            <div className="text-center">
                <p>سيتم عرض رمز الاستجابة السريعة (QR Code) وتعليمات الإعداد هنا.</p>
                 <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 p-2 px-4 rounded-md">إغلاق</button>
                </div>
            </div>
        </Modal>
    );
};

export default MfaSetupModal;
