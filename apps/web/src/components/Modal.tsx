import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useScrollLock, useMediaQuery } from '@itinerary/shared';
import { Drawer } from 'vaul';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    useScrollLock(isOpen && isDesktop);

    if (isDesktop) {
        if (!isOpen) return null;

        // Use createPortal to render the modal at the end of the document body
        // This ensures it sits on top of all other content and escapes any stacking contexts
        return createPortal(
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] animate-fade-in p-4 sm:p-6">
                <div className="card w-full max-w-md p-6 flex flex-col gap-4 relative max-h-[85vh] overflow-y-auto shadow-2xl">
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
            </div>,
            document.body
        );
    }

    return (
        // @ts-ignore
        <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            {/* @ts-ignore */}
            <Drawer.Portal>
                {/* @ts-ignore */}
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
                {/* @ts-ignore */}
                <Drawer.Content className="bg-bg-card flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0 z-[100] max-h-[96vh] outline-none">
                    <div className="p-4 rounded-t-[10px] flex-1 overflow-y-auto">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                        <div className="max-w-md mx-auto">
                            {/* @ts-ignore */}
                            {title && <Drawer.Title className="font-bold text-xl mb-4">{title}</Drawer.Title>}
                            <div className="flex flex-col gap-4">
                                {children}
                            </div>
                            {footer && (
                                <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-border-color">
                                    {footer}
                                </div>
                            )}
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};

export default Modal;
