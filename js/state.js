import { USER, TIERS } from '../data/mock-data.js';

const state = {
  currentTier: USER.tier,
  user: { ...USER },
  hasActiveLoan: true,  // set to false to test empty state
  isFirstVisit: false,  // set to true to show onboarding above the fold
};

export function getState() { return state; }

export function setTier(tierId) {
  if (TIERS[tierId]) {
    state.currentTier = tierId;
    state.user.tier = tierId;
  }
}
