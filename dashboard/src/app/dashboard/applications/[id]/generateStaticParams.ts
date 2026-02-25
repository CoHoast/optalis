import { mockApplications } from '@/lib/mock-data';

export function generateStaticParams() {
  return mockApplications.map((app) => ({
    id: app.id,
  }));
}
