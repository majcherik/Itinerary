import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="card w-full max-w-md p-6 flex flex-col gap-4 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
                >
                    <X size={20} />
                </button>

                {title && <h3 className="text-xl font-bold pr-8">{title}</h3>}

                <div className="flex flex-col gap-4">
                    {children}
                </div>

                {footer && (
                    <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-border-color">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
