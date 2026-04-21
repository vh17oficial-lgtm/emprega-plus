import { Link } from 'react-router-dom';
import { cacheBust } from '../../utils/cacheBust';

export default function Footer() {
  return (
    <footer className="text-white/50 mt-auto" style={{ background: 'linear-gradient(180deg, rgba(12, 17, 34, 0.92) 0%, rgba(14, 20, 40, 0.96) 100%)' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={cacheBust("/logo-escudo.png")} alt="E+" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-bold text-white">Emprega+</span>
            </div>
            <p className="text-sm leading-relaxed">
              A plataforma que conecta você às melhores oportunidades de emprego do Brasil.
            </p>
          </div>

          {[
            { title: 'Plataforma', links: [
              { label: 'Criar Currículo', to: '/usuario' },
              { label: 'Ver Vagas', to: '/usuario?tab=vagas' },
              { label: 'Disparo Automático', to: '/usuario?tab=disparo' },
            ]},
            { title: 'Empresa', links: [
              { label: 'Sobre nós', to: '#' },
              { label: 'Contato', to: '#' },
              { label: 'Blog', to: '#' },
            ]},
            { title: 'Legal', links: [
              { label: 'Termos de Uso', to: '#' },
              { label: 'Privacidade', to: '#' },
              { label: 'Cookies', to: '#' },
            ]},
          ].map((col) => (
            <div key={col.title}>
              <p className="font-semibold text-white mb-3 text-sm">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.to.startsWith('/') ? (
                      <Link to={link.to} className="text-sm text-white/40 hover:text-white/70 transition-colors">{link.label}</Link>
                    ) : (
                      <a href={link.to} className="text-sm text-white/40 hover:text-white/70 transition-colors">{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-white/40 mb-2">
            Quer anunciar uma vaga? Entre em contato:{' '}
            <a
              href="mailto:empregaplusadm@gmail.com"
              className="text-white/60 hover:text-white/90 underline underline-offset-2 transition-colors"
            >
              empregaplusadm@gmail.com
            </a>
          </p>
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Emprega+. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
