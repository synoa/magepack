# Magepack 🚀

> **This is `synoa-magepack`, a modified version of [Magepack](https://github.com/magesuite/magepack) maintained by [Synoa GmbH](https://www.synoa.de).**
>
> The original project has not been maintained since October 2022 and its dependency tree fails `npm audit`. This fork keeps the original behaviour and updates the dependencies (Puppeteer 25, glob 13, commander 14, consola 3, ...) so that the package installs without security advisories. It is not affiliated with, maintained by, or endorsed by creativestyle or MageSuite. All changes are listed in [CHANGELOG.md](CHANGELOG.md); attribution and license details are in [NOTICE.md](NOTICE.md).

Magepack is a bold attempt in making Magento 2 frontend as fast as never before. It builds on experiences gained with [Advanced JavaScript bundling guide](https://devdocs.magento.com/guides/v2.3/performance-best-practices/advanced-js-bundling.html) and [Baler](https://github.com/magento/baler) to provide the best of both worlds - ease of use and superior performance.

## Top highlights\*

-   Up to 91 points mobile score in Google Lighthouse.
-   Up to 98% reduction in JavaScript file requests (from 177 to only 3).
-   Up to 44% reduction in transferred JavaScript size.
-   Up to 75% reduction in total load time.
-   Works with Magento's JavaScript minification and merging enabled.
-   Uses custom solution (inspired by Baler) instead of RequireJs optimizer which is way more flexible, faster, produces smaller bundle and doesn't break on missing files.

_\* All data gathered on clean Magento 2 with sample data installed._

## Installing

Here are the requirements for Magepack to work:

1. You need Node.js version 22.13 or higher installed.
2. If you are using Magento 2.3.5 or lower, you need to have `mixins.js` module patched [(patch provided and explained here)](https://github.com/magento/baler/issues/23).
3. If you are using Magento 2.3.3 or lower, you need `jquery.cookie` module shim [(patch provided and explained here)](https://github.com/magento/baler/issues/6).
4. [Magepack Magento module](https://github.com/magesuite/magepack-magento) installed.

Install as a project dependency:

```
npm install --save-dev synoa-magepack
```

To use it as a drop-in replacement for the original `magepack` package (same `node_modules/magepack` path, same `magepack` executable), install it under the original name with an npm alias:

```
npm install --save-dev magepack@npm:synoa-magepack@^3.0.0
```

Install globally:

```
npm install -g synoa-magepack
```

### Puppeteer and Chrome

`magepack generate` drives a headless Chrome through [Puppeteer](https://pptr.dev/), which is an optional dependency of this package. When it is installed, Puppeteer downloads a matching Chrome build into `~/.cache/puppeteer` (about 250 MB). Hosts that only run `magepack bundle` (for example deployment servers) do not need it and can skip the download:

```
PUPPETEER_SKIP_DOWNLOAD=true npm ci
```

or install without optional dependencies (`npm ci --omit=optional`). If Chrome is missing when you run `magepack generate`, install it with `npx puppeteer browsers install chrome`.

## Usage

```shell
Usage: magepack [generate|bundle] <options...>

Options:
  -v, --version       Output the current version.
  -h, --help          Show this command summary.

Commands:
  generate [options]  Generate optimization configuration based on given page URLs.
  bundle [options]    Bundle JavaScript files using given configuration file.
```

### Generating bundler configuration

First step is to run the generation against the existing, working shop. You can do it on any machine with access to the target shop, even your own computer. The goal here is to collect all of the RequireJS dependencies needed for a certain type of page layout. Currently, following bundles are prepared:

-   `cms` containing modules needed by CMS pages.
-   `category` containing modules needed by category pages.
-   `product` containing modules needed by product pages.
-   `checkout` containing modules needed by cart and checkout pages.

In addition, there is the `common` bundle created by extracting all modules needed by each of above and loaded on every page.

#### Running the generator

```
magepack generate --cms-url="{{CMS_PAGE_URL}}" --category-url="{{CATEGORY_PAGE_URL}}" --product-url="{{PRODUCT_PAGE_URL}}"
```

There are 3 required options you need to pass:

`--cms-url` - URL to one of CMS pages (e.g. homepage).

`--category-url` - URL to one of category pages.

`--product-url` - URL to one of product pages.

_Note: By default, Magepack will use given product page, add this product to the cart and visit both cart and checkout pages to collect dependencies. To avoid this, use the `--skip-checkout` option._

Running the above command will generate `magepack.config.js` file, where you can find each of the prepared bundles with the list of modules that will be included in them.

### Bundling

Once you have generated bundler configuration, the next step would be to trigger the actual optimization **after static content deploy stage has finished** by running the following in shop root directory:

```
magepack bundle
```

This command will iterate over each deployed locale (excluding Magento/blank) and prepare bundles for each of them.

There are multiple optional params you can set:

`-c, --config` - defining the configuration file path, in case you have multiple configuration files (e.g multiple themes with individual configuration files)

`-g, --glob` -  defining where to look for locales to bundle.

`-s, --sourcemap` - enables sourcemap generation for bundled js.

`-m, --minify` - overrides Magento 2 JS minification setting, minifying the bundle using Terser (used by default if Magento 2 JS minification is enabled).

#### Sourcemaps

It is possible to enable sourcemaps for bundled JS files, using the `-s, --sourcemap` flag with `magepack bundle` command. However, there are couple of caveats:

* It does not respect existing sourcemaps for individual JS files (possible future update)
* For sourcemaps to be meaningful, Magento 2 JS minification must be **turned off**. This is because Magento 2 does not (and cannot with current PHP implementation) generate sourcemaps for each minified JS file. For this reason, a separate `-m, --minify` flag exists to minify the resulting bundle using Terser.

### Enabling

Once you made sure [Magepack Magento module](https://github.com/magesuite/magepack-magento) is installed, what is left is to enable it via admin panel under Stores->Configuration->Advanced->Developer or CLI:

```shell
bin/magento config:set dev/js/enable_magepack_js_bundling 1
```

and clearing the cache:

```shell
bin/magento cache:clean
```

Now the shop should be way faster then before 🚀 You can (and should) even enable all Magento's performance optimizations (except JavaScript bundling of course) for even better results.

## Results

Here are the test results of the original project, testing homepage on local development environment with clean Magento 2.3.4, sample data, all caches enabled and following optimizations:

-   JavaScript:
    -   `Merge JavaScript Files` - `Yes`.
    -   `Enable JavaScript Bundling` - `No`.
    -   `Minify JavaScript Files` - `Yes`.
    -   `Move JS code to the bottom of the page` - `Yes`.
-   CSS:
    -   `Merge CSS Files` - `Yes`.
    -   `Minify CSS Files` - `Yes`.
    -   `Use CSS critical path` - `Yes`.
-   Templates:
    -   `Minify Html` - `Yes`.

### No Bundling
![Lighthouse report with 53 score](https://github.com/magesuite/magepack/raw/master/results/no-bundling.png)

### Bundling with Baler

Please note that Baler does not currently support Magento's JavaScript merging and minification.

![Lighthouse report with 64 score](https://github.com/magesuite/magepack/raw/master/results/baler.png)

### Bundling with Magepack

![Lighthouse report with 91 score](https://github.com/magesuite/magepack/raw/master/results/magepack.png)

## Debugging

Before rising an issue please follow below guidelines:

-   Problems with bundling:
    -   Make sure there are no JavaScript errors thrown by the shop which may prevent Magepack from collecting the dependencies.
-   Problems with generation:
    -   Make sure all locales are properly deployed and no files are missing.
-   Try running the command with `--debug` or `-d` flag that makes Magepack output more information about the ongoing process which should make debugging easier.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/synoa/magepack/tags).

## License

This project is licensed under the Open Software License version 3.0 (OSL-3.0) - see the [LICENSE.md](LICENSE.md) file for details.

It is a modified version of [Magepack](https://github.com/magesuite/magepack), original work by creativestyle and the Magepack contributors, also licensed under OSL-3.0. Modifications Copyright (c) 2026 Synoa GmbH. See [NOTICE.md](NOTICE.md) for the full attribution notice.

## Acknowledgments

-   creativestyle and the contributors of the original [Magepack](https://github.com/magesuite/magepack).
-   Authors of [Advanced JavaScript bundling guide](https://devdocs.magento.com/guides/v2.3/performance-best-practices/advanced-js-bundling.html).
-   Authors of [Baler](https://github.com/magento/baler/).
-   Magento Community Engineering Slack.
