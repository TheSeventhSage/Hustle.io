import { PublicLayout } from './components/PublicLayout.jsx'
import { DollarSign, CheckCircle, XCircle, Clock, AlertCircle, CreditCard } from 'lucide-react'

const REFUND_SCENARIOS = [
    {
        icon: CheckCircle,
        title: 'Full Refund Eligibility',
        color: 'text-success',
        cases: [
            'Cancellation more than 24 hours before service',
            'Service provider cancels the booking',
            'Service provider fails to show up',
            'Service not delivered as described',
            'Documented quality issues with service delivery',
            'Platform technical error affecting booking'
        ]
    },
    {
        icon: Clock,
        title: 'Partial Refund Eligibility',
        color: 'text-warning',
        cases: [
            'Cancellation 12-24 hours before service (50% refund)',
            'Service partially completed with mutual agreement',
            'Service quality issues resolved through partial credit',
            'Rescheduling fees when applicable'
        ]
    },
    {
        icon: XCircle,
        title: 'No Refund Situations',
        color: 'text-error',
        cases: [
            'Cancellation less than 12 hours before service',
            'Customer no-show without prior cancellation',
            'Service completed as agreed',
            'Customer dissatisfaction without valid quality concerns',
            'Change of mind after service completion',
            'Violation of platform terms and conditions'
        ]
    },
]

const REFUND_PROCESS = [
    {
        step: '1',
        title: 'Request Refund',
        description: 'Submit a refund request through "My Bookings" or contact support. Provide booking details and reason for refund.',
        timeframe: 'Within 48 hours of service'
    },
    {
        step: '2',
        title: 'Review & Verification',
        description: 'Our team reviews your request, verifies booking details, and may contact you or the provider for additional information.',
        timeframe: '1-2 business days'
    },
    {
        step: '3',
        title: 'Decision Notification',
        description: 'You receive an email with the refund decision, including the approved amount and processing timeline.',
        timeframe: '2-3 business days'
    },
    {
        step: '4',
        title: 'Refund Processing',
        description: 'Approved refunds are initiated to your original payment method. Processing time varies by payment provider.',
        timeframe: '5-7 business days'
    },
    {
        step: '5',
        title: 'Confirmation',
        description: 'You receive confirmation once the refund is successfully processed. Check your payment account for the credit.',
        timeframe: '7-10 business days total'
    },
]

const DISPUTE_GUIDELINES = [
    {
        title: 'Quality Issues',
        description: 'If service quality does not meet expectations, document the issue with photos or videos if possible. Contact support within 24 hours of service completion.',
        action: 'Submit evidence and detailed description'
    },
    {
        title: 'Service Not Delivered',
        description: 'If a provider fails to show up or deliver the agreed service, report immediately. Full refunds are typically approved for verified no-shows.',
        action: 'Report within 24 hours of scheduled time'
    },
    {
        title: 'Billing Errors',
        description: 'If you were charged incorrectly or notice duplicate charges, contact support immediately with transaction details.',
        action: 'Provide transaction ID and details'
    },
    {
        title: 'Provider Disputes',
        description: 'If you and the provider disagree about service delivery, we may mediate. Provide your perspective and any supporting evidence.',
        action: 'Submit detailed account with evidence'
    },
]

