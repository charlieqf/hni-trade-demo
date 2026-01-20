import React, { useEffect } from 'react';
import useTradeStore from '../store/useTradeStore';
import { Bell, CheckCircle2, X } from 'lucide-react';

const NotificationCenter = () => {
    const { notifications, removeNotification } = useTradeStore();

    // Auto-dismiss logic
    useEffect(() => {
        if (notifications.length > 0) {
            const timer = setTimeout(() => {
                // Remove the oldest notification
                const oldest = notifications[0];
                if (oldest) removeNotification(oldest.id);
            }, 5000); // 5 seconds display
            return () => clearTimeout(timer);
        }
    }, [notifications, removeNotification]);

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-20 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            {notifications.map((note) => (
                <div
                    key={note.id}
                    className="pointer-events-auto bg-trade-card border border-trade-green/50 text-white p-4 rounded-lg shadow-2xl flex items-start gap-3 w-80 animate-in slide-in-from-right fade-in duration-300"
                >
                    <div className="mt-1 p-1 bg-trade-green/20 rounded-full text-trade-green">
                        <CheckCircle2 size={16} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-trade-green flex justify-between items-center">
                            {note.title}
                            <button
                                onClick={() => removeNotification(note.id)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </h4>
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                            {note.message}
                        </p>
                        <div className="text-[9px] text-gray-500 mt-2 font-mono uppercase">
                            ID: {note.id} • {new Date(note.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationCenter;
