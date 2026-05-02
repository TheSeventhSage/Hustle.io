import { MapPin, Calendar, Clock, MessageCircle } from 'lucide-react';
import Image from '../../../shared/components/Image';
import { Button } from '../../../shared/components/Button';

export function BookingRequestCard({ booking, isActive, onClick }) {
    const dateObj = new Date(booking.schedule_date);
    const formattedDate = dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        upcoming: 'bg-blue-100 text-blue-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <div
            onClick={onClick}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${isActive
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border bg-surface hover:border-text-3/30 hover:shadow-sm'
                }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4 items-center">
                    <Image
                        src={booking.client.avatar}
                        alt={booking.client.name}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                        <h4 className="text-[16px] font-bold text-text-1">{booking.client.name}</h4>
                        <div className="flex items-center text-text-3 text-[13px] mt-1">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            {booking.client.location}
                        </div>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[12px] font-bold capitalize ${statusColors[booking.status]}`}>
                    {booking.status}
                </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-4 text-[13px] text-text-2 font-medium">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-text-3" />
                        {formattedDate}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-text-3" />
                        {formattedTime}
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {booking.status === 'pending' ? (
                        <>
                            <Button variant="outline" className="flex-1 sm:flex-none h-9 text-[13px] px-4">Decline</Button>
                            <Button variant="primary" className="flex-1 sm:flex-none h-9 text-[13px] px-4">Accept</Button>
                        </>
                    ) : (
                        <Button variant="secondary" className="w-full sm:w-auto h-9 text-[13px] px-4 flex items-center justify-center gap-2">
                            <MessageCircle className="w-4 h-4" /> Message
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}