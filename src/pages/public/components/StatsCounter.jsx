export function StatsCounter({ value, label }) {
    return (
        <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary mb-2">
                {value}
            </div>
            <div className="text-sm text-text-3 font-medium">
                {label}
            </div>
        </div>
    )
}
