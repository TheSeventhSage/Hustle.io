import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, MapPin, Calendar, Clock, Filter, MessageCircle } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import Image from '../../../shared/components/Image';
import { BookingRequestCard } from '../components/BookingRequestCard';
import { BookingDetailPanel } from '../components/BookingDetailPanel';
// import { bookingService } from '../booking.service'; // Uncomment when service is ready

// Dummy data to match the UI images
const MOCK_BOOKINGS = [
  {
    id: '1',
    status: 'pending',
    client: { name: 'Wade Warren', location: 'London, UK', avatar: 'https://i.pravatar.cc/150?u=wade' },
    service: { title: 'Home Cleaning Service', price: 120.00 },
    schedule_date: '2024-10-24T10:00:00Z',
    address: '4517 Washington Ave. Manchester, Kentucky 39495',
  },
  {
    id: '2',
    status: 'upcoming',
    client: { name: 'Brooklyn Simmons', location: 'New York, US', avatar: 'https://i.pravatar.cc/150?u=brook' },
    service: { title: 'Plumbing Repair', price: 85.50 },
    schedule_date: '2024-10-26T14:30:00Z',
    address: '2715 Ash Dr. San Jose, South Dakota 83475',
  }
];

const TABS = ['Pending', 'Upcoming', 'Completed', 'Cancelled'];

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(MOCK_BOOKINGS[0]?.id);

  // In real implementation:
  // const { data: bookings = [], isLoading } = useQuery({
  //   queryKey: ['bookings'],
  //   queryFn: () => bookingService.getBookings()
  // });
  const bookings = MOCK_BOOKINGS;

  const filteredBookings = useMemo(() => {
    return bookings.filter(b =>
      b.status.toLowerCase() === activeTab.toLowerCase() &&
      b.client.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bookings, activeTab, searchQuery]);

  const selectedBooking = useMemo(() =>
    bookings.find(b => b.id === selectedBookingId),
    [bookings, selectedBookingId]);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold text-text-1 mb-2">Bookings</h1>
        <p className="text-text-3 text-[15px]">Manage your job requests and upcoming schedules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: List & Filters */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">

          {/* Controls: Search & Tabs */}
          <div className="bg-surface rounded-2xl p-4 shadow-sm border border-border">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
              <div className="flex space-x-1 bg-mist p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setSelectedBookingId(null);
                    }}
                    className={`px-5 py-2.5 rounded-lg text-[14px] font-semibold whitespace-nowrap transition-all ${activeTab === tab
                      ? 'bg-surface text-text-1 shadow-sm'
                      : 'text-text-3 hover:text-text-2 hover:bg-surface/50'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-mist border-none rounded-xl text-[14px] text-text-1 placeholder:text-text-3 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-4">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12 text-text-3">
                  No {activeTab.toLowerCase()} bookings found.
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <BookingRequestCard
                    key={booking.id}
                    booking={booking}
                    isActive={selectedBookingId === booking.id}
                    onClick={() => setSelectedBookingId(booking.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Detail Panel */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24">
            {selectedBooking ? (
              <BookingDetailPanel booking={selectedBooking} />
            ) : (
              <div className="bg-surface rounded-3xl border border-border shadow-sm p-12 text-center flex flex-col items-center justify-center h-[600px]">
                <div className="w-20 h-20 bg-mist rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-text-3" />
                </div>
                <h3 className="text-[18px] font-bold text-text-1 mb-2">No Booking Selected</h3>
                <p className="text-[14px] text-text-3">Select a booking from the list to view its details here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}