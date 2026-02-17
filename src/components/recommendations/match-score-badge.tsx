import { cn } from "@/lib/utils";

interface MatchScoreBadgeProps {
    score: number;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

export function MatchScoreBadge({ score, size = "md", showLabel = true }: MatchScoreBadgeProps) {
    // Determine color based on score
    let colorClass = "text-gray-400 bg-gray-50 border-gray-100";
    let progressColor = "text-gray-400";

    if (score >= 80) {
        colorClass = "text-green-700 bg-green-50 border-green-200";
        progressColor = "text-green-600";
    } else if (score >= 50) {
        colorClass = "text-yellow-700 bg-yellow-50 border-yellow-200";
        progressColor = "text-yellow-500";
    } else if (score > 0) {
        colorClass = "text-orange-700 bg-orange-50 border-orange-200";
        progressColor = "text-orange-500";
    }

    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const sizeClasses = {
        sm: "h-8 w-8 text-[10px]",
        md: "h-10 w-10 text-xs",
        lg: "h-14 w-14 text-sm font-bold",
    };

    return (
        <div className="flex items-center gap-2" title={`Match Score: ${score}%`}>
            <div className={cn("relative flex items-center justify-center rounded-full bg-white", sizeClasses[size], colorClass)}>
                {/* SVG Circle Progress */}
                <svg className="-rotate-90 w-full h-full p-0.5" viewBox="0 0 44 44">
                    {/* Background Circle */}
                    <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-gray-100"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={cn("transition-all duration-1000 ease-out", progressColor)}
                    />
                </svg>
                <span className={cn("absolute inset-0 flex items-center justify-center font-bold", size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-[10px]' : 'text-xs')}>
                    {score}%
                </span>
            </div>

            {showLabel && (
                <div className="flex flex-col">
                    <span className={cn("text-xs font-semibold", colorClass.split(' ')[0])}>
                        {score >= 80 ? "High Match" : score >= 50 ? "Medium Match" : "Low Match"}
                    </span>
                </div>
            )}
        </div>
    );
}
