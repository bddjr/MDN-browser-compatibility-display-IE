// ==UserScript==
// @name         MDN-browser-compatibility-display-IE
// @version      20260703-1935
// @description  Make MDN Web Docs' "Browser compatibility" table display "Internet Explorer".
// @author       bddjr
// @license      MIT
// @match        https://developer.mozilla.org/*
// @icon         https://developer.mozilla.org/favicon.svg
// @run-at       document-start
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/bddjr/MDN-browser-compatibility-display-IE/refs/heads/main/MDN-browser-compatibility-display-IE.user.js
// @updateURL    https://raw.githubusercontent.com/bddjr/MDN-browser-compatibility-display-IE/refs/heads/main/MDN-browser-compatibility-display-IE.user.js
// ==/UserScript==


// For example:
// https://developer.mozilla.org/docs/Web/API/Document/querySelector
// https://developer.mozilla.org/docs/Web/HTML/Reference/Attributes/autocomplete
// https://developer.mozilla.org/docs/Web/HTML/Reference/Attributes/disabled


const ArrayPrototypePush = Array.prototype.push
const ArrayPrototypeIncludes = Array.prototype.includes
const ResponsePrototypeJson = Response.prototype.json

const ieId = "ie"

// Copy from https://github.com/mdn/mdn-dinocons/blob/main/browsers/internet-explorer.svg
const ieIconURL = "data:image/svg+xml," + encodeURIComponent(`<svg class="icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true
" role="img"><path d="M95 52.06a36 36 0 01-.35 5.22H36.84c0 10 8.79 17.23 18.43 17.23a18.72 18.72 0 0016.18-8.89h21.24a40.44 40.44 0 01-56 22.75c-5.63 2.8
6-13.51 5.83-19.79 5.83C8.46 94.2 5 89 5 81a51.8 51.8 0 012.26-13.82c.8-2.91 4-8.84 5.47-11.5a116.33 116.33 0 0123.86-30.44C28.9 28.55 20.57 36.89 15.14 4
3a40.47 40.47 0 0139.43-31.37h2.26C63.06 8.82 71.75 5.8 78.58 5.8c8.13 0 15.12 3.12 15.12 12.31 0 4.82-1.86 10-3.77 14.36A40.58 40.58 0 0195 52.06zm-3.52-
32.14c0-5.63-4-9.09-9.54-9.09-4.22 0-9 1.7-12.76 3.51a40.79 40.79 0 0119.74 16.43c1.26-3.32 2.56-7.34 2.56-10.85zM11.43 82c0 5.83 3.46 9 9.19 9 4.47 0 9.4
4-2 13.36-4.17a40.42 40.42 0 01-17.63-21.46C14 70.19 11.43 76.62 11.43 82zm25.31-35.77H73.3C73 36.54 64.41 29.56 55 29.56s-17.93 7-18.28 16.67z" fill="cur
rentColor"/></svg>`.replaceAll('\n', ''))

const css = `
    .icon.icon-${ieId}{
        mask-image: url("${ieIconURL}");
    }
    .bc-browser-ie.bc-supports-no .bcd-cell-text-wrapper{
        --color-text-red: var(--color-border-secondary);
        opacity: 0.5;
    }
`.replace(/\n\s*/g, '')

Array.prototype.push = function (a) {
    if (
        Array.isArray(a) &&
        typeof a[0] == 'number' &&
        typeof a[1] == 'string' &&
        a[1].includes(`.bc-supports-no `)
    ) {
        a[1] += css
        Array.prototype.push = ArrayPrototypePush
    }
    return ArrayPrototypePush.apply(this, arguments)
}

Array.prototype.includes = function (browserId) {
    const out = ArrayPrototypeIncludes.apply(this, arguments)
    if (
        !out &&
        browserId === ieId &&
        ArrayPrototypeIncludes.call(this, "chrome")
    ) {
        // SHOW_BROWSERS
        ArrayPrototypePush.call(this, ieId);
        Array.prototype.includes = ArrayPrototypeIncludes
        return true
    }
    return out
}

Response.prototype.json = async function () {
    const out = await ResponsePrototypeJson.apply(this, arguments)
    if (out?.browsers && out.data?.__compat?.support) {
        let value;
        if (Object.hasOwn(out.browsers, ieId)) {
            value = out.browsers[ieId]
            delete out.browsers[ieId]
        }
        out.browsers[ieId] = value ?? {
            "accepts_flags": false,
            "accepts_webextensions": false,
            "name": "Internet Explorer",
            "releases": {},
            "type": "desktop"
        }
    }
    return out
}
