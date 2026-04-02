import { initRouter } from './router.js';
import { renderBottomNav } from './components/BottomNav.js';
import { initLkScreen } from './screens/LkScreen.js';
import { initStatusScreen } from './screens/StatusScreen.js';
import { initUpgradeScreen } from './screens/UpgradeScreen.js';
import { initApplyScreen } from './screens/ApplyScreen.js';
import { initApplySuccessScreen } from './screens/ApplySuccessScreen.js';
import { initFaqScreen } from './screens/FaqScreen.js';
import { initOnboardingScreen } from './screens/OnboardingScreen.js';

document.addEventListener('DOMContentLoaded', () => {
  renderBottomNav(document.getElementById('bottom-nav'));
  initLkScreen();
  initStatusScreen();
  initUpgradeScreen();
  initApplyScreen();
  initApplySuccessScreen();
  initFaqScreen();
  initOnboardingScreen();
  initRouter();
});
