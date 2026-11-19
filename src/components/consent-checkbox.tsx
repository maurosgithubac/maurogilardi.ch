import type { ReactNode } from "react";
import "@/styles/consent.css";

type Props = {
  id: string;
  name: string;
  /** Pflichtfeld: Formular lässt sich ohne Häkchen nicht absenden */
  required?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  children: ReactNode;
};

/** Einwilligungs-Häkchen mit Link zur Datenschutzerklärung oder zu den Gönner-Bedingungen. */
export function ConsentCheckbox({ id, name, required = true, checked, onChange, children }: Props) {
  return (
    <div className="mg-consent">
      <input
        id={id}
        name={name}
        type="checkbox"
        required={required}
        checked={checked}
        onChange={onChange ? (event) => onChange(event.target.checked) : undefined}
      />
      <label htmlFor={id}>{children}</label>
    </div>
  );
}
