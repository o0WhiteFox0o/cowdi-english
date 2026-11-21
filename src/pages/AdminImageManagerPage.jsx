import { useSEO } from '../hooks/useSEO';
import { SEO_CONFIGS } from '../data/seo-config';
import AdminImageManager from '../features/admin/AdminImageManager';

export default function AdminImageManagerPage() {
  useSEO(SEO_CONFIGS['/admin'] || { title: 'Quản lý tài nguyên ảnh — Cowdi English' });

  return (
    <div className="fade-in container-fluid px-0">
      <AdminImageManager />
    </div>
  );
}
