import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import '../css/FAQSection.css';

const FAQ_ITEMS = [
    {
        id: 1,
        question: 'How do I create an account?',
        answer: "Click on the 'Sign Up' button at the top right corner, fill in your details, and verify your email address to get started."
    },
    {
        id: 2,
        question: 'Is it free to use Hustle?',
        answer: 'Yes, you can browse services and create a basic profile for free. Premium plans may unlock additional visibility, advanced tools, and priority features.'
    },
    {
        id: 3,
        question: 'How can I update my profile?',
        answer: 'Go to your dashboard, open profile settings, edit the necessary information, and save your changes.'
    },
    {
        id: 4,
        question: 'Can I apply for multiple jobs?',
        answer: 'Yes, you can apply for multiple jobs as long as your profile matches the requirements and each application is submitted correctly.'
    },
    {
        id: 5,
        question: 'How do I purchase a premium plan?',
        answer: 'Open the pricing or subscription page, choose your preferred plan, and complete the secure payment process.'
    },
    {
        id: 6,
        question: 'Can I upgrade my plan later?',
        answer: 'Yes, you can upgrade your plan at any time from your account settings or billing dashboard.'
    }
];

const FAQSection = () => {
    const [openId, setOpenId] = useState(1);

    const toggleFAQ = (id) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <section className="faq-section">
            <div className="faq-container">
                <h2 className="faq-heading">
                    <span className="heading-white">Faqs <br /> - Everything</span>{' '}
                    <span className="heading-orange">You Need to Know</span>
                </h2>

                <div className="faq-content-layout">
                    {/* Left Illustration */}
                    <div className="faq-illustration">
                        {/* 
                            IMPORTANT: The image needs to be edited in an image editor so that:
                            - All colored parts (skin, hair, shirt, question marks) are #557f55
                            - Only white trouser stripes and white shoes remain white
                            CSS filters cannot achieve this selective color replacement.
                        */}
                        <img src="/images/home/faq.webp" alt="FAQ Illustration" />
                    </div>

                    {/* Right Accordion */}
                    <div className="faq-accordion">
                        {FAQ_ITEMS.map((item) => {
                            const isOpen = openId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className={`faq-item ${isOpen ? 'open' : ''}`}
                                >
                                    <button
                                        className="faq-header"
                                        onClick={() => toggleFAQ(item.id)}
                                        aria-expanded={isOpen}
                                    >
                                        <span className="faq-question">{item.question}</span>
                                        {isOpen ? (
                                            <ChevronUp size={20} className="faq-chevron" />
                                        ) : (
                                            <ChevronDown size={20} className="faq-chevron" />
                                        )}
                                    </button>
                                    {isOpen && (
                                        <div className="faq-answer">
                                            <p>{item.answer}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
