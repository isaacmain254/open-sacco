import React, { ChangeEvent } from "react";
// components
import LucideIcon from "./LucideIcon";

type Props = {
  name: string;
  type: string;
  icon?: string;
  placeholder?: string;
  value?: string | number;
  label?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onIconClick?: () => void;
};

const FormInput: React.FC<Props> = ({
  name,
  type,
  icon,
  placeholder,
  value,
  className,
  label,
  disabled,
  onChange,
  onIconClick,
}) => {
  return (
    <div className="relative flex items-center">
      <label htmlFor={name}>
        {label}
        <input
          className={` border border-gray-300  rounded-md px-4 py-2  outline-none  dark:bg-blue-900 dark:text-white dark:border-slate-500 ${
            disabled ? "cursor-not-allowed" : ""
          } ${className}`}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="true"
          id={name}
          disabled={disabled}
        />
        <i
          onClick={onIconClick}
          className="absolute  right-3 bottom-3 cursor-pointer"
        >
          {icon && <LucideIcon name={icon} size={20} />}
        </i>
      </label>
    </div>
  );
};

export default FormInput;
