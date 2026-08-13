export type WaterfallSide = 'BUY' | 'SELL';
export type WaterfallInstrumentType = 'BOND' | 'FUTURES';
export type WaterfallStepInstrumentType = WaterfallInstrumentType | 'BOTH';
export type WaterfallRuleMatchType = 'RHS_GROUP' | 'CATCH_ALL';
export type WaterfallManagerTab = 'bucketSetup' | 'tenorInstruments' | 'rules' | 'preview' | 'history';
export type WaterfallPreviewMode = 'rhsGroup' | 'portfolio';

export type WaterfallBucket = {
  bucketId: number;
  code: string;
  label: string;
  displayOrder: number;
  minDuration: number | null;
  maxDuration: number | null;
};

export type WaterfallTenorInstrument = {
  tenorInstrumentId?: number | null;
  securityId: string;
  cusip?: string | null;
  description?: string | null;
  instrumentType: WaterfallInstrumentType;
  displayOrder: number;
};

export type WaterfallTenorInstrumentBucket = {
  bucketId: number;
  bucketCode: string;
  bucketLabel: string;
  side: WaterfallSide;
  instruments: WaterfallTenorInstrument[];
};

export type WaterfallRuleStep = {
  ruleStepId?: number | null;
  stepOrder: number;
  tenorBucketId: number;
  tenorBucketCode: string;
  tenorBucketLabel: string;
  instrumentType: WaterfallStepInstrumentType;
};

export type WaterfallRuleRow = {
  durationBucketId: number;
  durationBucketCode: string;
  durationBucketLabel: string;
  side: WaterfallSide;
  steps: WaterfallRuleStep[];
};

export type WaterfallRuleSet = {
  ruleSetId?: number | null;
  name: string;
  matchType: WaterfallRuleMatchType;
  rhsGroupCode?: string | null;
  displayOrder: number;
  rules: WaterfallRuleRow[];
};

export type WaterfallGraph = {
  buckets: WaterfallBucket[];
  tenorInstrumentBuckets: WaterfallTenorInstrumentBucket[];
  ruleSets: WaterfallRuleSet[];
};

export type WaterfallResolvedInstrument = WaterfallTenorInstrument & {
  stepOrder: number;
  durationBucketId: number;
  tenorBucketId: number;
  ruleSetId?: number | null;
};

export type WaterfallResolveResult = {
  status: 'RESOLVED' | 'EMPTY';
  reason?: 'NO_DURATION_BUCKET' | 'NO_RULE_SET' | 'NO_RULE_ROW';
  side: WaterfallSide;
  durationBucket?: WaterfallBucket | null;
  ruleSet?: WaterfallRuleSet | null;
  instruments: WaterfallResolvedInstrument[];
};
