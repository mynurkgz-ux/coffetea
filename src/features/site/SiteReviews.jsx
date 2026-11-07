import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicParticles } from './PublicParticles.jsx';
import { useLanguage } from '../../shared/ui/index.jsx';

export function SiteReviews({ reviews = [], me, onSubmit, animation = 'soda' }) {
  const {t}=useLanguage();
  const [rating, setRating] = useState(5);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const averageRating = useMemo(
    () => reviews.length
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : null,
    [reviews]
  );

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await onSubmit({
        authorName: form.elements.authorName.value,
        text: form.elements.text.value,
        rating
      });
      form.reset();
      setRating(5);
      setMessage(t('reviewSent'));
    } catch (cause) {
      setError(cause.message || t('reviewError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="reviews" className="relative isolate overflow-hidden bg-[var(--field)] px-5 py-16 sm:px-8 md:py-20">
      <PublicParticles animation={animation}/>
      <div className="relative z-[1] mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_.8fr]">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--accent)]">{t('reviewOpinion')}</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{t('reviewTitle')}</h2>
            {averageRating && <p className="text-sm font-bold text-[var(--soft)]">★ {averageRating} · {reviews.length} {t('reviewCountLabel')}</p>}
          </div>
          {reviews.length ? (
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {reviews.slice(0, 6).map(review => (
                <article key={review.id} className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                  <p aria-label={`${t('ratingLabel')} ${review.rating} ${t('ratingOutOf')}`} className="text-lg tracking-widest text-[var(--accent)]">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#51463f]">{review.text}</p>
                  <p className="mt-4 text-sm font-extrabold">{review.authorName}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl bg-white p-5 text-sm text-[var(--soft)]">{t('noReviews')}</p>
          )}
        </div>
        <div className="h-fit rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-xl font-extrabold">{t('reviewLeave')}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--soft)]">{t('reviewCheck')}</p>
          {me?.role === 'buyer' ? (
            <form onSubmit={submit} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold">{t('yourRating')}</span>
                <span className="flex gap-1" role="group" aria-label={t('rating')}>
                  {[1, 2, 3, 4, 5].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      aria-label={`${value} ${t('ratingOutOf')}`}
                      aria-pressed={rating === value}
                      className={`text-3xl transition hover:scale-110 ${value <= rating ? 'text-[var(--accent)]' : 'text-[#d6d3d1]'}`}
                    >
                      ★
                    </button>
                  ))}
                </span>
              </label>
              <label className="block text-sm font-bold">
                {t('yourName')}
                <input name="authorName" required minLength={2} maxLength={40} className="mt-1.5 w-full rounded-xl border border-[var(--border)] px-4 py-3 font-normal outline-none focus:border-[var(--accent)]" />
              </label>
              <label className="block text-sm font-bold">
                {t('yourReview')}
                <textarea name="text" required minLength={5} maxLength={500} rows={4} className="mt-1.5 w-full resize-y rounded-xl border border-[var(--border)] px-4 py-3 font-normal outline-none focus:border-[var(--accent)]" />
              </label>
              {error && <p role="alert" className="rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-700">{error}</p>}
              {message && <p role="status" className="rounded-xl bg-[var(--field)] p-3 text-sm font-semibold text-[var(--soft)]">{message}</p>}
              <button type="submit" disabled={saving} className="w-full rounded-full bg-[var(--accent)] px-5 py-3 font-extrabold text-white disabled:opacity-60">
                {saving ? t('sending') : t('sendReview')}
              </button>
            </form>
          ) : (
            <div className="mt-5 grid gap-3">
              <Link to="/login?next=%2F" className="rounded-full bg-[var(--accent)] px-5 py-3 text-center text-sm font-extrabold text-white">{t('loginReview')}</Link>
              <Link to="/register?next=%2F" className="rounded-full border border-[var(--border)] px-5 py-3 text-center text-sm font-extrabold">{t('register')}</Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
