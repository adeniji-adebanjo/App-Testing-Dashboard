// src/app/share/layout.tsx
// Isolated share layout - no sidebar, no navigation to other projects

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
