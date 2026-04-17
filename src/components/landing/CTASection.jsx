import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative py-16 sm:py-20" style={{ background: 'linear-gradient(135deg, rgba(28, 71, 163, 0.92), rgba(23, 54, 120, 0.95))' }}>
      <div className="mx-auto max-w-7xl px-6 sm:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3">
          Pronto para conquistar seu próximo emprego?
        </h2>
        <p className="text-white/70 max-w-lg mx-auto mb-8 text-base sm:text-lg">
          Milhares de pessoas já estão usando o Emprega+ para se candidatar a vagas com rapidez. Comece agora — é 100% grátis.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/usuario">
            <button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-md hover:scale-[1.01] transition-all duration-300 inline-flex items-center justify-center gap-2 h-14 rounded-xl px-10 text-base cursor-pointer w-full sm:w-auto">
              CRIAR MEU CURRÍCULO AGORA
              <ArrowRight className="ml-1 h-5 w-5" />
            </button>
          </Link>
          <Link to="/usuario?tab=vagas">
            <button className="border border-white/25 text-white bg-transparent hover:bg-white/10 transition-all duration-300 font-medium inline-flex items-center justify-center h-11 rounded-lg px-8 cursor-pointer w-full sm:w-auto">
              Explorar vagas disponíveis
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
