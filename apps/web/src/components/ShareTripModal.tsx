'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Copy, Check, Calendar, Lock, Share2, QrCode as QrCodeIcon } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';

interface ShareTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: number;
    tripTitle: string;
}

const ShareTripModal: React.FC<ShareTripModalProps> = ({
    isOpen,
    onClose,
    tripId,
    tripTitle,
}) => {
    const [loading, setLoading] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showQr, setShowQr] = useState(false);

    // Form state
    const [password, setPassword] = useState('');
    const [enablePassword, setEnablePassword] = useState(false);
    const [expiryDate, setExpiryDate] = useState('');
    const [enableExpiry, setEnableExpiry] = useState(false);

    const handleCreateShareLink = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/share/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tripId,
                    password: enablePassword ? password : null,
                    expiresAt: enableExpiry ? expiryDate : null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create share link');
            }

            setShareUrl(data.shareLink.url);
            toast.success('Share link created!');
        } catch (error: any) {
            console.error('Error creating share link:', error);
            toast.error(error.message || 'Failed to create share link');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async () => {
        if (!shareUrl) return;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            toast.error('Failed to copy link');
        }
    };

    const handleReset = () => {
        setShareUrl(null);
        setPassword('');
        setEnablePassword(false);
        setExpiryDate('');
        setEnableExpiry(false);
        setShowQr(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Share: ${tripTitle}`}>
            <div className="space-y-6">
                {!shareUrl ? (
                    <>
                        {/* Create share link form */}
                        <div className="space-y-4">
                            <p className="text-sm text-text-secondary">
                                Create a shareable link for this trip. Anyone with the link will be
                                able to view (but not edit) your trip details.
                            </p>

                            {/* Password protection */}
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="enablePassword"
                                        checked={enablePassword}
                                        onChange={(e) => setEnablePassword(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="enablePassword" className="flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Password Protection
                                    </Label>
                                </div>

                                {enablePassword && (
                                    <Input
                                        type="password"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full"
                                    />
                                )}
                            </div>

                            {/* Expiry date */}
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="enableExpiry"
                                        checked={enableExpiry}
                                        onChange={(e) => setEnableExpiry(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="enableExpiry" className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Set Expiration Date
                                    </Label>
                                </div>

                                {enableExpiry && (
                                    <Input
                                        type="datetime-local"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className="w-full"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Create button */}
                        <Button
                            onClick={handleCreateShareLink}
                            disabled={loading || (enablePassword && !password)}
                            className="w-full bg-primary hover:bg-primary/90"
                        >
                            {loading ? 'Creating...' : 'Create Share Link'}
                        </Button>
                    </>
                ) : (
                    <>
                        {/* Display share link */}
                        <div className="space-y-4">
                            <p className="text-sm text-text-secondary">
                                Share this link with anyone you want to give access to this trip:
                            </p>

                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1 font-mono text-sm"
                                />
                                <Button
                                    onClick={handleCopyLink}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* QR Code toggle */}
                            <div className="flex items-center justify-between">
                                <Button
                                    onClick={() => setShowQr(!showQr)}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <QrCodeIcon className="w-4 h-4" />
                                    {showQr ? 'Hide' : 'Show'} QR Code
                                </Button>

                                <Button onClick={handleReset} variant="outline">
                                    Create New Link
                                </Button>
                            </div>

                            {/* QR Code display */}
                            {showQr && (
                                <div className="flex justify-center p-4 bg-white rounded-lg">
                                    {/* @ts-ignore */}
                                    <QRCode value={shareUrl} size={200} />
                                </div>
                            )}

                            {/* Share options info */}
                            <div className="p-4 bg-secondary/20 rounded-lg space-y-2">
                                <p className="text-sm font-semibold text-text-primary">
                                    Share Options:
                                </p>
                                {enablePassword && (
                                    <p className="text-sm text-text-secondary flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Password protected
                                    </p>
                                )}
                                {enableExpiry && (
                                    <p className="text-sm text-text-secondary flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Expires:{' '}
                                        {new Date(expiryDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                )}
                                {!enablePassword && !enableExpiry && (
                                    <p className="text-sm text-text-secondary">
                                        Public link with no restrictions
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default ShareTripModal;
