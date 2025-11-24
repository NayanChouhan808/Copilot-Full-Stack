"use client";

import dynamic from "next/dynamic";

const CodeGeneratorClient = dynamic(
  () => import("@/components/CodeGeneratorClient"),
  { ssr: false }
);

export default function HomePage() {
  return <CodeGeneratorClient />;
}
