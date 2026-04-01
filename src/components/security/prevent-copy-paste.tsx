'use client';

import { useEffect } from 'react';

export function PreventCopyPaste() {
    useEffect(() => {
        // Temporarily disabled so you can use DevTools in production
        return;

        // Disable Right Click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // Disable Key Combinations
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent F12 (DevTools)
            if (e.key === 'F12') e.preventDefault();

            // Prevent Ctrl+Shift+I/J/C (DevTools)
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
                e.preventDefault();
            }

            // Prevent Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') e.preventDefault();

            // Prevent Cmd+Option+I (Mac DevTools)
            if (e.metaKey && e.altKey && e.key === 'i') e.preventDefault();

            // Copy/cut still blocked
            if (e.ctrlKey && e.key === 'c') e.preventDefault();
            if (e.ctrlKey && e.key === 'x') e.preventDefault();
        };

        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
        };

        const handleCut = (e: ClipboardEvent) => {
            e.preventDefault();
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('cut', handleCut);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('cut', handleCut);
        };
    }, []);

    return null;
}
