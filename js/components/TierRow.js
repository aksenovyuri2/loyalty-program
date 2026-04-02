import { TIERS, TIER_ORDER } from '../../data/mock-data.js';
import { fmtNum, fmtRate } from '../utils.js';

const STARS = { bronze: '★', silver: '★★', gold: '★★★' };

/**
 * Render a tier comparison table.
 * @param {string} currentTier — user's current tier id
 * @returns {string} HTML string
 */
export function renderTierRows(currentTier) {
  const currentIdx = TIER_ORDER.indexOf(currentTier);

  const rows = TIER_ORDER.map((tid, idx) => {
    const t = TIERS[tid];
    const isCurrent = tid === currentTier;
    const isLocked = idx > currentIdx;
    return `
      <div class="tier-row ${isCurrent ? 'tier-row--current' : ''} ${isLocked ? 'tier-row--locked' : ''}">
        <div class="tier-row__left">
          <div class="tier-row__indicator">
            <span class="tier-row__dot tier-row__dot--${tid}"></span>
            <span class="tier-row__stars">${STARS[tid]}</span>
          </div>
          <span class="tier-row__name">${t.name}</span>
          ${isCurrent ? '<span class="tier-row__badge">ваш</span>' : ''}
        </div>
        <div class="tier-row__right">
          <span class="tier-row__rate">${fmtRate(t.dailyRate)}/день</span>
          <span class="tier-row__limit">до ${fmtNum(t.maxLimit)} ₽</span>
        </div>
      </div>
    `;
  }).join('');

  return `<div class="tier-row-list">${rows}</div>`;
}
