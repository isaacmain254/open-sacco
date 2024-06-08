import { icons } from "lucide-react";
import { FC } from "react";

export interface IconProps {
  color?: string;
  size?: number;
  name: unknown;
}

const LucideIcon: FC<IconProps> = ({ name, color, size }) => {
  const Icon = icons[name as keyof typeof icons];
  return <Icon color={color} size={size} />;
};

export default LucideIcon;
