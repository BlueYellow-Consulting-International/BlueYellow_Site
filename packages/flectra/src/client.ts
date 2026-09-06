import { FlectraAuthError, FlectraRequestError, FlectraUnavailableError } from './errors';
import type { JsonRpcRequest, JsonRpcResponse } from './types';

export interface FlectraClientConfig {
  /** Base URL, e.g. http://localhost:7073 — no trailing slash needed. */
  baseUrl: string;
  /** Flectra database name. */
  db: string;
  /** Login of the technical user. */
  user: string;
  /** API key of the technical user (never a password). */
  apiKey: string;
  /** Per-request timeout in milliseconds. Default: 15000. */
  timeoutMs?: number;
}

/**
 * Minimal typed JSON-RPC client for Flectra (Odoo-style external API).
 *
 * Transport only — it knows nothing about leads, partners, NestJS, or the outbox.
 */
export class FlectraClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private uidPromise: Promise<number> | null = null;

  constructor(private readonly config: FlectraClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.timeoutMs = config.timeoutMs ?? 15_000;
  }

  /** Authenticate once and cache the resulting user id. */
  private uid(): Promise<number> {
    this.uidPromise ??= this.authenticate().catch((error: unknown) => {
      this.uidPromise = null; // allow a fresh attempt on the next call
      throw error;
    });
    return this.uidPromise;
  }

  private async authenticate(): Promise<number> {
    const uid = await this.rpc<number>('common', 'authenticate', [
      this.config.db,
      this.config.user,
      this.config.apiKey,
      {},
    ]);
    if (typeof uid !== 'number') {
      throw new FlectraAuthError(
        `Flectra rejected credentials for db "${this.config.db}" / user "${this.config.user}"`,
      );
    }
    return uid;
  }

  /** Call a model method, e.g. call('crm.lead', 'create', [vals]). */
  async call<T = unknown>(
    model: string,
    method: string,
    args: unknown[] = [],
    kwargs: Record<string, unknown> = {},
  ): Promise<T> {
    const uid = await this.uid();
    return this.rpc<T>('object', 'execute_kw', [
      this.config.db,
      uid,
      this.config.apiKey,
      model,
      method,
      args,
      kwargs,
    ]);
  }

  private async rpc<T>(
    service: JsonRpcRequest['params']['service'],
    method: string,
    args: unknown[],
  ): Promise<T> {
    const body: JsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'call',
      params: { service, method, args },
      id: Date.now(),
    };

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      throw new FlectraUnavailableError(
        `Flectra at ${this.baseUrl} is unreachable: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    if (!response.ok) {
      throw new FlectraUnavailableError(
        `Flectra answered HTTP ${response.status} ${response.statusText}`,
      );
    }

    let payload: JsonRpcResponse<T>;
    try {
      payload = (await response.json()) as JsonRpcResponse<T>;
    } catch (error) {
      throw new FlectraUnavailableError(
        `Flectra returned a non-JSON response: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    if (payload.error) {
      const detail = payload.error.data?.message ?? payload.error.message;
      const name = payload.error.data?.name ?? '';
      if (/access|auth/i.test(name) || /access|permission/i.test(detail ?? '')) {
        throw new FlectraAuthError(`Flectra access denied: ${detail}`);
      }
      throw new FlectraRequestError(`Flectra rejected the call: ${detail}`, payload.error.data);
    }

    return payload.result as T;
  }
}
