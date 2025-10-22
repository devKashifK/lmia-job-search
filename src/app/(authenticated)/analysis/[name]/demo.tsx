'use client';
import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  MapPin,
  Hash,
  Briefcase,
  Users,
  Building2,
  Filter,
  X,
  Calendar,
  Database,
  Download,
  ArrowLeft, // Import ArrowLeft
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// --- SUB-COMPONENTS ---

// Icon mapping to keep data serializable
const ICONS = {
  TrendingUp,
  MapPin,
  Hash,
  Briefcase,
  Users,
};

const MetricCard = ({ label, value, subtitle, trend, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </p>
          {/* Changed font size from text-3xl to text-xl */}
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
          {icon}
        </div>
      </div>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  );
};

const DashboardCard = ({
  title,
  subtitle,
  icon: Icon,
  children,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:border-emerald-400 transition-all duration-300 flex flex-col ${className}`}
    >
      <div className="flex items-center gap-2 mb-3 p-4 pb-0">
        <div className="p-1.5 bg-emerald-50 rounded-md">
          <Icon className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-[11px] text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="flex-grow h-full w-full">{children}</div>
    </div>
  );
};

const DonutChart = ({ data, centerValue, centerLabel }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90;

  const paths = data.map((item, index) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    const pathData = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
      `Z`,
    ].join(' ');
    return {
      pathData,
      color: item.color,
      label: item.label,
      value: item.value,
      percentage: percentage.toFixed(1),
      index,
    };
  });

  const displayData =
    hoveredIndex !== null && paths[hoveredIndex] ? paths[hoveredIndex] : null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="20"
          />
          {paths.map((path) => (
            <path
              key={path.index}
              d={path.pathData}
              fill={path.color}
              className="transition-all duration-200 cursor-pointer"
              style={{
                opacity:
                  hoveredIndex === null || hoveredIndex === path.index
                    ? 1
                    : 0.4,
                transform:
                  hoveredIndex === path.index ? 'scale(1.02)' : 'scale(1)',
                transformOrigin: '50% 50%',
              }}
              onMouseEnter={() => setHoveredIndex(path.index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
          <circle cx="50" cy="50" r="25" fill="white" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none text-center">
          {displayData ? (
            <>
              <div className="text-2xl font-bold text-gray-900">
                {displayData.value}
              </div>
              <div className="text-xs text-gray-500">
                {displayData.percentage}%
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-900">
                {centerValue}
              </div>
              <div className="text-xs text-gray-500">{centerLabel}</div>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 cursor-pointer transition-opacity"
            style={{
              opacity:
                hoveredIndex === null || hoveredIndex === index ? 1 : 0.4,
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600 font-medium">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AreaChart = ({ data, color = '#10b981' }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 1;
  const minValue = data.length > 0 ? Math.min(...data.map((d) => d.value)) : 0;
  const range = maxValue - minValue || 1;
  const width = 400;
  const height = 220;
  const padding = 20;

  const points =
    data.length > 1
      ? data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
          const y =
            height -
            padding -
            20 -
            ((d.value - minValue) / range) * (height - 2 * padding - 20);
          return { x, y, value: d.value, year: d.year };
        })
      : [];

  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  const areaData =
    points.length > 0
      ? `${pathData} L ${points[points.length - 1].x} ${
          height - padding - 20
        } L ${points[0].x} ${height - padding - 20} Z`
      : '';

  return (
    <div className="relative w-full h-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
            <stop
              offset="100%"
              style={{ stopColor: color, stopOpacity: 0.05 }}
            />
          </linearGradient>
        </defs>
        <path d={areaData} fill="url(#areaGradient)" />
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === index ? '6' : '4'}
              fill="white"
              stroke={color}
              strokeWidth="2"
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {hoveredIndex === index && (
              <g>
                <rect
                  x={point.x - 30}
                  y={point.y - 35}
                  width="60"
                  height="28"
                  rx="6"
                  fill="rgba(0, 0, 0, 0.8)"
                />
                <text
                  x={point.x}
                  y={point.y - 24}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {point.value}
                </text>
                <text
                  x={point.x}
                  y={point.y - 13}
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                >
                  {point.year}
                </text>
              </g>
            )}
          </g>
        ))}
        <line
          x1={padding}
          y1={height - padding - 20}
          x2={width - padding}
          y2={height - padding - 20}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        {points.map((point, index) => (
          <text
            key={`label-${index}`}
            x={point.x}
            y={height - padding + 12}
            textAnchor="middle"
            fontSize="12"
            fill="#6b7280"
            style={{ fontWeight: hoveredIndex === index ? 700 : 500 }}
          >
            {point.year}
          </text>
        ))}
      </svg>
    </div>
  );
};

const BarChart = ({ data, maxValue }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const max =
    maxValue || (data.length > 0 ? Math.max(...data.map((d) => d.value)) : 1);

  return (
    <div className="space-y-3 h-full flex flex-col justify-center p-4">
      {data.map((item, index) => {
        const percentage = max > 0 ? (item.value / max) * 100 : 0;
        const isHovered = hoveredIndex === index;
        return (
          <div
            key={index}
            className="space-y-1 transition-all duration-200"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{ opacity: hoveredIndex === null || isHovered ? 1 : 0.5 }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">{item.label}</span>
              <span className="text-gray-900 font-semibold">
                {item.value.toLocaleString()}
              </span>
            </div>
            <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden group">
              <div
                className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color,
                  transform: isHovered ? 'scaleY(1.1)' : 'scaleY(1)',
                }}
              />
              {isHovered && (
                <div className="absolute inset-0 flex items-center justify-end pr-3">
                  <span className="text-xs font-bold text-white drop-shadow-lg">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ColumnChart = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 1;

  return (
    <div className="h-full flex items-end justify-around gap-4 p-4">
      {data.map((item, index) => {
        const heightPercentage =
          maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const isHovered = hoveredIndex === index;
        return (
          <div
            key={index}
            className="flex-1 flex flex-col items-center gap-2 transition-all duration-200 h-full"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{ opacity: hoveredIndex === null || isHovered ? 1 : 0.5 }}
          >
            <div className="relative w-full flex items-end justify-center h-full">
              {isHovered && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg whitespace-nowrap z-10">
                  {item.value} ({heightPercentage.toFixed(1)}%)
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                </div>
              )}
              <div
                className="w-full rounded-t-lg transition-all duration-500 ease-out cursor-pointer relative overflow-hidden"
                style={{
                  height: `${heightPercentage}%`,
                  backgroundColor: item.color,
                  minHeight: '2px',
                  transform: isHovered ? 'scaleX(1.05)' : 'scaleX(1)',
                }}
              >
                <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity" />
              </div>
            </div>
            <span
              className="text-xs text-gray-600 text-center font-medium transition-all"
              style={{ fontWeight: isHovered ? 700 : 500 }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// --- MAIN Demo COMPONENT ---

function Demo() {
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [filters, setFilters] = useState({ state: '', city: '', noc: '' });

  // Centralized data source
  const allData = useMemo(
    () => ({
      metricCards: [
        {
          label: 'Growth Rate',
          value: 'N/A',
          subtitle: 'Year-over-year change',
          icon: 'TrendingUp',
        },
        {
          label: 'Top Location',
          value: 'British Columbia',
          subtitle: 'Most common state',
          icon: 'MapPin',
        },
        {
          label: 'Top NOC Code',
          value: '13100',
          subtitle: 'Most frequent NOC code',
          icon: 'Hash',
        },
        {
          label: 'Common Role',
          value: 'Long Haul Truck Driver',
          subtitle: 'Most frequent job title',
          icon: 'Briefcase',
        },
        {
          label: 'Total Positions',
          value: '8',
          subtitle: 'Active job postings',
          icon: 'Users',
        },
      ],
      charts: {
        locationDistribution: {
          data: [
            {
              label: 'Surrey',
              value: 5,
              color: '#6366f1',
              state: 'British Columbia',
            },
            {
              label: 'Chilliwack',
              value: 2,
              color: '#8b5cf6',
              state: 'British Columbia',
            },
            {
              label: 'Port Coquitlam',
              value: 1,
              color: '#14b8a6',
              state: 'British Columbia',
            },
            { label: 'Calgary', value: 4, color: '#f59e0b', state: 'Alberta' },
            { label: 'Toronto', value: 6, color: '#ef4444', state: 'Ontario' },
          ],
          centerValue: '8',
          centerLabel: 'Total',
        },
        jobCategories: {
          data: [
            { label: 'Transportation', value: 5, color: '#6366f1' },
            { label: 'Logistics', value: 2, color: '#8b5cf6' },
            { label: 'Services', value: 1, color: '#14b8a6' },
          ],
          centerValue: '8',
          centerLabel: 'Total',
        },
        hiringTrends: [
          { year: '2022', value: 2.0 },
          { year: '2023', value: 0.8 },
          { year: '2024', value: 1.8 },
          { year: '2025', value: 1.9 },
        ],
        topCities: [
          {
            label: 'Surrey',
            value: 5,
            color: '#6366f1',
            state: 'British Columbia',
          },
          {
            label: 'Chilliwack',
            value: 3,
            color: '#8b5cf6',
            state: 'British Columbia',
          },
          {
            label: 'Port Coquitlam',
            value: 2,
            color: '#14b8a6',
            state: 'British Columbia',
          },
          { label: 'Calgary', value: 4, color: '#f59e0b', state: 'Alberta' },
          { label: 'Toronto', value: 6, color: '#ef4444', state: 'Ontario' },
        ],
        nocCodeDistribution: [
          { label: '13100', value: 4, color: '#6366f1' },
          { label: '73100', value: 3, color: '#8b5cf6' },
          { label: '82031', value: 1, color: '#14b8a6' },
        ],
        topJobTitles: [
          {
            label: 'Long Haul Truck Driver',
            value: 3,
            color: '#6366f1',
            noc: '73300',
          },
          {
            label: 'Administrative Assistant',
            value: 3,
            color: '#8b5cf6',
            noc: '13110',
          },
          {
            label: 'Administrative Assistants',
            value: 1,
            color: '#14b8a6',
            noc: '13110',
          },
          {
            label: 'Food Service Supervisor',
            value: 1,
            color: '#10b981',
            noc: '62020',
          },
        ],
      },
    }),
    []
  );

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [filterType]: value };
      if (filterType === 'state') {
        newFilters.city = '';
      }
      return newFilters;
    });
  };

  const dashboardData = useMemo(() => {
    const filteredData = JSON.parse(JSON.stringify(allData));

    if (filters.state) {
      filteredData.charts.topCities = allData.charts.topCities.filter(
        (c) => c.state === filters.state
      );
      filteredData.charts.locationDistribution.data =
        allData.charts.locationDistribution.data.filter(
          (c) => c.state === filters.state
        );
    }
    if (filters.city) {
      filteredData.charts.topCities = filteredData.charts.topCities.filter(
        (c) => c.label === filters.city
      );
    }
    if (filters.noc) {
      filteredData.charts.topJobTitles = allData.charts.topJobTitles.filter(
        (j) => j.noc === filters.noc
      );
    }

    filteredData.charts.locationDistribution.centerValue =
      filteredData.charts.locationDistribution.data
        .reduce((acc, item) => acc + item.value, 0)
        .toString();

    return filteredData;
  }, [filters, allData]);

  const filterOptions = useMemo(
    () => ({
      states: [...new Set(allData.charts.topCities.map((c) => c.state))],
      cities: [
        ...new Set(
          allData.charts.topCities
            .filter((c) => !filters.state || c.state === filters.state)
            .map((c) => c.label)
        ),
      ],
      nocCodes: [...new Set(allData.charts.topJobTitles.map((j) => j.noc))],
    }),
    [filters.state, allData]
  );

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 flex-shrink-0">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section: Filter Toggle + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center"
                aria-label={isFilterOpen ? 'Hide Filters' : 'Show Filters'}
              >
                {isFilterOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Filter className="w-5 h-5" />
                )}
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    D Jones Trucking Ltd
                  </h1>
                  <p className="text-xs text-gray-500">
                    Company Analysis • Real-time Insights
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section: Action Buttons */}
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              {/* Added ArrowLeft icon and padding adjustment */}
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors text-sm shadow-sm flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Container for Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar container */}
        <aside
          className={`transition-all duration-300 ${
            isFilterOpen ? 'w-80' : 'w-0'
          } overflow-hidden flex-shrink-0 bg-white border-r border-gray-200`}
        >
          <FilterSidebar
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
            filters={filters}
          />
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.metricCards.map((card) => {
              const IconComponent = ICONS[card.icon];
              return (
                <MetricCard
                  key={card.label}
                  {...card}
                  icon={<IconComponent className="w-6 h-6 text-emerald-600" />}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-6">
            <DashboardCard
              title="Hiring Trends Over Time"
              subtitle="Job postings by posting date"
              icon={TrendingUp}
              className="h-96 p-0 overflow-hidden"
            >
              <AreaChart
                data={dashboardData.charts.hiringTrends}
                color="#10b981"
              />
            </DashboardCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCard
              title="Location Distribution"
              subtitle="Job postings by state"
              icon={MapPin}
            >
              <DonutChart {...dashboardData.charts.locationDistribution} />
            </DashboardCard>
            <DashboardCard
              title="Top Cities"
              subtitle="Job postings by city location"
              icon={MapPin}
            >
              <BarChart data={dashboardData.charts.topCities} />
            </DashboardCard>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <DashboardCard
              title="Top Job Titles"
              subtitle="Most common positions at this company"
              icon={Users}
            >
              <ColumnChart data={dashboardData.charts.topJobTitles} />
            </DashboardCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCard
              title="NOC Code Distribution"
              subtitle="Most common National Occupational Classification codes"
              icon={Hash}
            >
              <ColumnChart data={dashboardData.charts.nocCodeDistribution} />
            </DashboardCard>
            <DashboardCard
              title="Job Categories"
              subtitle="Distribution by job category"
              icon={Briefcase}
            >
              <DonutChart {...dashboardData.charts.jobCategories} />
            </DashboardCard>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Demo;
