import type { ErrorDetails } from "./types";

export default class InvalidOperationError extends Error {
  details?: ErrorDetails;

  constructor(message: string, details?: ErrorDetails) {
    super(message);

    this.name = "InvalidOperationError";
    this.message = message ?? "Invalid operationo.";
    this.details = details;

    const error = new Error(this.message);
    error.name = this.name;
    this.stack = error.stack;
  }
}
