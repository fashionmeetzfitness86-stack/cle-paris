import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

type BaseProps = {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  required?: boolean;
};

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { as?: 'input' };
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { as: 'textarea'; rows?: number };
type SelectProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { as: 'select'; children: ReactNode };

type FormFieldProps = InputProps | TextareaProps | SelectProps;

const labelClass = 'block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5';
const inputClass =
  'w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2 placeholder-[#57534e] focus:outline-none focus:border-[#c8b89a] transition-colors duration-200';
const errorClass = 'mt-1 text-[11px] text-[#f87171]';
const hintClass = 'mt-1 text-[11px] text-[#57534e]';

export default function FormField(props: FormFieldProps) {
  const { label, id, error, hint, required, as, ...rest } = props as FormFieldProps & { as?: 'input' | 'textarea' | 'select' };

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}{required && <span className="text-[#f87171] ml-0.5">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          className={`${inputClass} resize-none`}
          rows={(props as TextareaProps).rows ?? 4}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : as === 'select' ? (
        <select id={id} className={inputClass} {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}>
          {(props as SelectProps).children}
        </select>
      ) : (
        <input
          id={id}
          className={inputClass}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && <p className={errorClass}>{error}</p>}
      {hint && !error && <p className={hintClass}>{hint}</p>}
    </div>
  );
}
