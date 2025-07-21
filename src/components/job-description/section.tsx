import React from 'react';

export const Section = ({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="space-y-4">
    <h2 className="text-2xl font-semibold text-black flex items-center">
      {title}
    </h2>
    <div className="text-black/70 leading-relaxed">{children}</div>
  </div>
);
