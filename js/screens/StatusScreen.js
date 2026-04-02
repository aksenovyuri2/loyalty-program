import { TIERS, TIER_ORDER, TIER_PROGRESS, BASE_RATE, CURRENT_LOAN, STREAK, LIFETIME_SAVINGS } from '../../data/mock-data.js';
import { getState } from '../state.js';
import { navigate, onEnter } from '../router.js';
import { fmtNum, fmtRate, loanWord } from '../utils.js';
import { renderTierRows } from '../components/TierRow.js';

let streakDismissed = false;

export function initStatusScreen() {
  const screen = document.getElementById('screen-status');
  render(screen);
  onEnter('/status', () => {
    streakDismissed = false;
    render(screen);
  });
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

  // Conditions for next tier only (no tabs)
  const condTier = isMaxTier ? tier : nextTier;
  const condAllDone = condTier.conditions.every(c => c.completed);

  // Inline progress hint in condition text
  function conditionText(text) {
    const loansMatch = text.match(/погашение (\d+) займов/);
    if (loansMatch) {
      const needed = parseInt(loansMatch[1]);
      const done = Math.min(prog.loansCompleted, needed);
      return `${text} <span style="color: var(--brand-blue); font-weight: 600">(${done} из ${needed})</span>`;
    }
    return text;
  }

  // Personal savings on current loan
  const loanAmount = CURRENT_LOAN.remainingDebt;
  const loanDays = 30; // standard month for comparability
  const savingsVsBase = loanAmount * ((BASE_RATE - tier.dailyRate) / 100) * loanDays;
  const savingsNextVsCurrent = nextTier
    ? loanAmount * ((tier.dailyRate - nextTier.dailyRate) / 100) * loanDays
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
            <span class="status-card__metric-value"><s class="status-card__metric-old">${fmtRate(BASE_RATE)}</s> ${fmtRate(tier.dailyRate)}</span>
            <span class="status-card__metric-label">ставка/день</span>
          </div>
          <div class="status-card__metric">
            <span class="status-card__metric-value">${fmtNum(tier.maxLimit)} ₽</span>
            <span class="status-card__metric-label">макс. лимит</span>
          </div>
        </div>
        <button class="status-card__how-works" id="status-how-works" aria-label="Как работает программа лояльности">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Как работает программа лояльности →
        </button>
      </div>
    </div>

    ${STREAK.isActive && STREAK.count >= 2 && !streakDismissed ? `
    <div class="streak-badge" id="status-streak-badge" style="margin-top: calc(-1 * var(--sp-sm))">
      <div class="streak-badge__icon">🔥</div>
      <div>
        <div class="streak-badge__text">${STREAK.count} ${loanWord(STREAK.count)} подряд вовремя</div>
        <div class="streak-badge__sub">Серия не прервана — продолжайте</div>
      </div>
      <button class="streak-badge__dismiss" id="status-streak-dismiss" aria-label="Скрыть">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    ` : ''}

    ${!isMaxTier ? `
    <div class="status-progress-section">
      <div class="status-progress__header">
        <span class="status-progress__title">Погашено ${prog.loansCompleted} из ${prog.loansNeeded} займов</span>
        <span class="status-progress__target" id="status-scroll-to-conditions" role="button" aria-label="Перейти к условиям ${nextTier.name}">до «${nextTier.name}»</span>
      </div>
      <div class="status-progress__bar">
        <div class="status-progress__fill status-progress__fill--${currentTier}" style="width: ${progressPct}%"></div>
      </div>
      <div class="status-progress__hint">Ещё ${loansLeft} ${loanWord(loansLeft)} вовремя — и статус повысится</div>
    </div>
    ` : `
    <div class="status-progress-section">
      <div class="status-progress__header">
        <span class="status-progress__title">Максимальный уровень</span>
      </div>
      <div class="status-progress__bar">
        <div class="status-progress__fill status-progress__fill--${currentTier}" style="width: 100%"></div>
      </div>
      <div class="status-progress__hint">Вам доступны лучшие условия</div>
    </div>
    `}

    ${LIFETIME_SAVINGS > 0 ? `
    <div class="lifetime-savings">
      <div class="lifetime-savings__icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="lifetime-savings__text">
        Уже сэкономили <span class="lifetime-savings__amount">${fmtNum(LIFETIME_SAVINGS)} ₽</span> с программой boostra
        ${!isMaxTier ? `— до «${nextTier.name}» ещё ${fmtNum(Math.round(savingsNextVsCurrent))} ₽/мес` : ''}
      </div>
    </div>
    ` : `
    ${!isMaxTier && savingsVsBase > 0 ? `
    <div class="lifetime-savings">
      <div class="lifetime-savings__icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="lifetime-savings__text">
        По статусу ${tier.name} экономите <span class="lifetime-savings__amount">${fmtNum(Math.round(savingsVsBase))} ₽/мес</span> vs базовой ставки
        ${savingsNextVsCurrent > 0 ? `— «${nextTier.name}» даст ещё +${fmtNum(Math.round(savingsNextVsCurrent))} ₽` : ''}
      </div>
    </div>
    ` : ''}
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
          <span class="condition-item__text" style="color: var(--brand-green); font-weight: 600">Все условия выполнены</span>
        </div>
      </div>
      ` : `
      ${condTier.conditions.map(c => `
        <div class="condition-item ${c.completed ? 'condition-item--done' : ''}">
          <div class="condition-item__left">
            <div class="condition-item__check ${c.completed ? 'condition-item__check--done' : ''}">
              ${c.completed
                ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
                : ''}
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
  screen.querySelector('#status-streak-dismiss')?.addEventListener('click', () => {
    streakDismissed = true;
    screen.querySelector('#status-streak-badge')?.remove();
  });
}
