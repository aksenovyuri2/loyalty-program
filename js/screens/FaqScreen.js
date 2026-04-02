import { TIERS, TIER_ORDER, CURRENT_LOAN, TIER_PROGRESS, MOCK_OVERRIDES } from '../../data/mock-data.js';
import { getState, setTier } from '../state.js';
import { navigate, onEnter } from '../router.js';
import { setLastApplication } from './ApplySuccessScreen.js';
import { resetUpgradeConfetti } from './UpgradeScreen.js';

/* ---- Per-tier mock presets ---- */
const TIER_PRESETS = {
  bronze: { loansCompleted: 2, loansNeeded: 3 },
  silver: { loansCompleted: 7, loansNeeded: 10 },
  gold:   { loansCompleted: 10, loansNeeded: 10 },
};

function applyTier(tierId) {
  setTier(tierId);
  const p = TIER_PRESETS[tierId];
  TIER_PROGRESS.loansCompleted = p.loansCompleted;
  TIER_PROGRESS.loansNeeded    = p.loansNeeded;
}

function resetDefaults() {
  const state = getState();
  CURRENT_LOAN.dpd = 0;
  state.isFirstVisit  = false;
  state.hasActiveLoan = true;
}

/* ---- Init ---- */
export function initFaqScreen() {
  const screen = document.getElementById('screen-faq');
  render(screen);
  onEnter('/faq', () => render(screen));
}

