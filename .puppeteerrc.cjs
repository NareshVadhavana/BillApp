const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // ✅ Use local project cache folder (Render-safe)
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),

  // ✅ Ensure Chrome downloads during install
  chrome: {
    skipDownload: false,
  },
};
