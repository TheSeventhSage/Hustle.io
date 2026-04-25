/**
 * StatusBadge
 * Color-coded status badge for hustle lifecycle states
 */
export function StatusBadge({ status }) {
    const statusConfig = {
        created: {
            label: 'Created',
            color: 'var(--color-secondary)',
            textColor: 'var(--color-primary)',
        },
        'in-progress': {
            label: 'In Progress',
            color: '#3B82F6', // blue
            textColor: '#fff',
        },
        'pending-approval': {
            label: 'Pending Approval',
            color: '#F59E0B', // orange
            textColor: '#fff',
        },
        completed: {
            label: 'Completed',
            color: '#10B981', // green
            textColor: '#fff',
        },
        reviews: {
            label: 'Reviews',
            color: '#8B5CF6', // purple
            textColor: '#fff',
        },
    }

    const config = statusConfig[status] || statusConfig.created

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'var(--ff-body)',
                background: config.color,
                color: config.textColor,
                textTransform: 'capitalize',
            }}
        >
            {config.label}
        </span>
    )
}
