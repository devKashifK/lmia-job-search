interface HeaderProps {
  jobTitle: string;
  companyName: string;
  location: string;
  program?: string;
}

export function Header({
  jobTitle,
  companyName,
  location,
  program,
}: HeaderProps) {
  return (
    <div className="border-b p-6 bg-white">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{jobTitle}</h3>
        <p className="text-sm text-gray-600">
          {companyName} • {location}
          {program && <span className="ml-2">• {program}</span>}
        </p>
      </div>
    </div>
  );
}
