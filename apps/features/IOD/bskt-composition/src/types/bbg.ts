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

export type CreateBasketPostingRequest = {
  basketNegotiationId: number,
  cashFee?: number|null,
  modifiedBy?: string,
  createdBy?: string
}