/* ---- Render ---- */
function render(screen) {
  const state = getState();
  const tier  = TIERS[state.currentTier];

  const dotClass = `faq-state-pill__dot faq-state-pill__dot--${state.currentTier}`;
  const loanLabel = state.hasActiveLoan
    ? (CURRENT_LOAN.dpd >= 7 ? `просрочка ${CURRENT_LOAN.dpd} дн.` : 'активен')
    : 'нет';

  screen.innerHTML = `
    <div class="faq-topbar">
      <div class="faq-topbar__title">Preview</div>
      <div class="faq-topbar__sub">Все состояния и переходы интерфейса</div>
      <div class="faq-state-pill">
        <span class="${dotClass}"></span>
        Статус: <strong>${tier.name}</strong>
        &nbsp;·&nbsp;
        Займ: <strong>${loanLabel}</strong>
        &nbsp;·&nbsp;
        Прогресс: <strong>${TIER_PROGRESS.loansCompleted}/${TIER_PROGRESS.loansNeeded}</strong>
      </div>
    </div>

    <!-- ─── УРОВНИ ─────────────────────────────────────── -->
    <div class="faq-section">
      <div class="faq-section__label">Уровни — открыть ЛК</div>
      <div class="faq-group">
        <button class="faq-btn faq-btn--bronze" data-action="tier-bronze">
          <span class="faq-btn__icon">🥉</span>
          <div>Бронза
            <div class="faq-btn__meta">0,80%/день · лимит 30 000 ₽ · прогресс 2/3</div>
          </div>
        </button>
        <button class="faq-btn faq-btn--silver" data-action="tier-silver">
          <span class="faq-btn__icon">🥈</span>
          <div>Серебро
            <div class="faq-btn__meta">0,70%/день · лимит 60 000 ₽ · прогресс 7/10</div>
          </div>
        </button>
        <button class="faq-btn faq-btn--gold" data-action="tier-gold">
          <span class="faq-btn__icon">🥇</span>
          <div>Золото (максимум)
            <div class="faq-btn__meta">0,60%/день · лимит 90 000 ₽ · прогресс 10/10</div>
          </div>
        </button>
      </div>
    </div>

    <div class="faq-divider"></div>

    <!-- ─── ЛК СОСТОЯНИЯ ──────────────────────────────── -->
    <div class="faq-section">
      <div class="faq-section__label">Главная (ЛК) — варианты</div>
      <div class="faq-group">
        <button class="faq-btn" data-action="lk-with-loan">
          <span class="faq-btn__icon" style="background:rgba(43,125,233,0.1)">💳</span>
          <div>С активным займом
            <div class="faq-btn__meta">Стандартное состояние ЛК</div>
          </div>
        </button>
        <button class="faq-btn" data-action="lk-no-loan">
          <span class="faq-btn__icon" style="background:rgba(43,125,233,0.1)">✦</span>
          <div>Пустое состояние — нет займов
            <div class="faq-btn__meta">Empty state с CTA оформить первый займ</div>
          </div>
        </button>
        <button class="faq-btn" data-action="lk-first-visit">
          <span class="faq-btn__icon" style="background:rgba(43,125,233,0.1)">👋</span>
          <div>Первый визит — онбординг сверху
            <div class="faq-btn__meta">Блок «Как это работает» над займом</div>
          </div>
        </button>
        <button class="faq-btn faq-btn--danger" data-action="lk-frozen">
          <span class="faq-btn__icon" style="background:rgba(224,90,58,0.12)">🔒</span>
          <div>Просрочка — статус заморожен
            <div class="faq-btn__meta">DPD 10 дней · красный баннер сверху</div>
          </div>
        </button>
        <button class="faq-btn faq-btn--outline" data-action="lk-payment-modal">
          <span class="faq-btn__icon">💬</span>
          <div>Bottom sheet «Оплата»
            <div class="faq-btn__meta">Попап при клике «Погасить займ»</div>
          </div>
        </button>
        <button class="faq-btn faq-btn--outline" data-action="lk-tooltip">
          <span class="faq-btn__icon">ℹ️</span>
          <div>Тултип статуса на карточке
            <div class="faq-btn__meta">Клик по бейджу → привилегии текущего уровня</div>
          </div>
        </button>
        <button class="faq-btn faq-btn--gold" data-action="lk-gold-no-loan">
          <span class="faq-btn__icon">🥇</span>
          <div>Золото · пустой ЛК (нет займа)
            <div class="faq-btn__meta">Максимальный уровень без активного займа</div>
          </div>
        </button>
      </div>
    </div>

    <div class="faq-divider"></div>

    <!-- ─── ЭКРАН СТАТУСА ─────────────────────────────── -->
    <div class="faq-section">
      <div class="faq-section__label">Экран статуса</div>
      <div class="faq-group">
        <button class="faq-btn faq-btn--bronze" data-action="status-bronze">
          <span class="faq-btn__icon">⭐</span>
          <div>Статус: Бронза
            <div class="faq-btn__meta">Прогресс 2/3 → серебро · сравнение экономии</div>
          </div>
        </button>
        <button class="faq-btn faq-btn--silver" data-action="status-silver">
          <span class="faq-btn__icon">⭐</span>
          <div>Статус: Серебро
            <div class="faq-btn__meta">Прогресс 7/10 → золото · стрик 6 займов</div>
          </div>
        </button>
        <button class="faq-btn faq-btn--gold" data-action="status-gold">
          <span class="faq-btn__icon">⭐</span>
          <div>Статус: Золото (максимум)
            <div class="faq-btn__meta">Полный прогресс · привилегии · история</div>
          </div>
        </button>
      </div>
    </div>

    <div class="faq-divider"></div>

    <!-- ─── ЗАЯВКА ────────────────────────────────────── -->
    <div class="faq-section">
      <div class="faq-section__label">Экран заявки</div>
      <div class="faq-group">
        <button class="faq-btn faq-btn--bronze" data-action="apply-bronze">
          <span class="faq-btn__icon">📋</span>
          <div>Заявка: Бронза
            <div class="faq-btn__meta">Лимит 30 000 ₽ · баннер прогресса → серебро</div>
          </div>
        </button>
        <button class="faq-btn faq-btn--silver" data-action="apply-silver">
          <span class="faq-btn__icon">📋</span>
          <div>Заявка: Серебро
            <div class="faq-btn__meta">Лимит 60 000 ₽ · баннер прогресса → золото</div>
          </div>
        </button>
        <button class="faq-btn faq-btn--gold" data-action="apply-gold">
          <span class="faq-btn__icon">📋</span>
          <div>Заявка: Золото
            <div class="faq-btn__meta">Лимит 90 000 ₽ · нет баннера (максимум)</div>
          </div>
        </button>
      </div>
    </div>

    <div class="faq-divider"></div>

    <!-- ─── УСПЕХ ЗАЯВКИ ──────────────────────────────── -->
    <div class="faq-section">
      <div class="faq-section__label">Экран «Заявка отправлена»</div>
      <div class="faq-group">
        <button class="faq-btn faq-btn--bronze" data-action="success-bronze">
          <span class="faq-btn__icon">✅</span>
          <div>Успех: Бронза · 15 000 ₽ · 15 дн.
            <div class="faq-btn__meta">Тайм-лайн · экономия · CTA → серебро</div>
          </div>
        </button>
        <button class="faq-btn faq-btn--silver" data-action="success-silver">
          <span class="faq-btn__icon">✅</span>
          <div>Успех: Серебро · 30 000 ₽ · 21 дн.
            <div class="faq-btn__meta">Тайм-лайн · экономия · CTA → золото</div>
          </div>
        </button>
        <button class="faq-btn faq-btn--gold" data-action="success-gold">
          <span class="faq-btn__icon">✅</span>
          <div>Успех: Золото · 50 000 ₽ · 30 дн.
            <div class="faq-btn__meta">Тайм-лайн · максимальная экономия · шеринг</div>
          </div>
        </button>
      </div>
    </div>

    <div class="faq-divider"></div>

    <!-- ─── ПОВЫШЕНИЕ СТАТУСА ──────────────────────────── -->
    <div class="faq-section">
      <div class="faq-section__label">Экран повышения статуса</div>
      <div class="faq-group">
        <button class="faq-btn faq-btn--silver" data-action="upgrade-to-silver">
          <span class="faq-btn__icon">🎉</span>
          <div>Апгрейд: Бронза → Серебро
            <div class="faq-btn__meta">Конфетти · дельта ставки −12,5% · ×2 лимит</div>
          </div>
        </button>
        <button class="faq-btn faq-btn--gold" data-action="upgrade-to-gold">
          <span class="faq-btn__icon">🎉</span>
          <div>Апгрейд: Серебро → Золото
            <div class="faq-btn__meta">Конфетти · дельта ставки −14,3% · ×1,5 лимит</div>
          </div>
        </button>
        <button class="faq-btn faq-btn--gold" data-action="upgrade-max">
          <span class="faq-btn__icon">👑</span>
          <div>Максимальный уровень (Золото)
            <div class="faq-btn__meta">«Вы на максимуме!» · привилегии · история</div>
          </div>
        </button>
      </div>
    </div>

    <div class="faq-divider"></div>

    <!-- ─── СБРОС ──────────────────────────────────────── -->
    <div class="faq-section">
      <div class="faq-section__label">Утилиты</div>
      <div class="faq-group">
        <button class="faq-btn faq-btn--reset" data-action="reset">
          ↺ &nbsp;Сбросить к дефолту — Серебро · активный займ
        </button>
      </div>
    </div>
  `;

  screen.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => handleAction(btn.dataset.action));
  });
}

