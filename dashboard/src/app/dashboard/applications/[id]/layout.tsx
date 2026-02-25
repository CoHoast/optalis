import { mockApplications } from '@/lib/mock-data';

export function generateStaticParams() {
  return mockApplications.map((app) => ({
    id: app.id,
  }));
}

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
