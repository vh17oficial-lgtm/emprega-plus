import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminDashboard from '../components/admin/AdminDashboard';
import JobManager from '../components/admin/JobManager';
import JobGenerator from '../components/admin/JobGenerator';
import LandingEditor from '../components/admin/LandingEditor';
import SectionVisibilityManager from '../components/admin/SectionVisibilityManager';
import PlansManager from '../components/admin/PlansManager';
import DispatcherConfig from '../components/admin/DispatcherConfig';
import UpsellTextsEditor from '../components/admin/UpsellTextsEditor';
import SiteConfigEditor from '../components/admin/SiteConfigEditor';
import BannerManager from '../components/admin/BannerManager';
import MaintenanceManager from '../components/admin/MaintenanceManager';
import SeoManager from '../components/admin/SeoManager';
import SocialProofManager from '../components/admin/SocialProofManager';
import CompanyManager from '../components/admin/CompanyManager';
import TestimonialManager from '../components/admin/TestimonialManager';
import VideoManager from '../components/admin/VideoManager';
import RotationConfig from '../components/admin/RotationConfig';
import ApplicationManager from '../components/admin/ApplicationManager';
import UserManager from '../components/admin/UserManager';
import TicketManager from '../components/admin/TicketManager';
import CouponManager from '../components/admin/CouponManager';
import EmailTemplateEditor from '../components/admin/EmailTemplateEditor';
import AuditLogViewer from '../components/admin/AuditLogViewer';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie vagas, planos, disparador e personalize a plataforma.</p>
          </div>
          <Link
            to="/usuario"
            className="text-sm text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors self-start"
          >
            ← Voltar ao painel
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 md:p-8">
              {activeSection === 'dashboard' && <AdminDashboard />}
              {activeSection === 'vagas' && <JobManager />}
              {activeSection === 'gerador' && <JobGenerator />}
              {activeSection === 'landing' && <LandingEditor />}
              {activeSection === 'secoes' && <SectionVisibilityManager />}
              {activeSection === 'empresas' && <CompanyManager />}
              {activeSection === 'depoimentos' && <TestimonialManager />}
              {activeSection === 'videos' && <VideoManager />}
              {activeSection === 'config' && <SiteConfigEditor />}
              {activeSection === 'banner' && <BannerManager />}
              {activeSection === 'manutencao' && <MaintenanceManager />}
              {activeSection === 'seo' && <SeoManager />}
              {activeSection === 'planos' && <PlansManager />}
              {activeSection === 'disparador' && <DispatcherConfig />}
              {activeSection === 'textos' && <UpsellTextsEditor />}
              {activeSection === 'provasocial' && <SocialProofManager />}
              {activeSection === 'rotacao' && <RotationConfig />}
              {activeSection === 'cupons' && <CouponManager />}
              {activeSection === 'emails' && <EmailTemplateEditor />}
              {activeSection === 'candidaturas' && <ApplicationManager />}
              {activeSection === 'usuarios' && <UserManager />}
              {activeSection === 'tickets' && <TicketManager />}
              {activeSection === 'auditoria' && <AuditLogViewer />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
