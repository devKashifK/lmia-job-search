import { useSession } from "@/hooks/use-session";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getRemainingCredits } from "@/lib/api/credits";

export function useCheckCredits() {
    const { session } = useSession();
    const { toast } = useToast();
    const router = useRouter();

    const checkCredits = async (requiredCredits: number = 1): Promise<boolean> => {
        if (session?.trial) return true;
        if (!session?.user?.id) {
            toast({
                title: 'Error',
                description: 'You must be logged in to perform this action',
                variant: 'destructive',
            });
            return false;
        }

        try {
            const remaining = await getRemainingCredits(session.user.id);

            // If remaining is Infinity, it means they have an unlimited plan
            if (remaining === Infinity) return true;

            if (remaining < requiredCredits) {
                toast({
                    title: 'Insufficient Credits',
                    description: `This feature requires ${requiredCredits} credits. You have ${remaining} remaining.`,
                    variant: 'destructive',
                });
                router.push('/dashboard/credits');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error checking credits:', error);
            toast({
                title: 'Error',
                description: 'Unable to verify credits. Please try again.',
                variant: 'destructive',
            });
            return false;
        }
    };

    return { checkCredits };
}
