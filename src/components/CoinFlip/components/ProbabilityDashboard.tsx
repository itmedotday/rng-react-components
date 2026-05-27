import React from 'react';
import { CoinFlipHeader, type CoinFlipHeaderProps } from './CoinFlipHeader';

/** @deprecated Stats moved to {@link CoinFlipHeader}. Use CoinFlipHeader instead. */
export type ProbabilityDashboardProps = CoinFlipHeaderProps;

/** @deprecated Stats moved to {@link CoinFlipHeader}. Use CoinFlipHeader instead. */
export const ProbabilityDashboard: React.FC<ProbabilityDashboardProps> = (props) => (
  <div className="w-full max-w-2xl">
    <CoinFlipHeader {...props} />
  </div>
);
