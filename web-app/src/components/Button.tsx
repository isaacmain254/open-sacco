import { FC } from "react";

interface ButtonProps {
  text: string | React.ReactNode;
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
}

const Button: FC<ButtonProps> = ({
  text,
  onClick,
  className,
  disabled,
  variant,
}) => {
  const bg =
    variant === "primary" ? "bg- white text-black hover:border-blue-500" : "bg-blue-500 text-white hover:bg-blue-600";
  return (
    <button
      className={`flex justify-center py-2 px-3 rounded-md ${bg} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;
