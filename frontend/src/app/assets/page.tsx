import { Suspense } from 'react';
import { AssetsPageContainer } from '@/containers/assets-page';

export default function AssetsPage() {
  return <Suspense fallback={<p className="text-slate-600">Loading assets...</p>}><AssetsPageContainer /></Suspense>;
}
