/** Base class for every error raised by the Flectra client. */
export class FlectraError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Credentials/database problem — the call will not succeed until config changes. */
export class FlectraAuthError extends FlectraError {}

/** Flectra unreachable, timed out, or answered with a 5xx — transient, worth retrying. */
export class FlectraUnavailableError extends FlectraError {}

/** Flectra rejected the call itself (unknown model/field, bad domain, constraint violation). */
export class FlectraRequestError extends FlectraError {
  constructor(
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

/** True when the error is transient and a later attempt may succeed. */
export function isRetryableFlectraError(error: unknown): boolean {
  return error instanceof FlectraUnavailableError || error instanceof FlectraAuthError;
}
