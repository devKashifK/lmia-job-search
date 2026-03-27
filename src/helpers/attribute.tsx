import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
interface AttributeNameProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  table?: string;
}
export function AttributeName({
  name,
  table,
  className = "",
  ...props
}: AttributeNameProps) {
  return (
    <span
      className={cn("truncate", className)}
      data-attribute={name}
      title={name}
      {...props}
    >
      <AttributeKey name={name} table={table} title={name} />
    </span>
  );
}

export function AttributeKey({
  className = "",
  name,
  table,
  ...props
}: {
  name: string;
  table?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  let label = snakeCaseToTitleCase(name);
  const normalizedTable = table?.toLowerCase() || '';
  if (
    normalizedTable === "lmia" &&
    (name === "state" || name === "territory" || name === "province")
  ) {
    label = "Province";
  }
  return (
    <span {...props} className={className}>
      {label}
    </span>
  );
}

export function snakeCaseToTitleCase(str: string) {
  return str
    ?.split("_")
    .map((word) => {
      if (word !== undefined && word.length > 0) {
        const titleCaseWord = word[0].toUpperCase() + word.slice(1);
        return titleCaseWord;
      }
      return "(unknown)";
    })
    .join(" ");
}
