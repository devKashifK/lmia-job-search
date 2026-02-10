import { StandardPageLayout } from '@/components/ui/standard-layout';

export default function ResourcesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <StandardPageLayout>
            {children}
        </StandardPageLayout>
    );
}
