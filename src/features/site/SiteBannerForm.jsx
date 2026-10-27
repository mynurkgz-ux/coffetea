import React, { useState } from 'react';
import { Field, Modal } from '../../shared/ui/index.jsx';
import { btnCls, btnGhost, inputCls } from '../../shared/ui/styles.js';
import { shrink } from '../../shared/lib/utils.js';

export function SiteBannerForm({ banner, onSave, onDelete, onClose }) {
  const [image, setImage] = useState(banner?.img || '');
  const [imageError, setImageError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setImageError('');
      setImage(await shrink(file, 700));
    } catch (cause) {
      console.error('Failed to process site banner image:', cause);
      setImageError('Не удалось обработать изображение. Выберите другой файл.');
    }
  }

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const title = form.elements.title.value.trim();
    const text = form.elements.text.value.trim();
    if (!title || !text || !image) {
      setError('Заполните заголовок и описание и добавьте изображение.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        title,
        text,
        img: image,
        buttonText: form.elements.buttonText.value.trim() || 'Открыть меню',
        active: form.elements.active.checked,
        order: Number(form.elements.order.value) || 0,
        t: banner?.t
      });
    } catch (cause) {
      setError(cause.message || 'Не удалось сохранить баннер.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={banner ? 'Изменить баннер' : 'Новый баннер'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="aspect-[16/7] overflow-hidden rounded-2xl border border-dashed border-[var(--border)] bg-[var(--field)]">
          {image
            ? <img src={image} alt="Предпросмотр баннера" className="h-full w-full object-cover" />
            : <div className="grid h-full place-items-center text-sm font-semibold text-[var(--soft)]">Изображение баннера</div>}
        </div>
        <label className={`${btnGhost} inline-flex w-full cursor-pointer items-center justify-center`}>
          {image ? 'Заменить изображение' : 'Выбрать изображение'}
          <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
        </label>
        {imageError && <p role="alert" className="text-sm font-semibold text-red-700">{imageError}</p>}
        <Field label="Заголовок">
          <input name="title" defaultValue={banner?.title || ''} maxLength={80} required className={inputCls} />
        </Field>
        <Field label="Описание">
          <textarea name="text" defaultValue={banner?.text || ''} maxLength={240} rows={3} required className={`${inputCls} resize-y`} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Текст кнопки">
            <input name="buttonText" defaultValue={banner?.buttonText || 'Открыть меню'} maxLength={24} className={inputCls} />
          </Field>
          <Field label="Порядок">
            <input name="order" type="number" min="0" defaultValue={banner?.order || 0} className={inputCls} />
          </Field>
        </div>
        <label className="flex items-center gap-3 rounded-xl bg-[var(--field)] p-3 text-sm font-semibold">
          <input name="active" type="checkbox" defaultChecked={banner?.active ?? true} className="h-4 w-4 accent-[var(--accent)]" />
          Показывать на сайте
        </label>
        {error && <p role="alert" className="rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <button type="submit" disabled={saving} className={btnCls}>{saving ? 'Сохраняем…' : 'Сохранить баннер'}</button>
        {banner && (
          <button
            type="button"
            onClick={async () => {
              if (!confirmDelete) setConfirmDelete(true);
              else {
                setSaving(true);
                setError('');
                try {
                  await onDelete();
                } catch (cause) {
                  setError(cause.message || 'Не удалось удалить баннер.');
                } finally {
                  setSaving(false);
                }
              }
            }}
            disabled={saving}
            className="w-full rounded-full border-2 border-red-200 py-3 font-bold text-red-600"
          >
            {confirmDelete ? 'Точно удалить баннер?' : 'Удалить баннер'}
          </button>
        )}
      </form>
    </Modal>
  );
}
