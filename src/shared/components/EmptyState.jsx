import { Plus } from 'lucide-react'
import { Button } from './Button'
import Image from './Image'

/**
 * EmptyState
 * Centered placeholder with illustration, title, description, and optional action.
 */
export function EmptyState({ title, description, action, illustration }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-12 text-center min-h-[500px]">
            {illustration && (
                <div className="mb-8 w-32 h-32 flex items-center justify-center">
                    {typeof illustration === 'string' ? (
                        <Image src={illustration} alt="Empty state illustration" className="w-full h-full object-contain" />
                    ) : (
                        <div className="text-8xl">{illustration}</div>
                    )}
                </div>
            )}

            <h4 className=" font-semibold text-primary-sat mb-2 font-display">
                {title}
            </h4>

            <p className="text-sm text-text-3 mb-8 max-w-md md:max-w-sm">
                {description}
            </p>

            {action && (
                <Button
                    onClick={action.onClick}
                    className="inline-flex md:w-[32%] h-[50px] items-center gap-3 px-8 py-3 rounded-full font-semibold text-base transition-all shadow-sm hover:shadow-md"
                    variant="solid"
                >
                    <span className="w-5 h-5 rounded-full bg-white text-primary-sat flex justify-center items-center">
                        <Plus size={18} strokeWidth={2.5} />
                    </span>
                    {action.label}
                </Button>
            )}
        </div>
    )
}
