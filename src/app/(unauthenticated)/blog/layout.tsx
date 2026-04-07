import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Knowledge Maze – JobMaze Blog",
  description: "Expert LMIA guides, immigration updates, and industry insights curated specifically for professionals navigating the Canadian landscape.",
  openGraph: {
    title: "The Knowledge Maze – JobMaze Blog",
    description: "Expert LMIA guides, immigration updates, and industry insights curated specifically for professionals navigating the Canadian landscape.",
    type: "website",
    url: "https://jobmaze.ca/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
