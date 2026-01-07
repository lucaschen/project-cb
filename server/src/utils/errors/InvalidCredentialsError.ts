import type { ErrorDetails } from "./types";

export default class InvalidCredentialsError extends Error {
  details?: ErrorDetails;

  constructor(message: string, details?: ErrorDetails) {
    super(message);

    this.name = "InvalidCredentialsError";
    this.message = message ?? "Invalid request.";
    this.details = details;

    const error = new Error(this.message);
    error.name = this.name;
    this.stack = error.stack;
  }
}
