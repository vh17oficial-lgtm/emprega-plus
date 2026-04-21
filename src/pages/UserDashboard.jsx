import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import UserSidebar from '../components/user/UserSidebar';
import MobileBottomNav from '../components/user/MobileBottomNav';
import ResumeForm from '../components/user/ResumeForm';
import ResumePreview from '../components/user/ResumePreview';
import UploadResume from '../components/user/UploadResume';
import MyResumes from '../components/user/MyResumes';
import JobList from '../components/user/JobList';
import AppliedJobs from '../components/user/AppliedJobs';
import AutoDispatch from '../components/user/AutoDispatch';
import UserProfile from '../components/user/UserProfile';
import CreditsBar from '../components/user/CreditsBar';
import OnboardingChecklist from '../components/user/OnboardingChecklist';

export default function UserDashboard() {
  const [searchParams] = useSearchParams();
  const { markVagasVisited } = useAppContext();
  const [activeTab, setActiveTab] = useState('curriculo');
  const [resumeData, setResumeData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [tabTransition, setTabTransition] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['curriculo', 'upload', 'meus', 'vagas', 'aplicadas', 'disparo', 'perfil'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'vagas') markVagasVisited();
  }, [activeTab]);

  const handleGenerateResume = (data) => {
    setResumeData(data);
    setShowPreview(true);
  };

  const handleTabChange = (tab) => {
    setTabTransition(true);
    setTimeout(() => {
      setActiveTab(tab);
      setShowPreview(false);
      setTabTransition(false);
    }, 150);
  };

  const tabTitles = {
    curriculo: 'Criar Currículo',
    upload: 'Enviar Currículo',
    meus: 'Meus Currículos',
    vagas: 'Explorar Vagas',
    aplicadas: 'Minhas Candidaturas',
    disparo: 'Disparo Automático',
    perfil: 'Minha Conta',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-4 sm:py-8 pb-24 lg:pb-8 ${activeTab === 'vagas' ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
        <CreditsBar />
        <OnboardingChecklist onNavigate={handleTabChange} />

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          <UserSidebar activeTab={activeTab} onTabChange={handleTabChange} />

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {tabTitles[activeTab]}
              </h2>

              <div className={`transition-all duration-150 ${tabTransition ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                {activeTab === 'curriculo' && (
                  showPreview && resumeData
                    ? <ResumePreview data={resumeData} onBack={() => setShowPreview(false)} />
                    : <ResumeForm onGenerate={handleGenerateResume} />
                )}

                {activeTab === 'upload' && <UploadResume />}
                {activeTab === 'meus' && <MyResumes />}
                {activeTab === 'vagas' && <JobList />}
                {activeTab === 'aplicadas' && <AppliedJobs />}
                {activeTab === 'disparo' && <AutoDispatch />}
                {activeTab === 'perfil' && <UserProfile />}
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="hidden lg:block">
        <Footer />
      </div>
      <MobileBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
