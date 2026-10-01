import { EmployeeDetailPageContainer } from '@/containers/employee-detail-page';

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <EmployeeDetailPageContainer id={Number(resolvedParams.id)} />;
}
