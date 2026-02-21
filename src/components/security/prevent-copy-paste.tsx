'use client';

import { useEffect } from 'react';

export function PreventCopyPaste() {
    useEffect(() => {
        // Only run in production
        if (process.env.NODE_ENV !== 'production') {
            return;
        }

        // Disable Right Click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // Disable Key Combinations
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent F12 (DevTools)
            if (e.key === 'F12') {
                e.preventDefault();
            }

            // Prevent Ctrl+Shift+I (DevTools)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
            }

            // Prevent Ctrl+Shift+J (DevTools Console)
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
            }

            // Prevent Ctrl+Shift+C (Inspect Element)
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
            }

            // Prevent Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
            }

            // Prevent Ctrl+C (Copy)
            if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
            }

            // Prevent Ctrl+V (Paste) -- Optional, user might want to paste into search inputs?
            // Leaving paste enabled for better UX in forms, but blocking copy/cut.

            // Prevent Ctrl+X (Cut)
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
