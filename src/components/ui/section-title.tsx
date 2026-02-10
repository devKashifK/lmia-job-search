import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SectionTitleProps {
  title: ReactNode;
  subtitle?: string;
  badge?: string;
  className?: string;
  align?: 'left' | 'center';
}

export default function SectionTitle({
  title,
  subtitle,
  badge,
  className = '',
  align = 'center'
}: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`${align === 'center' ? 'text-center mx-auto' : 'text-left'} max-w-4xl mb-16 ${className}`}
    >
      {badge && (
        <span className="inline-block text-brand-600 font-mono text-xs uppercase tracking-widest border border-brand-100 bg-brand-50 px-3 py-1 rounded-full mb-6">
          {badge}
        </span>
      )}
      <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
