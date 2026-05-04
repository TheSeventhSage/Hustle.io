import { useState } from 'react';
import { MapPin, Calendar, Clock, MessageCircle, FileText } from 'lucide-react';
import Image from '../../../shared/components/Image';
import { Button } from '../../../shared/components/Button';
import { useConfirmBooking, useCancelBooking } from '../booking.hooks';

export function BookingDetailPanel({ booking }) {
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const dateObj = new Date(booking.schedule_date);

    const confirmMutation = useConfirmBooking();
    const cancelMutation = useCancelBooking();

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

    return (
        <div className="bg-surface rounded-3xl border border-border shadow-lg overflow-hidden flex flex-col h-full max-h-[800px]">
            <div className="p-5 border-b border-border flex justify-between items-center bg-surface sticky top-0 z-10">
                <h2 className="text-[18px] font-extrabold text-text-1">Booking Details</h2>
                <span className="text-[14px] font-bold text-primary">#{booking.id.padStart(4, '0')}</span>
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
            {booking.status === 'pending' && (
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