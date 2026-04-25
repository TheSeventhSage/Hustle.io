import { Star, Quote } from 'lucide-react'

export function TestimonialCard({ testimonial }) {
    return (
        <div className="group relative bg-white rounded-3xl border border-border p-8 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-2">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

            {/* Content */}
            <div className="relative z-10">
                {/* Quote Icon - Large & Decorative */}
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Quote size={28} className="text-primary" />
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-6 pt-8">
                    {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                            key={i}
                            size={18}
                            className="text-secondary fill-secondary transform group-hover:scale-110 transition-transform duration-300"
                            style={{ transitionDelay: `${i * 50}ms` }}
                        />
                    ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-base text-text-2 leading-relaxed mb-8 font-medium">
                    "{testimonial.text}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-6 border-t border-border">
                    <div className="relative">
                        <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-14 h-14 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all duration-300"
                        />
                        {/* Online Indicator */}
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-success rounded-full border-2 border-white" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-text-1 group-hover:text-primary transition-colors">
                            {testimonial.name}
                        </p>
                        <p className="text-sm text-text-3 font-medium">{testimonial.role}</p>
                    </div>
                </div>
            </div>

            {/* Bottom Accent */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl" />
        </div>
    )
}
