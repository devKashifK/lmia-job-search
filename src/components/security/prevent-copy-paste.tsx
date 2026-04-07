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

        // Disable All Key Combinations (Ctrl+Key, Cmd+Key, Alt+Key)
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent F12 (DevTools)
            if (e.key === 'F12') {
                e.preventDefault();
                return;
            }

            // Block any combination involving Ctrl, Meta(Cmd), or Alt
            if (e.ctrlKey || e.metaKey || e.altKey) {
                // List of keys to potentially WHITELIST if absolutely necessary (e.g., Tab for accessibility)
                const whitelist = ['Tab', 'Space', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
                
                if (!whitelist.includes(e.key)) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
            }
        };

        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
        };

        const handleCut = (e: ClipboardEvent) => {
            e.preventDefault();
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown, true); // Use capture to intercept early
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
