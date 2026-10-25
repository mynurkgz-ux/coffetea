export const inputCls="w-full h-12 rounded-xl border-2 border-[var(--border)] bg-[var(--field)] px-3 font-medium outline-none focus:border-[var(--soft2)]";
export const btnCls="w-full h-12 rounded-full bg-[var(--accent)] text-white font-bold";
export const btnGhost="w-full h-11 rounded-full border-2 border-[var(--border)] font-bold text-[var(--soft)] bg-white";

// ===== Общие кусочки интерфейса, из которых собраны остальные экраны =====

// Field — подпись над полем ввода. {children} — это само поле (input,
// select и т.п.), которое передают внутрь при использовании: <Field label="Email"><input .../></Field>