/* ---- Action handler ---- */
function handleAction(action) {
  resetDefaults();

  switch (action) {

    /* Уровни */
    case 'tier-bronze': applyTier('bronze'); navigate('/lk'); break;
    case 'tier-silver': applyTier('silver'); navigate('/lk'); break;
    case 'tier-gold':   applyTier('gold');   navigate('/lk'); break;

    /* ЛК варианты */
    case 'lk-with-loan':
      navigate('/lk');
      break;

    case 'lk-no-loan':
      getState().hasActiveLoan = false;
      navigate('/lk');
      break;

    case 'lk-first-visit':
      getState().isFirstVisit = true;
      navigate('/lk');
      break;

    case 'lk-frozen':
      CURRENT_LOAN.dpd = 10;
      navigate('/lk');
      break;

    case 'lk-payment-modal':
      navigate('/lk');
      setTimeout(() => document.getElementById('btn-pay-loan')?.click(), 150);
      break;

    case 'lk-tooltip':
      navigate('/lk');
      setTimeout(() => document.getElementById('lk-badge')?.click(), 150);
      break;

    case 'lk-gold-no-loan':
      applyTier('gold');
      getState().hasActiveLoan = false;
      navigate('/lk');
      break;

    /* Статус */
    case 'status-bronze': applyTier('bronze'); navigate('/status'); break;
    case 'status-silver': applyTier('silver'); navigate('/status'); break;
    case 'status-gold':   applyTier('gold');   navigate('/status'); break;

    /* Заявка */
    case 'apply-bronze': applyTier('bronze'); navigate('/apply'); break;
    case 'apply-silver': applyTier('silver'); navigate('/apply'); break;
    case 'apply-gold':   applyTier('gold');   navigate('/apply'); break;

    /* Успех */
    case 'success-bronze':
      applyTier('bronze');
      setLastApplication({ amount: 15000, term: 15, rate: TIERS['bronze'].dailyRate });
      navigate('/apply-success');
      break;

    case 'success-silver':
      applyTier('silver');
      setLastApplication({ amount: 30000, term: 21, rate: TIERS['silver'].dailyRate });
      navigate('/apply-success');
      break;

    case 'success-gold':
      applyTier('gold');
      setLastApplication({ amount: 50000, term: 30, rate: TIERS['gold'].dailyRate });
      navigate('/apply-success');
      break;

    /* Апгрейд */
    case 'upgrade-to-silver':
      applyTier('silver');
      MOCK_OVERRIDES.previousTier = 'bronze';
      resetUpgradeConfetti();
      navigate('/upgrade');
      break;

    case 'upgrade-to-gold':
      applyTier('gold');
      MOCK_OVERRIDES.previousTier = 'silver';
      resetUpgradeConfetti();
      navigate('/upgrade');
      break;

    case 'upgrade-max':
      applyTier('gold');
      MOCK_OVERRIDES.previousTier = 'silver';
      resetUpgradeConfetti();
      navigate('/upgrade');
      break;

    /* Сброс */
    case 'reset':
      applyTier('silver');
      MOCK_OVERRIDES.previousTier = 'bronze';
      navigate('/lk');
      break;
  }
}
