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
  onChange,
  onIconClick,
}) => {
  return (
    <div className="relative flex w-full items-center">
      <label htmlFor="label">
        {label}
        <input
          className={` border border-gray-300 rounded-md px-4 py-2  outline-none ${className}`}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        <i onClick={onIconClick} className="absolute  right-3 bottom-3">
          {icon && <LucideIcon name={icon} size={20} />}
        </i>
      </label>
    </div>
  );
};

export default FormInput;
