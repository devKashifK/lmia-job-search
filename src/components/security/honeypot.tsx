'use client';

import React from 'react';

export default function Honeypot() {
    return (
        <div
            style={{
                opacity: 0,
                position: 'absolute',
                top: 0,
                left: 0,
                height: 0,
                width: 0,
                zIndex: -1,
                overflow: 'hidden',
            }}
            aria-hidden="true"
        >
            <a href="/api/bot-trap" rel="nofollow">
                Do not click this link if you are a human.
            </a>
            {/* 
        Bots scanning for inputs might fill this out.
        Real users won't see it.
      */}
            <input
                type="text"
                name="website_url_honeypot"
                tabIndex={-1}
                autoComplete="off"
                style={{ display: 'none' }}
            />
        </div>
    );
}
