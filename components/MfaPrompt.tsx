
import React from 'react';

const MfaPrompt: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4">MFA Prompt</h3>
                <p>MFA prompt functionality would be here.</p>
            </div>
        </div>
    );
};

export default MfaPrompt;
