import type { ErrorDetails } from "./types";

export default class UnexpectedError extends Error {
  details?: ErrorDetails;

  constructor(message: string, details?: ErrorDetails) {
    super(message);

    this.name = "UnexpectedError";
    this.message = message ?? "Unexpected error.";
    this.details = details;

    const error = new Error(this.message);
    error.name = this.name;
    this.stack = error.stack;
  }
}
