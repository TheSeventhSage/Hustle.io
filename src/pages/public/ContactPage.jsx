import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import { useState } from 'react'
import { PublicLayout } from './components/PublicLayout.jsx'
import { Button } from '../../shared/components/Button.jsx'

const CONTACT_INFO = [
    {
        icon: Mail,
        title: 'Email Us',
        primary: 'hello@hustleapp.com',
        secondary: 'support@hustleapp.com',
        link: 'mailto:hello@hustleapp.com'
    },
    {
        icon: Phone,
        title: 'Call Us',
        primary: '+233 (0) 000 000 000',
        secondary: 'Mon-Fri, 8am-6pm GMT',
        link: 'tel:+233000000000'
    },
    {
        icon: MapPin,
        title: 'Visit Us',
        primary: 'Accra, Ghana',
        secondary: 'East Legon, Accra',
        link: null
    },
    {
        icon: Clock,
        title: 'Business Hours',
        primary: 'Mon - Fri: 8am - 6pm',
        secondary: 'Sat - Sun: 10am - 4pm',
        link: null
    },
]

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        // TODO: Implement actual form submission
        await new Promise(resolve => setTimeout(resolve, 1000))

        console.log('Form submitted:', formData)
        setIsSubmitting(false)

        // Reset form
        setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        })
    }

    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-1 mb-6">
                            Get In Touch
                        </h1>
                        <p className="text-lg text-text-3 leading-relaxed">
                            Have questions or need assistance? Our team is here to help. Reach out and we'll respond as soon as possible.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {CONTACT_INFO.map((info, index) => (
                            <div key={index} className="bg-bg border border-border rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                                    <info.icon size={28} className="text-primary" />
                                </div>
                                <h3 className="text-md font-bold text-text-1 mb-2">{info.title}</h3>
                                {info.link ? (
                                    <a href={info.link} className="text-sm text-primary font-medium hover:text-primary-sat block mb-1">
                                        {info.primary}
                                    </a>
                                ) : (
                                    <p className="text-sm text-text-2 font-medium mb-1">{info.primary}</p>
                                )}
                                <p className="text-xs text-text-3">{info.secondary}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & Map Section */}
            <section className="py-20 bg-bg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div>
                            <h2 className="text-3xl font-extrabold text-text-1 mb-4">
                                Send Us a Message
                            </h2>
                            <p className="text-text-3 mb-8">
                                Fill out the form below and our team will get back to you within 24 hours.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-text-2 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full h-12 px-4 border border-border rounded-lg outline-none focus:border-primary transition-colors bg-white"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-text-2 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full h-12 px-4 border border-border rounded-lg outline-none focus:border-primary transition-colors bg-white"
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-text-2 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full h-12 px-4 border border-border rounded-lg outline-none focus:border-primary transition-colors bg-white"
                                            placeholder="+233 000 000 000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-text-2 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full h-12 px-4 border border-border rounded-lg outline-none focus:border-primary transition-colors bg-white"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-text-2 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-border rounded-lg outline-none focus:border-primary transition-colors resize-none bg-white"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="solid"
                                    disabled={isSubmitting}
                                    className="w-full h-12 rounded-lg font-semibold bg-primary hover:bg-primary-sat disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                    {!isSubmitting && <Send size={18} className="ml-2" />}
                                </Button>
                            </form>
                        </div>

                        {/* Map & Additional Info */}
                        <div>
                            <h2 className="text-3xl font-extrabold text-text-1 mb-4">
                                Our Location
                            </h2>
                            <p className="text-text-3 mb-8">
                                Visit our office or connect with us online. We're here to support your service needs.
                            </p>

                            {/* Map Placeholder */}
                            <div className="bg-mist border border-border rounded-2xl overflow-hidden mb-8 h-80">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127118.0!2d-0.1870!3d5.6037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9084b2b7a773%3A0xbed14ed8650e2dd3!2sAccra%2C%20Ghana!5e0!3m2!1sen!2sus!4v1234567890"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="HustleApp Office Location"
                                />
                            </div>

                            {/* FAQ Quick Links */}
                            <div className="bg-white border border-border rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-text-1 mb-4">
                                    Quick Help
                                </h3>
                                <ul className="space-y-3">
                                    <li>
                                        <a href="/faq" className="text-sm text-primary hover:text-primary-sat font-medium">
                                            Frequently Asked Questions →
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/how-it-works" className="text-sm text-primary hover:text-primary-sat font-medium">
                                            How HustleApp Works →
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/provider/register" className="text-sm text-primary hover:text-primary-sat font-medium">
                                            Become a Service Provider →
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/terms" className="text-sm text-primary hover:text-primary-sat font-medium">
                                            Terms & Conditions →
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Support CTA */}
            <section className="py-16 bg-white border-t border-border">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h3 className="text-2xl font-bold text-text-1 mb-4">
                            Need Immediate Assistance?
                        </h3>
                        <p className="text-text-3 mb-8">
                            Our support team is available 24/7 to help with urgent inquiries
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a href="tel:+233000000000">
                                <Button variant="solid" className="h-12 px-6 rounded-full font-semibold bg-primary">
                                    <Phone size={18} className="mr-2" />
                                    Call Support
                                </Button>
                            </a>
                            <a href="/messages">
                                <Button variant="outline" className="h-12 px-6 rounded-full font-semibold">
                                    Live Chat
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    )
}