export default function RefundPolicyPage() {
    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                            <DollarSign size={32} className="text-primary" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-1 mb-6">
                            Refund Policy
                        </h1>
                        <p className="text-lg text-text-3 leading-relaxed mb-4">
                            Our commitment to fair refunds. Understand when and how refunds are processed for your bookings.
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
                            At HustleApp, we strive to ensure customer satisfaction while maintaining fairness to our service providers. This Refund Policy outlines the circumstances under which refunds are granted, the refund process, and timelines for processing.
                        </p>
                        <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                            <p className="text-sm text-text-2 font-medium">
                                <strong>Important:</strong> Refund eligibility is determined by our Cancellation Policy timeframes and service delivery outcomes. All refund requests are reviewed individually.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Refund Scenarios */}
            <section className="py-20 bg-bg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-1 mb-4">
                            Refund Eligibility
                        </h2>
                        <p className="text-lg text-text-3 max-w-2xl mx-auto">
                            When you can expect a full, partial, or no refund
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {REFUND_SCENARIOS.map((scenario, index) => (
                            <div key={index} className="bg-white rounded-2xl border-2 border-border p-8">
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${scenario.color} bg-${scenario.color.split('-')[1]}/10`}>
                                    <scenario.icon size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-text-1 mb-6">{scenario.title}</h3>
                                <ul className="space-y-3">
                                    {scenario.cases.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-text-3">
                                            <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${scenario.color.replace('text-', 'bg-')}`} />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Refund Process */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-1 mb-4">
                                Refund Process Timeline
                            </h2>
                            <p className="text-lg text-text-3">
                                What to expect when requesting a refund
                            </p>
                        </div>

                        <div className="space-y-8">
                            {REFUND_PROCESS.map((item, index) => (
                                <div key={index} className="flex gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-lg font-extrabold text-primary">
                                            {item.step}
                                        </div>
                                        {index < REFUND_PROCESS.length - 1 && (
                                            <div className="w-0.5 h-16 bg-border mx-auto mt-2" />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-8">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-md font-bold text-text-1">{item.title}</h3>
                                            <span className="text-xs text-text-3 font-medium bg-mist px-3 py-1 rounded-full">
                                                {item.timeframe}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-3 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Dispute Resolution */}
            <section className="py-20 bg-bg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-1 mb-4">
                                Dispute Resolution
                            </h2>
                            <p className="text-lg text-text-3">
                                How to handle service disputes and refund requests
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {DISPUTE_GUIDELINES.map((item, index) => (
                                <div key={index} className="bg-white rounded-2xl border border-border p-6">
                                    <h3 className="text-md font-bold text-text-1 mb-3">{item.title}</h3>
                                    <p className="text-sm text-text-3 leading-relaxed mb-4">{item.description}</p>
                                    <div className="flex items-center gap-2 text-xs font-medium text-primary">
                                        <AlertCircle size={16} />
                                        <span>{item.action}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Payment Methods */}
            <section className="py-16 bg-white border-t border-border">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-extrabold text-text-1 mb-6 flex items-center gap-3">
                            <CreditCard size={28} className="text-primary" />
                            Refund Payment Methods
                        </h2>
                        <p className="text-text-3 leading-relaxed mb-6">
                            Refunds are processed to the original payment method used for the booking. Processing times vary by payment provider:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-mist rounded-xl p-6">
                                <h3 className="text-md font-bold text-text-1 mb-2">Credit/Debit Cards</h3>
                                <p className="text-sm text-text-3 mb-2">5-7 business days after approval</p>
                                <p className="text-xs text-text-3">Refund appears as a credit on your card statement</p>
                            </div>
                            <div className="bg-mist rounded-xl p-6">
                                <h3 className="text-md font-bold text-text-1 mb-2">Mobile Money</h3>
                                <p className="text-sm text-text-3 mb-2">2-3 business days after approval</p>
                                <p className="text-xs text-text-3">Refund credited directly to your mobile money account</p>
                            </div>
                            <div className="bg-mist rounded-xl p-6">
                                <h3 className="text-md font-bold text-text-1 mb-2">Bank Transfer</h3>
                                <p className="text-sm text-text-3 mb-2">3-5 business days after approval</p>
                                <p className="text-xs text-text-3">Refund deposited to your linked bank account</p>
                            </div>
                            <div className="bg-mist rounded-xl p-6">
                                <h3 className="text-md font-bold text-text-1 mb-2">Platform Credit</h3>
                                <p className="text-sm text-text-3 mb-2">Instant after approval</p>
                                <p className="text-xs text-text-3">Credit added to your HustleApp wallet for future bookings</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Important Information */}
            <section className="py-16 bg-bg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-extrabold text-text-1 mb-6">
                            Important Information
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-border p-6">
                                <h3 className="text-md font-bold text-text-1 mb-2">Refund Request Deadline</h3>
                                <p className="text-sm text-text-3 leading-relaxed">
                                    Refund requests must be submitted within 48 hours of the scheduled service time. Requests submitted after this period may not be eligible for refund.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl border border-border p-6">
                                <h3 className="text-md font-bold text-text-1 mb-2">Platform Fees</h3>
                                <p className="text-sm text-text-3 leading-relaxed">
                                    Platform service fees are non-refundable except in cases of provider cancellation or platform error. Only the service provider's fee is refunded in eligible cancellations.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl border border-border p-6">
                                <h3 className="text-md font-bold text-text-1 mb-2">Currency Exchange</h3>
                                <p className="text-sm text-text-3 leading-relaxed">
                                    If your original payment involved currency conversion, the refund amount may differ slightly due to exchange rate fluctuations. We refund the original amount in the transaction currency.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl border border-border p-6">
                                <h3 className="text-md font-bold text-text-1 mb-2">Refund Appeals</h3>
                                <p className="text-sm text-text-3 leading-relaxed">
                                    If your refund request is denied and you believe the decision was incorrect, you may appeal within 7 days. Provide additional evidence or information to support your appeal.
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
                            Need Help with a Refund?
                        </h2>
                        <p className="text-text-3 leading-relaxed mb-4">
                            Our support team is available to assist with refund requests and answer any questions about our refund policy.
                        </p>
                        <div className="bg-mist rounded-xl p-6 space-y-2">
                            <p className="text-sm text-text-2">
                                <span className="font-semibold">Email:</span> refunds@hustleapp.com
                            </p>
                            <p className="text-sm text-text-2">
                                <span className="font-semibold">Phone:</span> +233 (0) 000 000 000
                            </p>
                            <p className="text-sm text-text-2">
                                <span className="font-semibold">Live Chat:</span> Available 24/7 on the platform
                            </p>
                            <p className="text-sm text-text-2">
                                <span className="font-semibold">Response Time:</span> Within 24 hours
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    )
}
