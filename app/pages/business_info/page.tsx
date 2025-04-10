import { Suspense } from 'react';
import BusinessInfoPage from './business_info';

export default function Page() {
  return (
    <Suspense fallback={<p>Đang tải...</p>}>
      <BusinessInfoPage />
    </Suspense>
  );
}
