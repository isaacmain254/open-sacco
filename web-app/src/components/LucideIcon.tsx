import { icons } from "lucide-react";
import { FC } from "react";

export interface IconProps {
  color?: string;
  size?: number;
  name: unknown;
  className?: string;
  onClick?: () => void;
}

const LucideIcon: FC<IconProps> = ({
  name,
  color,
  size,
  className,
  onClick,
}) => {
  const Icon = icons[name as keyof typeof icons];
  return (
    <i className={className} onClick={onClick}>
      <Icon color={color} size={size} />
    </i>
  );
};

export default LucideIcon;
