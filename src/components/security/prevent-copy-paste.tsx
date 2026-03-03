'use client';

import { useEffect } from 'react';

export function PreventCopyPaste() {
    useEffect(() => {
        // Only run in production
        if (process.env.NODE_ENV !== 'production') {
            return;
        }

        // [TEMP: DevTools unblocked for debugging — re-enable when done]
        // Disable Right Click — temporarily disabled
        const handleContextMenu = (_e: MouseEvent) => {
            // e.preventDefault();
        };

        // Key combinations — DevTools shortcuts temporarily allowed for debugging
        const handleKeyDown = (e: KeyboardEvent) => {
            // -- F12, Ctrl+Shift+I/J/C: temporarily open for production debugging --
            // if (e.key === 'F12') e.preventDefault();
            // if (e.ctrlKey && e.shiftKey && e.key === 'I') e.preventDefault();
            // if (e.ctrlKey && e.shiftKey && e.key === 'J') e.preventDefault();
            // if (e.ctrlKey && e.shiftKey && e.key === 'C') e.preventDefault();
            // if (e.ctrlKey && e.key === 'u') e.preventDefault();

            // Copy/cut still blocked
            if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
            }
            if (e.ctrlKey && e.key === 'x') {
                e.preventDefault();
            }
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
