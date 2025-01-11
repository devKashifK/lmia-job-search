import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
interface AttributeNameProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
}
export function AttributeName({
  name,
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
      <AttributeKey name={name} title={name} />
    </span>
  );
}

export function AttributeKey({
  className = "",
  name,
  ...props
}: {
  name: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props} className={className}>
      {snakeCaseToTitleCase(name)}
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
