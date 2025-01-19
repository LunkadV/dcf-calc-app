// components/InputField.tsx
interface InputFieldProps {
  label: string;
  name: string;
  value: number;
  onChange: (name: string, value: number) => void;
  type?: "number" | "range";
  min?: number;
  max?: number;
  step?: number;
  readOnly?: boolean;
}

export default function InputField({
  label,
  name,
  value,
  onChange,
  type = "number",
  min,
  max,
  step,
  readOnly = false,
}: InputFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1" htmlFor={name}>
        {label} {type === "range" && value.toFixed(2)}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(name, parseFloat(e.target.value))}
        className={`w-full p-2 border rounded ${readOnly ? "bg-gray-100" : ""}`}
        {...(min !== undefined && { min })}
        {...(max !== undefined && { max })}
        {...(step !== undefined && { step })}
        readOnly={readOnly}
      />
    </div>
  );
}
