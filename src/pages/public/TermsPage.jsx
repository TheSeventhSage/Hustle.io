import { PublicLayout } from './components/PublicLayout.jsx'
import { FileText, Users, Shield, DollarSign, AlertCircle, Scale } from 'lucide-react'

const SECTIONS = [
    {
        icon: Users,
        title: 'User Accounts & Eligibility',
        content: [
            {
                subtitle: 'Account Creation',
                text: 'To use HustleApp services, you must create an account by providing accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.'
            },
            {
                subtitle: 'Eligibility Requirements',
                text: 'You must be at least 18 years old to use HustleApp. By creating an account, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.'
            },
            {
                subtitle: 'Account Responsibilities',
                text: 'You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss or damage arising from your failure to protect your account information.'
            }
        ]
    },
    {
        icon: FileText,
        title: 'Platform Services',
        content: [
            {
                subtitle: 'Service Description',
                text: 'HustleApp is a marketplace platform that connects customers with independent service providers. We facilitate bookings and payments but do not directly provide the services listed on our platform.'
            },
            {
                subtitle: 'Service Provider Independence',
                text: 'Service providers on HustleApp are independent contractors, not employees or agents of HustleApp. We do not control how providers perform their services and are not responsible for their actions or omissions.'
            },
            {
                subtitle: 'Platform Availability',
                text: 'While we strive to maintain continuous platform availability, we do not guarantee uninterrupted access. We may suspend or modify services for maintenance, updates, or other operational reasons.'
            }
        ]
    },
    {
        icon: DollarSign,
        title: 'Payments & Fees',
        content: [
            {
                subtitle: 'Service Fees',
                text: 'Customers pay the service fee displayed at the time of booking. Service providers pay a platform commission on completed bookings. All fees are clearly disclosed before transaction confirmation.'
            },
            {
                subtitle: 'Payment Processing',
                text: 'Payments are processed through secure third-party payment processors. By making a payment, you authorize us to charge your selected payment method for the total amount due.'
            },
            {
                subtitle: 'Refunds',
                text: 'Refund eligibility is determined by our Refund Policy. Generally, refunds are provided for cancelled bookings within the specified timeframe or when services are not delivered as agreed.'
            },
            {
                subtitle: 'Taxes',
                text: 'You are responsible for determining and paying any applicable taxes related to your use of HustleApp services. Service fees may be subject to applicable taxes as required by law.'
            }
        ]
    },
    {
        icon: Shield,
        title: 'User Conduct & Prohibited Activities',
        content: [
            {
                subtitle: 'Acceptable Use',
                text: 'You agree to use HustleApp only for lawful purposes and in accordance with these Terms. You must treat all users with respect and professionalism.'
            },
            {
                subtitle: 'Prohibited Activities',
                text: 'You may not: (a) violate any laws or regulations; (b) infringe on intellectual property rights; (c) transmit harmful code or malware; (d) harass, abuse, or harm other users; (e) manipulate ratings or reviews; (f) use the platform for fraudulent purposes; or (g) attempt to circumvent platform fees.'
            },
            {
                subtitle: 'Content Standards',
                text: 'Any content you post must be accurate, lawful, and not misleading. You retain ownership of your content but grant HustleApp a license to use it for platform operations.'
            }
        ]
    },
    {
        icon: AlertCircle,
        title: 'Liability & Disclaimers',
        content: [
            {
                subtitle: 'Service Quality',
                text: 'HustleApp does not guarantee the quality, safety, or legality of services provided by independent service providers. We are not responsible for disputes between customers and providers.'
            },
            {
                subtitle: 'Platform Disclaimer',
                text: 'The platform is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the platform will be error-free, secure, or uninterrupted.'
            },
            {
                subtitle: 'Limitation of Liability',
                text: 'To the maximum extent permitted by law, HustleApp shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.'
            },
            {
                subtitle: 'Indemnification',
                text: 'You agree to indemnify and hold HustleApp harmless from any claims, damages, or expenses arising from your use of the platform, violation of these Terms, or infringement of any rights of another party.'
            }
        ]
    },
    {
        icon: Scale,
        title: 'Dispute Resolution',
        content: [
            {
                subtitle: 'Customer-Provider Disputes',
                text: 'Disputes between customers and service providers should first be resolved directly between the parties. HustleApp may provide mediation assistance but is not obligated to resolve such disputes.'
            },
            {
                subtitle: 'Governing Law',
                text: 'These Terms are governed by the laws of Ghana. Any disputes arising from these Terms or your use of HustleApp shall be subject to the exclusive jurisdiction of the courts of Ghana.'
            },
            {
                subtitle: 'Arbitration',
                text: 'For disputes with HustleApp, you agree to first attempt informal resolution by contacting our support team. If unresolved, disputes may be submitted to binding arbitration in accordance with Ghanaian arbitration rules.'
            }
        ]
    }
]

export default function TermsPage() {
    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                            <FileText size={32} className="text-primary" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-1 mb-6">
                            Terms & Conditions
                        </h1>
                        <p className="text-lg text-text-3 leading-relaxed mb-4">
                            Please read these terms carefully before using HustleApp. By accessing or using our platform, you agree to be bound by these Terms and Conditions.
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
                        <p className="text-text-2 leading-relaxed mb-4">
                            These Terms and Conditions ("Terms") constitute a legally binding agreement between you and HustleApp ("Company," "we," "our," or "us") governing your access to and use of the HustleApp platform, including our website, mobile applications, and related services (collectively, the "Platform").
                        </p>
                        <p className="text-text-2 leading-relaxed">
                            By creating an account, accessing, or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy and other applicable policies. If you do not agree with these Terms, you must not use the Platform.
                        </p>
                    </div>
                </div>
            </section>

            {/* Terms Sections */}
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

            {/* Additional Terms */}
            <section className="py-16 bg-white border-t border-border">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-extrabold text-text-1 mb-6">
                            Intellectual Property
                        </h2>
                        <p className="text-text-3 leading-relaxed mb-8">
                            All content, features, and functionality on the Platform, including but not limited to text, graphics, logos, icons, images, and software, are the exclusive property of HustleApp and are protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission.
                        </p>

                        <h2 className="text-2xl font-extrabold text-text-1 mb-6">
                            Termination
                        </h2>
                        <p className="text-text-3 leading-relaxed mb-8">
                            We reserve the right to suspend or terminate your account and access to the Platform at any time, with or without notice, for any reason, including violation of these Terms. Upon termination, your right to use the Platform will immediately cease. Provisions that by their nature should survive termination shall remain in effect.
                        </p>

                        <h2 className="text-2xl font-extrabold text-text-1 mb-6">
                            Modifications to Terms
                        </h2>
                        <p className="text-text-3 leading-relaxed mb-8">
                            We may modify these Terms at any time by posting the updated version on the Platform. Material changes will be communicated via email or platform notification. Your continued use of the Platform after such modifications constitutes acceptance of the updated Terms. We encourage you to review these Terms periodically.
                        </p>

                        <h2 className="text-2xl font-extrabold text-text-1 mb-6">
                            Severability
                        </h2>
                        <p className="text-text-3 leading-relaxed mb-8">
                            If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
                        </p>

                        <h2 className="text-2xl font-extrabold text-text-1 mb-6">
                            Contact Information
                        </h2>
                        <p className="text-text-3 leading-relaxed mb-4">
                            For questions or concerns regarding these Terms and Conditions, please contact us:
                        </p>
                        <div className="bg-mist rounded-xl p-6 space-y-2">
                            <p className="text-sm text-text-2">
                                <span className="font-semibold">Email:</span> legal@hustleapp.com
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
