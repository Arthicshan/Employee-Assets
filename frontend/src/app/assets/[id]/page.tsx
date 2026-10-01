import { AssetDetailPageContainer } from '@/containers/asset-detail-page';

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <AssetDetailPageContainer id={Number(resolvedParams.id)} />;
}
