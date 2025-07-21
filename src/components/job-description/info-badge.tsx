import React from 'react';

export const InfoBadge = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center text-sm">
    <div className="text-brand-500 mr-3">{icon}</div>
    <div>
      <p className="font-semibold text-black">{value}</p>
      <p className="text-black/60">{label}</p>
    </div>
  </div>
);
