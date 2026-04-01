import { initRouter } from './router.js';
import { renderBottomNav } from './components/BottomNav.js';
import { initLkScreen } from './screens/LkScreen.js';
import { initStatusScreen } from './screens/StatusScreen.js';
import { initUpgradeScreen } from './screens/UpgradeScreen.js';
import { initApplyScreen } from './screens/ApplyScreen.js';
import { initApplySuccessScreen } from './screens/ApplySuccessScreen.js';

document.addEventListener('DOMContentLoaded', () => {
  renderBottomNav(document.getElementById('bottom-nav'));
  initLkScreen();
  initStatusScreen();
  initUpgradeScreen();
  initApplyScreen();
  initApplySuccessScreen();
  initRouter();
});
