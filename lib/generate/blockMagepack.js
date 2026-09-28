const logger = require('../utils/logger');

/**
 * @param {Page} page Puppeteer Page object instance.
 */
const blockMagepack = async (page) => {
    await page.setRequestInterception(true);
    page.on('request', async (request) => {
        const url = request.url();

        try {
            // If we let these resources load, 'magepack generate' hangs at rjsResolver step.
            if (url.match(/magepack\/requirejs-config-.*\.js$/)) {
                logger.info('Blocked resource: ' + url);
                await request.abort();
                return;
            }

            await request.continue();
        } catch (error) {
            // The page may already be closed or the request already handled.
            logger.debug(`Could not handle request "${url}": ${error.message}`);
        }
    });
};

module.exports = blockMagepack;
