// ==UserScript==
// @name         MDN-browser-compatibility-display-IE
// @version      20260502-2040
// @description  MDN browser compatibility display IE
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


// Config:
// force enable display IE.
// if false, only display when IE support API.
const forceEnableDisplayIE = true


//===============================================================================================================

const ieName = "ie"

// Copy from https://github.com/mdn/mdn-dinocons/blob/main/browsers/internet-explorer.svg
const ieIconURL = "data:image/svg+xml," + encodeURIComponent(
    '<svg class="icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">' +
    '<path d="M95 52.06a36 36 0 01-.35 5.22H36.84c0 10 8.79 17.23 18.43 17.23a18.72 18.72 0 0016.18-8.89h21.24' +
    'a40.44 40.44 0 01-56 22.75c-5.63 2.86-13.51 5.83-19.79 5.83C8.46 94.2 5 89 5 81a51.8 51.8 0 012.26-13.82c' +
    '.8-2.91 4-8.84 5.47-11.5a116.33 116.33 0 0123.86-30.44C28.9 28.55 20.57 36.89 15.14 43a40.47 40.47 0 0139' +
    '.43-31.37h2.26C63.06 8.82 71.75 5.8 78.58 5.8c8.13 0 15.12 3.12 15.12 12.31 0 4.82-1.86 10-3.77 14.36A40.' +
    '58 40.58 0 0195 52.06zm-3.52-32.14c0-5.63-4-9.09-9.54-9.09-4.22 0-9 1.7-12.76 3.51a40.79 40.79 0 0119.74 ' +
    '16.43c1.26-3.32 2.56-7.34 2.56-10.85zM11.43 82c0 5.83 3.46 9 9.19 9 4.47 0 9.44-2 13.36-4.17a40.42 40.42 ' +
    '0 01-17.63-21.46C14 70.19 11.43 76.62 11.43 82zm25.31-35.77H73.3C73 36.54 64.41 29.56 55 29.56s-17.93 7-1' +
    '8.28 16.67z" fill="currentColor"/></svg>'
)


const styleIEIcon = document.createElement('style')
styleIEIcon.innerHTML = `
    .icon.icon-${ieName} {
        -webkit-mask-image:url("${ieIconURL}");
        mask-image:url("${ieIconURL}");
    }
    .bc-browser-ie.bc-supports-no .bcd-cell-text-wrapper {
        --color-text-red: var(--color-border-secondary);
        opacity: 0.5;
    }
`

/** @type {number | null} */
let addStyleIEIcon__intervalId = null

function addStyleIEIcon() {
    if (addStyleIEIcon__intervalId !== null) return;
    const getShadowRoot = () => (
        document.querySelector('mdn-compat-table-lazy')?.shadowRoot
            ?.querySelector?.('mdn-compat-table')?.shadowRoot
    )
    let shadowRoot = getShadowRoot()
    if (shadowRoot) {
        shadowRoot.contains(styleIEIcon) || shadowRoot.appendChild(styleIEIcon)
        return
    }
    addStyleIEIcon__intervalId = setInterval(() => {
        if (shadowRoot = getShadowRoot()) {
            clearInterval(addStyleIEIcon__intervalId)
            addStyleIEIcon__intervalId = null
            shadowRoot.contains(styleIEIcon) || shadowRoot.appendChild(styleIEIcon)
        }
    }, 100)
}

let enableDisplayIE = !!forceEnableDisplayIE

/** @type {null | typeof Array.prototype.includes} */
let hijackArrayIncludes__raw = null

function hijackArrayIncludes__hijacked(s) {
    return hijackArrayIncludes__raw.apply(this, arguments) || (
        enableDisplayIE &&
        s === ieName &&
        hijackArrayIncludes__raw.call(this, "chrome") &&
        hijackArrayIncludes__raw.call(this, "firefox") &&
        hijackArrayIncludes__raw.call(this, "safari") &&
        hijackArrayIncludes__raw.call(this, "nodejs")
    )
}

function hijackArrayIncludes() {
    if (Array.prototype.includes !== hijackArrayIncludes__hijacked) {
        hijackArrayIncludes__raw = Array.prototype.includes
        Array.prototype.includes = hijackArrayIncludes__hijacked
    }
}

const { json } = Response.prototype
Response.prototype.json = async function () {
    const out = await json.apply(this, arguments)
    if (out?.data?.__compat?.support) {
        enableDisplayIE = !!(forceEnableDisplayIE || out.data.__compat.support.ie?.[0]?.version_added)
        console.log('[browser-compatibility-display-ie] enableDisplayIE:', enableDisplayIE)
        if (enableDisplayIE) {
            hijackArrayIncludes()
            addStyleIEIcon()
            if (out.browsers) {
                const ie = out.browsers[ieName]
                if (ie) {
                    delete out.browsers[ieName]
                    out.browsers[ieName] = ie
                } else {
                    out.browsers[ieName] = {
                        "accepts_flags": false,
                        "accepts_webextensions": false,
                        "name": "Internet Explorer",
                        "releases": {},
                        "type": "desktop"
                    }
                }
            }
        }
    }
    return out
}
