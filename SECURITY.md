# Security review — 2026-11-13

Reviewed application code, speech loading, local storage, URL routing, service worker, and deployment workflow. This is a source review and targeted validation, not a penetration test or a security guarantee.

## Changes

- Added a restrictive Content Security Policy: same-origin app assets, bounded speech CDN/model origins, no plugins, no base URL changes, and no form submission. WebAssembly compilation is permitted for optional browser TTS. Inline styles remain allowed for reading preferences.
- Added no-referrer policy.
- Allowlisted liturgical hour parameters and used own-property checks to prevent prototype-property routing failures.
- Validated saved prayer IDs, reading size/rate, and guided prayer positions before use.
- Scoped service-worker requests to the deployed application path.
- Publish only explicitly selected application assets and data, excluding scripts, repository metadata, and documentation.
- Corrected guided-prayer resume routing.

## Verification

JavaScript syntax, lesson-view checks, and complete 730-day calendar validation passed. A targeted credential-pattern scan found no matches. Prayer and lesson text rendered as HTML is escaped or assigned with textContent; no application eval or user-authored script execution was found.

## Remaining limitations

The optional KittenTTS 2 Pico browser voice loads `onnxruntime-web` from jsDelivr (using `blob:` script/worker glue for WASM) and the quantized ONNX model, voice embeddings, and Misaki lexicon from Hugging Face. Those providers remain supply-chain trust dependencies. Device speech may use the operating system's network service. Favorites/preferences remain in browser storage and should not be treated as encrypted confidential storage.

GitHub Pages does not provide arbitrary response-header configuration. The CSP is supplied in HTML; frame-ancestors cannot be enforced with a meta policy. No account, credentials, private user content, backend, or payment flow is present.
