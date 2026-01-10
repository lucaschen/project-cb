import type { ErrorDetails } from "./types";

export default class NotFoundError extends Error {
  details?: ErrorDetails;

  constructor(message: string, details?: ErrorDetails) {
    super(message);

    this.name = "NotFoundError";
    this.message = message ?? "Resource not found.";
    this.details = details;

    const error = new Error(this.message);
    error.name = this.name;
    this.stack = error.stack;
  }
}
