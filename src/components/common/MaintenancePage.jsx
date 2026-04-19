export default function MaintenancePage({ title, message }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🔧</div>
        <h1 className="text-2xl font-bold text-white mb-3">{title || 'Em manutenção'}</h1>
        <p className="text-gray-300">{message || 'Estamos realizando melhorias. Voltamos em breve!'}</p>
        <p className="text-xs text-gray-500 mt-6">Emprega+</p>
      </div>
    </div>
  );
}
