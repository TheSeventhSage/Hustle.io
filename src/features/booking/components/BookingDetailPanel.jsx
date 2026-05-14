import { useState } from 'react';
import { MapPin, Calendar, Clock, MessageCircle, FileText, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import Image from '../../../shared/components/Image';
import { Button } from '../../../shared/components/Button';
import { useConfirmBooking, useCancelBooking, useInitializePayment, useVerifyPayment } from '../booking.hooks';
import useAuthStore from '../../auth/auth.store';
import { initializePaystackPayment } from '../../../shared/utils/paystack';

export function BookingDetailPanel({ booking }) {
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const user = useAuthStore((s) => s.user);
    const isClient = user?.role === 'client' || user?.role === 'company';
    const isArtisan = user?.role === 'artisan';

    const dateObj = new Date(booking.schedule_date);

    const confirmMutation = useConfirmBooking();
    const cancelMutation = useCancelBooking();
    const initializePaymentMutation = useInitializePayment();
    const verifyPaymentMutation = useVerifyPayment();

    const handleAccept = () => {
        confirmMutation.mutate(booking.id);
    };

    const handleDecline = () => {
        setShowRejectModal(true);
    };

    const handleConfirmReject = () => {
        cancelMutation.mutate(
            { id: booking.id, reason: rejectReason || 'No reason provided' },
            {
                onSuccess: () => {
                    setShowRejectModal(false);
                    setRejectReason('');
                }
            }
        );
    };

    const handlePayment = async () => {
        setIsPaymentProcessing(true);

        try {
            // Initialize payment from backend
            const response = await initializePaymentMutation.mutateAsync({ id: booking.id, data: {} });
            const paymentData = response?.data?.data || response?.data;
            const status = String(paymentData?.payment_status ?? paymentData?.status ?? '').toLowerCase();

            if (['approved', 'paid', 'success'].includes(status)) {
                setIsPaymentProcessing(false);
                return;
            }

            if (!paymentData?.authorization_url) {
                throw new Error('Payment initialization failed');
            }

            // Open Paystack inline popup
            await initializePaystackPayment({
                authorization_url: paymentData.authorization_url,
                reference: paymentData.reference,
                onSuccess: async (reference) => {
                    // Verify payment from backend
                    await verifyPaymentMutation.mutateAsync(reference.reference);
                    setIsPaymentProcessing(false);
                },
                onClose: () => {
                    setIsPaymentProcessing(false);
                },
            });
        } catch (error) {
            console.error('Payment error:', error);
            setIsPaymentProcessing(false);
        }
    };

    // Determine booking status display
    const getStatusDisplay = () => {
        switch (booking.status) {
            case 'pending':
                return { text: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-50' };
            case 'awaiting_payment':
                return { text: 'Awaiting Payment', color: 'text-orange-600', bg: 'bg-orange-50' };
            case 'paid':
                return { text: 'Paid', color: 'text-green-600', bg: 'bg-green-50' };
            case 'in_progress':
                return { text: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50' };
            case 'completed':
                return { text: 'Completed', color: 'text-primary', bg: 'bg-primary/10' };
            case 'rejected':
                return { text: 'Rejected', color: 'text-red-600', bg: 'bg-red-50' };
            case 'cancelled':
                return { text: 'Cancelled', color: 'text-gray-600', bg: 'bg-gray-50' };
            default:
                return { text: booking.status, color: 'text-text-3', bg: 'bg-mist' };
        }
    };

    const statusDisplay = getStatusDisplay();

    return (
        <div className="bg-surface rounded-3xl border border-border shadow-lg overflow-hidden flex flex-col h-full max-h-[800px]">
            <div className="p-5 border-b border-border flex justify-between items-center bg-surface sticky top-0 z-10">
                <h2 className="text-[18px] font-extrabold text-text-1">Booking Details</h2>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${statusDisplay.bg} ${statusDisplay.color}`}>
                        {statusDisplay.text}
                    </span>
                    <span className="text-[14px] font-bold text-primary">#{booking.id.toString().padStart(4, '0')}</span>
                </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
                {/* Map Placeholder */}
                <div className="w-full h-[180px] bg-mist rounded-2xl mb-6 relative overflow-hidden border border-border flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-text-3 absolute" />
                    {/* Replace with actual map component later */}
                    <div className="absolute inset-0 bg-black/5" />
                </div>

                {/* Client Profile Section */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                    <div className="flex items-center gap-4">
                        <Image src={booking.client.avatar} alt={booking.client.name} className="w-14 h-14 rounded-full object-cover" />
                        <div>
                            <h3 className="text-[16px] font-bold text-text-1">{booking.client.name}</h3>
                            <p className="text-[13px] text-text-3">Client</p>
                        </div>
                    </div>
                    <Button variant="secondary" className="w-10 h-10 p-0 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-text-1" />
                    </Button>
                </div>

                {/* Schedule & Location */}
                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-mist flex items-center justify-center shrink-0 mt-0.5">
                            <Calendar className="w-4 h-4 text-text-2" />
                        </div>
                        <div>
                            <p className="text-[12px] text-text-3 font-medium mb-0.5">Schedule Date & Time</p>
                            <p className="text-[14px] font-bold text-text-1">
                                {dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                                <span className="mx-2 text-text-3">|</span>
                                {dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-mist flex items-center justify-center shrink-0 mt-0.5">
                            <MapPin className="w-4 h-4 text-text-2" />
                        </div>
                        <div>
                            <p className="text-[12px] text-text-3 font-medium mb-0.5">Service Location</p>
                            <p className="text-[14px] font-bold text-text-1 leading-relaxed">{booking.address}</p>
                        </div>
                    </div>
                </div>

                {/* Service Overview */}
                <div>
                    <h4 className="text-[15px] font-bold text-text-1 mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-text-3" /> Service Overview
                    </h4>
                    <div className="bg-mist rounded-xl p-4 flex justify-between items-center">
                        <span className="text-[14px] font-semibold text-text-1">{booking.service.title}</span>
                        <span className="text-[16px] font-extrabold text-primary">${booking.service.price.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            {booking.status === 'pending' && isArtisan && (
                <div className="p-5 border-t border-border bg-surface grid grid-cols-2 gap-4 sticky bottom-0">
                    <Button
                        variant="outline"
                        className="w-full h-12 text-[14px]"
                        onClick={handleDecline}
                        disabled={confirmMutation.isPending || cancelMutation.isPending}
                    >
                        Decline
                    </Button>
                    <Button
                        variant="primary"
                        className="w-full h-12 text-[14px]"
                        onClick={handleAccept}
                        disabled={confirmMutation.isPending || cancelMutation.isPending}
                    >
                        {confirmMutation.isPending ? 'Accepting...' : 'Accept Booking'}
                    </Button>
                </div>
            )}

            {/* Payment Prompt for Client */}
            {booking.status === 'awaiting_payment' && isClient && (
                <div className="p-5 border-t border-border bg-surface sticky bottom-0">
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-[14px] font-bold text-orange-900 mb-1">Payment Required</h4>
                                <p className="text-[13px] text-orange-700">
                                    The artisan has accepted your booking. Please complete payment to begin the service.
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="solid"
                        className="w-full h-12 text-[15px] font-semibold bg-primary-btn"
                        onClick={handlePayment}
                        disabled={isPaymentProcessing || initializePaymentMutation.isPending}
                    >
                        {isPaymentProcessing || initializePaymentMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay Now
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Commencement Notice for Artisan */}
            {(booking.status === 'paid' || booking.status === 'in_progress') && isArtisan && (
                <div className="p-5 border-t border-border bg-surface sticky bottom-0">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-[14px] font-bold text-green-900 mb-1">Payment Confirmed</h4>
                                <p className="text-[13px] text-green-700">
                                    The client has completed payment. You can now commence the service.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={() => setShowRejectModal(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-surface rounded-3xl border border-border shadow-2xl w-full max-w-md p-6">
                            <h3 className="text-[18px] font-bold text-text-1 mb-4">Decline Booking</h3>
                            <p className="text-[13px] text-text-3 mb-4">
                                Please provide a reason for declining this booking (optional):
                            </p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter reason..."
                                className="w-full h-24 px-3.5 py-3 text-[13px] font-medium text-text-1 bg-surface rounded-xl border border-border outline-none transition-all placeholder:text-text-4 focus:border-primary focus:ring-2 focus:ring-primary/8 resize-none mb-4"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectReason('');
                                    }}
                                    disabled={cancelMutation.isPending}
                                    className="w-full h-11 text-[14px]"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleConfirmReject}
                                    disabled={cancelMutation.isPending}
                                    className="w-full h-11 text-[14px] bg-red-500 hover:bg-red-600"
                                >
                                    {cancelMutation.isPending ? 'Declining...' : 'Confirm Decline'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
