import { PublicLayout } from './components/PublicLayout.jsx'
import { XCircle, Clock, DollarSign, AlertTriangle, CheckCircle, Calendar } from 'lucide-react'

const CANCELLATION_TIERS = [
    {
        icon: CheckCircle,
        title: 'Free Cancellation',
        timeframe: 'More than 24 hours before service',
        refund: '100% refund',
        description: 'Cancel your booking at no cost if you provide notice more than 24 hours before the scheduled service time.',
        color: 'text-success'
    },
    {
        icon: Clock,
        title: 'Standard Cancellation',
        timeframe: '12-24 hours before service',
        refund: '50% refund',
        description: 'Cancellations made between 12-24 hours before service time incur a 50% cancellation fee to compensate the service provider.',
        color: 'text-warning'
    },
    {
        icon: AlertTriangle,
        title: 'Late Cancellation',
        timeframe: 'Less than 12 hours before service',
        refund: 'No refund',
        description: 'Cancellations made less than 12 hours before service time are non-refundable. The full service fee is charged.',
        color: 'text-error'
    },
]

const SPECIAL_CIRCUMSTANCES = [
    {
        title: 'Provider Cancellation',
        description: 'If a service provider cancels your booking, you will receive a full refund automatically. We will also help you find an alternative provider if available.'
    },
    {
        title: 'Emergency Situations',
        description: 'In cases of documented emergencies (medical, natural disasters, etc.), we may waive cancellation fees at our discretion. Contact support with documentation.'
    },
    {
        title: 'Service Not Delivered',
        description: 'If a provider fails to show up or deliver the agreed service, you are entitled to a full refund. Report the issue within 24 hours of the scheduled service time.'
    },
    {
        title: 'Weather Conditions',
        description: 'For outdoor services affected by severe weather, both parties may reschedule without penalty. Cancellations due to weather follow standard refund policies.'
    },
]

const PROCESS_STEPS = [
    {
        step: '1',
        title: 'Initiate Cancellation',
        description: 'Go to "My Bookings" and select the booking you wish to cancel. Click the "Cancel Booking" button.'
    },
    {
        step: '2',
        title: 'Select Reason',
        description: 'Choose a cancellation reason from the provided options. This helps us improve our services.'
    },
    {
        step: '3',
        title: 'Review Refund Amount',
        description: 'The system will display your refund amount based on the cancellation timeframe and policy.'
    },
    {
        step: '4',
        title: 'Confirm Cancellation',
        description: 'Review the details and confirm your cancellation. You will receive an email confirmation immediately.'
    },
    {
        step: '5',
        title: 'Receive Refund',
        description: 'Eligible refunds are processed within 5-7 business days to your original payment method.'
    },
]

