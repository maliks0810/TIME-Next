import {
  getApiBaseUrl,
  getCreateTestDealerProposalUrl,
  isTestDealerProposalEnabled,
} from "../config/environments";

export type CreateTestDealerInventoryRequest = {
  fundTicker: string;
  numShares: number;
  numUnits: number;
  basketType: string;
  inventoryName: string;
};

export type CreateTestDealerProposalResponse = {
  inventoryId: string;
};

// Match the backend BasketNegotiationOverrides class
type BasketNegotiationOverrides = {
  basketNegotiationOverrideId?: number;
  basketNegotiationId?: number;
  cashFeeOverrideValue?: number | null;
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
};

// Match the backend CreateBasketPostingRequest class
type CreateBasketPostingRequest = {
  basketNegotiationId: number;
  overrides?: BasketNegotiationOverrides;
  createdBy: string;
};

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

async function postJson<TReq extends object, TRes = void>(
  path: string,
  body: TReq,
  signal?: AbortSignal
): Promise<TRes> {
  const url = joinUrl(getApiBaseUrl(), path);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text ? `Request failed (${res.status}): ${text}` : `Request failed (${res.status})`);
  }

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return (await res.json()) as TRes;
  return undefined as TRes;
}

export async function createTestDealerProposal(
  payload: CreateTestDealerInventoryRequest,
  signal?: AbortSignal
): Promise<CreateTestDealerProposalResponse> {
  if (!isTestDealerProposalEnabled()) {
    throw new Error("Test dealer proposal creation is disabled in this environment.");
  }

  const url = getCreateTestDealerProposalUrl();

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text ? `Create test dealer proposal failed (${res.status}): ${text}` : `Create test dealer proposal failed (${res.status})`);
  }

  return (await res.json()) as CreateTestDealerProposalResponse;
}


export async function publishToBbg(
  basketNegotiationId: number,
  createdBy: string,
  cashFeeOverride?: number | null,
  signal?: AbortSignal
): Promise<void> {
  const request: CreateBasketPostingRequest = {
    basketNegotiationId,
    createdBy: createdBy,
  };

  if (cashFeeOverride !== null && cashFeeOverride !== undefined) {
    request.overrides = {
      cashFeeOverrideValue: cashFeeOverride,
    };
  }

  await postJson<CreateBasketPostingRequest>("basketnegotiations/sendtobbg", request, signal);
}

