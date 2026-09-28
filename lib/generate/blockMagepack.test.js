const blockMagepack = require('./blockMagepack');

const createPage = () => ({
    setRequestInterception: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
});

const createRequest = (url) => ({
    url: () => url,
    abort: jest.fn().mockResolvedValue(undefined),
    continue: jest.fn().mockResolvedValue(undefined),
});

const getRequestHandler = (page) => page.on.mock.calls[0][1];

describe('blockMagepack utility', () => {
    test('is a function', () => {
        expect(typeof blockMagepack).toEqual('function');
    });

    test('enables request interception and registers a request handler', async () => {
        const page = createPage();

        await blockMagepack(page);

        expect(page.setRequestInterception).toHaveBeenCalledWith(true);
        expect(page.on).toHaveBeenCalledWith('request', expect.any(Function));
    });

    test('aborts requests for magepack requirejs-config files', async () => {
        const page = createPage();
        await blockMagepack(page);
        const request = createRequest(
            'https://shop.test/static/frontend/Magento/luma/en_US/magepack/requirejs-config-common.js'
        );

        await getRequestHandler(page)(request);

        expect(request.abort).toHaveBeenCalledTimes(1);
        expect(request.continue).not.toHaveBeenCalled();
    });

    test('continues all other requests', async () => {
        const page = createPage();
        await blockMagepack(page);
        const request = createRequest(
            'https://shop.test/static/frontend/Magento/luma/en_US/requirejs-config.js'
        );

        await getRequestHandler(page)(request);

        expect(request.continue).toHaveBeenCalledTimes(1);
        expect(request.abort).not.toHaveBeenCalled();
    });

    test('does not throw when the request can no longer be handled', async () => {
        const page = createPage();
        await blockMagepack(page);
        const request = createRequest('https://shop.test/');
        request.continue.mockRejectedValue(new Error('Target closed'));

        await expect(getRequestHandler(page)(request)).resolves.toBeUndefined();
    });
});