export default function CancellationPolicyPage() {
    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                            <XCircle size={32} className="text-primary" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-1 mb-6">
                            Cancellation Policy
                        </h1>
                        <p className="text-lg text-text-3 leading-relaxed mb-4">
                            Understand our cancellation terms and refund eligibility. We strive to be fair to both customers and service providers.
                        </p>
                        <p className="text-sm text-text-3">
                            Last updated: April 23, 2026
                        </p>
                    </div>
                </div>
            </section>

            {/* Overview */}
            <section className="py-12 bg-white border-b border-border">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-text-2 leading-relaxed mb-4">
                            At HustleApp, we understand that plans change. Our cancellation policy is designed to balance flexibility for customers with fairness to service providers who reserve time for your booking. Refund eligibility depends on when you cancel relative to your scheduled service time.
                        </p>
                        <div className="bg-secondary/10 border-l-4 border-secondary rounded-lg p-4">
                            <p className="text-sm text-text-2 font-medium">
                                <strong>Important:</strong> Cancellation timeframes are calculated from the scheduled service start time, not the booking creation time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cancellation Tiers */}
            <section className="py-20 bg-bg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-1 mb-4">
                            Cancellation Timeframes
                        </h2>
                        <p className="text-lg text-text-3 max-w-2xl mx-auto">
                            Your refund amount depends on when you cancel
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {CANCELLATION_TIERS.map((tier, index) => (
                            <div key={index} className="bg-white rounded-2xl border-2 border-border p-8 hover:shadow-lg transition-shadow">
                                <div className={`inline-flex items-center justify-center w-14 h-14 bg-${tier.color.split('-')[1]}/10 rounded-2xl mb-4`}>
                                    <tier.icon size={28} className={tier.color} />
                                </div>
                                <h3 className="text-lg font-bold text-text-1 mb-2">{tier.title}</h3>
                                <p className="text-sm text-text-3 mb-4">{tier.timeframe}</p>
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${tier.color} bg-${tier.color.split('-')[1]}/10`}>
                                    {tier.refund}
                                </div>
                                <p className="text-sm text-text-3 leading-relaxed">{tier.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cancellation Process */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-1 mb-4">
                                How to Cancel a Booking
                            </h2>
                            <p className="text-lg text-text-3">
                                Follow these simple steps to cancel your booking
                            </p>
                        </div>

                        <div className="space-y-6">
                            {PROCESS_STEPS.map((item, index) => (
                                <div key={index} className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-lg font-extrabold text-primary">
                                        {item.step}
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <h3 className="text-md font-bold text-text-1 mb-2">{item.title}</h3>
                                        <p className="text-sm text-text-3 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Special Circumstances */}
            <section className="py-20 bg-bg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-1 mb-4">
                                Special Circumstances
                            </h2>
                            <p className="text-lg text-text-3">
                                Exceptions and special cases
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {SPECIAL_CIRCUMSTANCES.map((item, index) => (
                                <div key={index} className="bg-white rounded-2xl border border-border p-6">
                                    <h3 className="text-md font-bold text-text-1 mb-3">{item.title}</h3>
                                    <p className="text-sm text-text-3 leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Provider Cancellation Policy */}
            <section className="py-16 bg-white border-t border-border">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-extrabold text-text-1 mb-6">
                            Service Provider Cancellation Policy
                        </h2>
                        <p className="text-text-3 leading-relaxed mb-6">
                            Service providers are expected to honor confirmed bookings. If a provider must cancel, they should do so as early as possible. Provider cancellations are tracked and may affect their account standing.
                        </p>
                        <div className="bg-mist rounded-xl p-6 space-y-4">
                            <div>
                                <h3 className="text-md font-bold text-text-1 mb-2">Provider Cancellation Consequences</h3>
                                <ul className="text-sm text-text-3 space-y-2 ml-4">
                                    <li>• Customer receives full refund immediately</li>
                                    <li>• Provider may incur a cancellation fee</li>
                                    <li>• Repeated cancellations may result in account suspension</li>
                                    <li>• Provider rating may be affected</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Important Notes */}
            <section className="py-16 bg-bg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-extrabold text-text-1 mb-6">
                            Important Notes
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-border p-6">
                                <h3 className="text-md font-bold text-text-1 mb-2 flex items-center gap-2">
                                    <DollarSign size={20} className="text-primary" />
                                    Refund Processing Time
                                </h3>
                                <p className="text-sm text-text-3 leading-relaxed">
                                    Approved refunds are processed within 5-7 business days. The time for funds to appear in your account depends on your payment provider.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl border border-border p-6">
                                <h3 className="text-md font-bold text-text-1 mb-2 flex items-center gap-2">
                                    <Calendar size={20} className="text-primary" />
                                    Rescheduling vs. Cancelling
                                </h3>
                                <p className="text-sm text-text-3 leading-relaxed">
                                    Consider rescheduling instead of cancelling. Many providers allow free rescheduling if done with adequate notice. Contact your provider directly to discuss options.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl border border-border p-6">
                                <h3 className="text-md font-bold text-text-1 mb-2 flex items-center gap-2">
                                    <AlertTriangle size={20} className="text-primary" />
                                    No-Show Policy
                                </h3>
                                <p className="text-sm text-text-3 leading-relaxed">
                                    If you fail to show up for a scheduled service without cancelling, you will be charged the full service fee with no refund. Repeated no-shows may result in account restrictions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-white border-t border-border">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-extrabold text-text-1 mb-6">
                            Questions About Cancellations?
                        </h2>
                        <p className="text-text-3 leading-relaxed mb-4">
                            If you have questions about our cancellation policy or need assistance with a specific booking, our support team is here to help.
                        </p>
                        <div className="bg-mist rounded-xl p-6 space-y-2">
                            <p className="text-sm text-text-2">
                                <span className="font-semibold">Email:</span> support@hustleapp.com
                            </p>
                            <p className="text-sm text-text-2">
                                <span className="font-semibold">Phone:</span> +233 (0) 000 000 000
                            </p>
                            <p className="text-sm text-text-2">
                                <span className="font-semibold">Live Chat:</span> Available 24/7 on the platform
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    )
}
