import { PublicLayout } from './components/PublicLayout.jsx'
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react'

const SECTIONS = [
    {
        icon: FileText,
        title: 'Information We Collect',
        content: [
            {
                subtitle: 'Personal Information',
                text: 'When you register on HustleApp, we collect information such as your name, email address, phone number, location, and payment details. This information is necessary to create your account and facilitate service bookings.'
            },
            {
                subtitle: 'Usage Data',
                text: 'We automatically collect information about how you interact with our platform, including your IP address, browser type, device information, pages visited, and time spent on our services.'
            },
            {
                subtitle: 'Service Provider Information',
                text: 'If you register as a service provider, we collect additional information including professional credentials, certifications, work history, and identification documents for verification purposes.'
            }
        ]
    },
    {
        icon: Database,
        title: 'How We Use Your Information',
        content: [
            {
                subtitle: 'Service Delivery',
                text: 'We use your information to facilitate bookings, connect you with service providers, process payments, and provide customer support.'
            },
            {
                subtitle: 'Platform Improvement',
                text: 'Your usage data helps us understand how our platform is used, identify areas for improvement, and develop new features that better serve our community.'
            },
            {
                subtitle: 'Communication',
                text: 'We use your contact information to send booking confirmations, service updates, promotional offers, and important platform announcements. You can opt out of marketing communications at any time.'
            },
            {
                subtitle: 'Safety and Security',
                text: 'We process your information to verify identities, prevent fraud, ensure platform security, and maintain a safe environment for all users.'
            }
        ]
    },
    {
        icon: Lock,
        title: 'Data Protection & Security',
        content: [
            {
                subtitle: 'Encryption',
                text: 'All sensitive data, including payment information and personal details, is encrypted using industry-standard SSL/TLS protocols during transmission and storage.'
            },
            {
                subtitle: 'Access Controls',
                text: 'We implement strict access controls to ensure that only authorized personnel can access your personal information, and only when necessary for legitimate business purposes.'
            },
            {
                subtitle: 'Regular Audits',
                text: 'Our security practices are regularly reviewed and updated to protect against unauthorized access, disclosure, alteration, or destruction of your data.'
            }
        ]
    },
    {
        icon: Eye,
        title: 'Information Sharing',
        content: [
            {
                subtitle: 'Service Providers',
                text: 'When you book a service, we share necessary information with the service provider to fulfill your booking. This includes your name, contact details, and service requirements.'
            },
            {
                subtitle: 'Payment Processors',
                text: 'We work with trusted third-party payment processors to handle transactions securely. These partners have access only to information necessary to process payments.'
            },
            {
                subtitle: 'Legal Requirements',
                text: 'We may disclose your information when required by law, court order, or government regulation, or when necessary to protect our rights, property, or safety.'
            },
            {
                subtitle: 'Business Transfers',
                text: 'In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity, subject to the same privacy protections.'
            }
        ]
    },
    {
        icon: UserCheck,
        title: 'Your Rights & Choices',
        content: [
            {
                subtitle: 'Access & Correction',
                text: 'You have the right to access, review, and update your personal information at any time through your account settings or by contacting our support team.'
            },
            {
                subtitle: 'Data Deletion',
                text: 'You can request deletion of your account and associated data. Note that we may retain certain information as required by law or for legitimate business purposes.'
            },
            {
                subtitle: 'Marketing Preferences',
                text: 'You can opt out of marketing communications by clicking the unsubscribe link in our emails or updating your notification preferences in your account settings.'
            },
            {
                subtitle: 'Cookie Management',
                text: 'You can control cookie preferences through your browser settings. Note that disabling certain cookies may affect platform functionality.'
            }
        ]
    },
    {
        icon: Shield,
        title: 'Data Retention',
        content: [
            {
                subtitle: 'Active Accounts',
                text: 'We retain your personal information for as long as your account is active or as needed to provide you with our services.'
            },
            {
                subtitle: 'Closed Accounts',
                text: 'After account closure, we may retain certain information for legal compliance, dispute resolution, fraud prevention, and legitimate business purposes for up to 7 years.'
            },
            {
                subtitle: 'Transaction Records',
                text: 'Financial transaction records are retained in accordance with applicable tax and accounting regulations.'
            }
        ]
    }
]

export default function PrivacyPolicyPage() {
    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                            <Shield size={32} className="text-primary" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-1 mb-6">
                            Privacy Policy
                        </h1>
                        <p className="text-lg text-text-3 leading-relaxed mb-4">
                            Your privacy is important to us. This policy explains how we collect, use, protect, and share your personal information.
                        </p>
                        <p className="text-sm text-text-3">
                            Last updated: April 23, 2026
                        </p>
                    </div>
                </div>
            </section>

            {/* Introduction */}
            <section className="py-12 bg-white border-b border-border">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-text-2 leading-relaxed">
                            HustleApp ("we," "our," or "us") is committed to protecting your privacy and ensuring transparency in how we handle your personal information. This Privacy Policy applies to all users of our platform, including customers and service providers. By using HustleApp, you agree to the collection and use of information in accordance with this policy.
                        </p>
                    </div>
                </div>
            </section>

            {/* Policy Sections */}
            <section className="py-20 bg-bg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto space-y-12">
                        {SECTIONS.map((section, index) => (
                            <div key={index} className="bg-white rounded-2xl border border-border p-8">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <section.icon size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-extrabold text-text-1">
                                            {section.title}
                                        </h2>
                                    </div>
                                </div>

                                <div className="space-y-6 ml-16">
                                    {section.content.map((item, idx) => (
                                        <div key={idx}>
                                            <h3 className="text-md font-bold text-text-1 mb-2">
                                                {item.subtitle}
                                            </h3>
                                            <p className="text-sm text-text-3 leading-relaxed">
                                                {item.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Additional Information */}
            <section className="py-16 bg-white border-t border-border">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-extrabold text-text-1 mb-6">
                            Children's Privacy
                        </h2>
                        <p className="text-text-3 leading-relaxed mb-8">
                            HustleApp is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately so we can delete it.
                        </p>

                        <h2 className="text-2xl font-extrabold text-text-1 mb-6">
                            International Data Transfers
                        </h2>
                        <p className="text-text-3 leading-relaxed mb-8">
                            Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                        </p>

                        <h2 className="text-2xl font-extrabold text-text-1 mb-6">
                            Changes to This Policy
                        </h2>
                        <p className="text-text-3 leading-relaxed mb-8">
                            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by email or through a prominent notice on our platform. Your continued use of HustleApp after such changes constitutes acceptance of the updated policy.
                        </p>

                        <h2 className="text-2xl font-extrabold text-text-1 mb-6">
                            Contact Us
                        </h2>
                        <p className="text-text-3 leading-relaxed mb-4">
                            If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                        </p>
                        <div className="bg-mist rounded-xl p-6 space-y-2">
                            <p className="text-sm text-text-2">
                                <span className="font-semibold">Email:</span> privacy@hustleapp.com
                            </p>
                            <p className="text-sm text-text-2">
                                <span className="font-semibold">Phone:</span> +233 (0) 000 000 000
                            </p>
                            <p className="text-sm text-text-2">
                                <span className="font-semibold">Address:</span> HustleApp, Accra, Ghana
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    )
}
