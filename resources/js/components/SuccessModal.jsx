import React, { useEffect } from 'react';

const SuccessModal = ({ show, message, onClose, isDarkMode = false }) => {
    useEffect(() => {
        if (show) {
            // Auto close after 3 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
            <div className="pointer-events-auto animate-bounce-in">
                <div className={`${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } rounded-2xl shadow-2xl border-2 p-6 max-w-sm mx-4 transform transition-all`}>
                    {/* Success Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-scale-in">
                                <svg 
                                    className="w-12 h-12 text-white animate-check-draw" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={3} 
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            {/* Ripple effect */}
                            <div className="absolute inset-0 bg-green-400 rounded-full animate-ripple opacity-0"></div>
                        </div>
                    </div>

                    {/* Success Title */}
                    <h3 className={`text-2xl font-bold text-center mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                        Berhasil! 🎉
                    </h3>

                    {/* Message */}
                    <p className={`text-center mb-4 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        {message}
                    </p>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;
