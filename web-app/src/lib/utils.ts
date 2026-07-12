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

const getSafeMessage = (value: unknown): string | null => {
  if (typeof value !== "string") return null;

  const message = value.replace(/\s+/g, " ").trim();
  // Never expose server debug output, stack traces, or database diagnostics.
  if (
    !message ||
    message.length > 500 ||
    /<(?:!doctype|html|head|body)\b|\b(?:traceback|stack trace|integrityerror|databaseerror|operationalerror|programmingerror|validationerror|unique constraint|foreign key constraint|sql(?:ite)?\s+(?:error|exception)|psycopg|django\.db)\b|\b(?:internal server error|bad gateway|service unavailable)\b/i.test(
      message,
    )
  ) {
    return null;
  }

  return message;
};

/** Turns Django REST Framework validation responses into a toast-ready message. */
export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  const directMessage = getSafeMessage(error);
  if (directMessage) return directMessage;
  if (typeof error === "string") return fallback;
  if (error instanceof Error) return getSafeMessage(error.message) ?? fallback;
  if (!error || typeof error !== "object") return fallback;

  const response = error as Record<string, unknown>;
  const detail = getSafeMessage(response.detail);
  if (detail) return detail;
  const message = getSafeMessage(response.message);
  if (message) return message;

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

  return getSafeMessage(messages.join(" ")) || fallback;
};
