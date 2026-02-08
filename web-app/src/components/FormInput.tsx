import React, { ChangeEvent } from "react";
import LucideIcon from "./LucideIcon";

type Props = {
  name?: string;
  type: string;
  placeholder?: string;
  value?: string | number;
  label?: string;
  disabled?: boolean;
  className?: string;
  accept?: string;
  ref?: React.RefObject<HTMLInputElement>;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

const FormInput: React.FC<Props> = ({
  name,
  type,
  placeholder,
  value,
  className,
  label,
  accept,
  disabled,
  onChange,
  ref,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          className={`border border-gray-300 rounded-md px-4 pr-10 py-2 outline-none w-full
            dark:bg-blue-900 dark:text-white dark:border-slate-500
            ${disabled ? "cursor-not-allowed" : ""}
            ${className}`}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          accept={accept}
          onChange={onChange}
          autoComplete="true"
          id={name}
          disabled={disabled}
          ref={ref}
        />

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-800"
          >
            {showPassword ? (
              <LucideIcon name="Eye" size={20} />
            ) : (
              <LucideIcon name="EyeOff" size={20} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormInput;
