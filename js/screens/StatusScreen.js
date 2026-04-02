import { TIERS, TIER_ORDER, TIER_PROGRESS, BASE_RATE, CURRENT_LOAN, LIFETIME_SAVINGS } from '../../data/mock-data.js';
import { getState } from '../state.js';
import { navigate, onEnter } from '../router.js';
import { fmtNum, fmtRate, loanWord } from '../utils.js';
import { renderTierRows } from '../components/TierRow.js';

function progressDots(completed, needed, tierClass) {
  return Array.from({ length: needed }, (_, i) => {
    const cls = i < completed ? `prog-dot--${tierClass}` : 'prog-dot--empty';
    return `<span class="prog-dot ${cls}"></span>`;
  }).join('');
}

export function initStatusScreen() {
  const screen = document.getElementById('screen-status');
  render(screen);
  onEnter('/status', () => render(screen));
}

function render(screen) {
  const state = getState();
  const currentTier = state.currentTier;
  const tier = TIERS[currentTier];
  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const isMaxTier = currentIdx >= TIER_ORDER.length - 1;
  const nextTierId = isMaxTier ? null : TIER_ORDER[currentIdx + 1];
  const nextTier = nextTierId ? TIERS[nextTierId] : null;

  const prog = TIER_PROGRESS;
  const progressPct = Math.round((prog.loansCompleted / prog.loansNeeded) * 100);
  const loansLeft = prog.loansNeeded - prog.loansCompleted;

  // Conditions for next tier only
  const condTier = isMaxTier ? tier : nextTier;
  const condAllDone = condTier.conditions.every(c => c.completed);

  // Inline progress hint in condition text
  function conditionText(text) {
    const loansMatch = text.match(/погашение (\d+) займов/);
    if (loansMatch) {
      const needed = parseInt(loansMatch[1]);
      const done = Math.min(prog.loansCompleted, needed);
      return `${text} <span style="color:var(--brand-blue);font-weight:600">(${done} из ${needed})</span>`;
    }
    return text;
  }

  // Monthly savings vs next tier
  const loanAmount = CURRENT_LOAN.remainingDebt;
  const savingsNextVsCurrent = nextTier
    ? Math.round(loanAmount * ((tier.dailyRate - nextTier.dailyRate) / 100) * 30)
    : 0;

  screen.innerHTML = `
    <div class="screen-header">
      <button class="screen-header__back" id="status-back" aria-label="Назад">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="screen-header__title">Ваш статус</span>
    </div>

    <div class="status-card-area">
      <div class="status-card status-card--${currentTier}">
        <div class="status-card__top">
          <div>
            <div class="status-card__user-name">${state.user.name}, ваш статус</div>
            <div class="status-card__tier-name">${tier.name}</div>
          </div>
        </div>
        <div class="status-card__metrics">
          <div class="status-card__metric">
            <span class="status-card__metric-label">ставка/день</span>
            <span class="status-card__metric-value">${fmtRate(tier.dailyRate)} <s class="status-card__metric-old">${fmtRate(BASE_RATE)}</s></span>
          </div>
          <div class="status-card__metric">
            <span class="status-card__metric-label">макс. лимит</span>
            <span class="status-card__metric-value">${fmtNum(tier.maxLimit)} ₽</span>
          </div>
        </div>
        ${LIFETIME_SAVINGS > 0 ? `
        <div class="status-card__savings">
          <span class="status-card__savings-label">сэкономлено с программой</span>
          <span class="status-card__savings-value">${fmtNum(LIFETIME_SAVINGS)} ₽</span>
        </div>
        ` : ''}
        <button class="status-card__how-works" id="status-how-works" aria-label="Как работает программа лояльности">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Как работает программа лояльности →
        </button>
      </div>
    </div>

    ${!isMaxTier ? `
    <div class="status-progress-section">
      <div class="status-progress__header">
        <span class="status-progress__title">
          <strong>${prog.loansCompleted}</strong><span class="status-progress__total"> / ${prog.loansNeeded}</span>
          займов погашено вовремя
        </span>
        <span class="status-progress__target" id="status-scroll-to-conditions" role="button">до «${nextTier.name}»</span>
      </div>
      <div class="prog-dots prog-dots--md" style="margin-bottom: var(--sp-sm)">
        ${progressDots(prog.loansCompleted, prog.loansNeeded, currentTier)}
      </div>
      <div class="status-progress__hint">
        Ещё ${loansLeft} ${loanWord(loansLeft)} вовремя — статус повысится
        ${savingsNextVsCurrent > 0 ? `· +${fmtNum(savingsNextVsCurrent)} ₽/мес` : ''}
      </div>
    </div>
    ` : `
    <div class="status-progress-section">
      <div class="status-progress__header">
        <span class="status-progress__title">Максимальный уровень</span>
      </div>
      <div class="prog-dots prog-dots--md" style="margin-bottom: var(--sp-sm)">
        ${progressDots(prog.loansNeeded, prog.loansNeeded, currentTier)}
      </div>
      <div class="status-progress__hint">Вам доступны лучшие условия</div>
    </div>
    `}

    <div class="section-title">Ставки по уровням</div>
    ${renderTierRows(currentTier)}

    ${!isMaxTier ? `
    <div class="section-title" id="conditions-anchor">Условия для «${nextTier.name}»</div>
    <div class="conditions-section">
      ${condAllDone ? `
      <div class="condition-item condition-item--all-done">
        <div class="condition-item__left">
          <div class="condition-item__check condition-item__check--done">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span class="condition-item__text" style="color:var(--brand-green);font-weight:600">Все условия выполнены</span>
        </div>
      </div>
      ` : `
      ${condTier.conditions.map(c => `
        <div class="condition-item ${c.completed ? 'condition-item--done' : ''}">
          <div class="condition-item__left">
            <div class="condition-item__check ${c.completed ? 'condition-item__check--done' : ''}">
              ${c.completed ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
            </div>
            <span class="condition-item__text">${conditionText(c.text)}</span>
          </div>
        </div>
      `).join('')}
      `}
    </div>
    ` : ''}

    <!-- CTA -->
    <div style="padding: 0 var(--sp-base); margin-bottom: var(--sp-md)">
      <button class="btn-primary" id="status-apply" style="width:100%" aria-label="Оформить заявку">
        ${isMaxTier
          ? `Оформить заявку по ставке ${fmtRate(tier.dailyRate)}`
          : `Оформить ${prog.loansCompleted + 1}-й займ → ${nextTier.name}`
        }
      </button>
    </div>
    <div style="padding: 0 var(--sp-base); margin-bottom: var(--sp-lg); font-size: var(--fs-xs); color: var(--color-text-secondary); text-align: center">
      ${isMaxTier
        ? `Статус ${tier.name} — лучшие условия уже ваши`
        : `Погасите вовремя — и статус ${nextTier.name} ваш`
      }
    </div>
  `;

  screen.querySelector('#status-back')?.addEventListener('click', () => navigate('/lk'));
  screen.querySelector('#status-apply')?.addEventListener('click', () => navigate('/apply'));
  screen.querySelector('#status-scroll-to-conditions')?.addEventListener('click', () => {
    const anchor = screen.querySelector('#conditions-anchor');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
  });
  screen.querySelector('#status-how-works')?.addEventListener('click', () => navigate('/onboarding'));
}
