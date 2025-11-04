import { motion } from 'framer-motion';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionTitle({
  title,
  subtitle,
  className = '',
}: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`text-center max-w-3xl mx-auto mb-12 ${className}`}
    >
      <h2 className="text-2xl lg:text-5xl text-left lg:text-center  font-bold text-gray-900 mb-1 lg:mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-md lg:text-xl text-left lg:text-center text-gray-600">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
