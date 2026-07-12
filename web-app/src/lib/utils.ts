import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const formatFieldName = (field: string) =>
  field.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

/** Turns Django REST Framework validation responses into a toast-ready message. */
export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (!error || typeof error !== "object") return fallback;

  const response = error as Record<string, unknown>;
  if (typeof response.detail === "string") return response.detail;
  if (typeof response.message === "string") return response.message;

  const messages = Object.entries(response).flatMap(([field, value]) => {
    const details = Array.isArray(value)
      ? value.map(String).join(" ")
      : typeof value === "string"
        ? value
        : value && typeof value === "object"
          ? getApiErrorMessage(value, "")
          : "";
    return details ? [`${formatFieldName(field)}: ${details}`] : [];
  });

  return messages.join(" ") || fallback;
};
