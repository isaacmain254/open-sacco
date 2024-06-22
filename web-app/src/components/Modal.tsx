import React, { FC } from "react";

// components
import LucideIcon from "./LucideIcon";
interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}
const Modal: FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return <div className="w-96 h-72 absolute"></div>;
};

export default Modal;
