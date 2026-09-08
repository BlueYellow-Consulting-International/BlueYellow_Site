/** JSON-RPC 2.0 wire types used by the Flectra /jsonrpc endpoint. */
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: 'call';
  params: {
    service: 'common' | 'object' | 'db';
    method: string;
    args: unknown[];
  };
  id?: number;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: {
    name?: string;
    message?: string;
    arguments?: unknown[];
    debug?: string;
  };
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id?: number;
  result?: T;
  error?: JsonRpcError;
}

/** Subset of res.partner fields we write. */
export interface ResPartnerVals {
  name: string;
  email?: string;
  is_company?: boolean;
  phone?: string;
}

/** Subset of crm.lead fields we write. */
export interface CrmLeadVals {
  name: string;
  partner_id?: number;
  contact_name?: string;
  email_from?: string;
  description?: string;
}
