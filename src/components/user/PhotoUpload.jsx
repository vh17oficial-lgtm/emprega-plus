import { useRef } from 'react';

export default function PhotoUpload({ photo, onPhotoChange }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onPhotoChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4">
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-20 h-20 rounded-full border-2 border-dashed border-gray-300 hover:border-indigo-400 cursor-pointer overflow-hidden bg-gray-50 flex items-center justify-center transition-colors group shrink-0"
      >
        {photo ? (
          <img src={photo} alt="Foto" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <svg className="w-6 h-6 mx-auto text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">Foto de perfil</p>
        <p className="text-xs text-gray-400 mt-0.5">Opcional • JPG ou PNG</p>
        {photo && (
          <button
            type="button"
            onClick={() => onPhotoChange(null)}
            className="text-xs text-red-500 hover:text-red-700 mt-1 cursor-pointer"
          >
            Remover foto
          </button>
        )}
      </div>
    </div>
  );
}
