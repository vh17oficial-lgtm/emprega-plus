import { useState } from 'react';
import { Star, Send, CheckCircle } from 'lucide-react';

export default function UserReviews() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="py-10 px-6">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle className="h-9 w-9 text-emerald-400 mx-auto mb-3" />
          <p className="text-base font-semibold text-white">Obrigado pela sua avaliação!</p>
          <p className="text-sm text-white/50 mt-1">Sua opinião nos ajuda a melhorar.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-6 border-t border-white/10">
      <div className="max-w-md mx-auto text-center">
        <p className="text-sm font-medium text-white/50 mb-3">Avalie sua experiência</p>

        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-1 cursor-pointer transition-transform hover:scale-110"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  star <= (hover || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Deixe um comentário (opcional)"
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-sm text-white placeholder-white/40 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={rating === 0}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="h-4 w-4" />
            Enviar avaliação
          </button>
        </form>
      </div>
    </section>
  );
}
