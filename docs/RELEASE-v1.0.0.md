# Ora v1.0.0

The first published release of Ora, a static traditional Catholic prayer companion.

**[Open the app](https://awerds.github.io/prayer/)** · **[User manual](https://github.com/awerds/prayer#readme)**

## Included

- Stained-glass styling with frosted reading panels.
- Four guided prayer paths and browser-local progress.
- Sixteen searchable prayers, explanations, Pietà-style and essentials collections, and favorites.
- English Mass and all eight canonical hours for 2026–2027 using the 1960 Roman calendar.
- Complete liturgical text and focused lesson views, with date navigation and shareable links.
- Device speech and an optional downloadable Kokoro browser voice.
- Timed call-and-response pauses in the prayer reader.
- Offline application caching and caching of opened liturgical dates.
- Security hardening and a documented source review.

## Documentation and screenshots

The README is now a step-by-step user manual. Five screenshots from the published app are attached: Today, guided prayer, prayer library, voice settings, and the liturgy reader. The maintenance guide retains source provenance and deployment instructions.

## Validation and limits

JavaScript syntax and focused-reader checks passed. Calendar validation covers 730 consecutive days and 6,570 offices/Masses. The published homepage and daily lesson loading were verified in-browser.

The optional browser voice retains third-party code/model dependencies and has not completed end-to-end production playback verification. Timed responses use silence rather than speech recognition. Guided steps advance manually. Calendar coverage ends in 2027 and includes the first Mass on days with multiple Masses. See the user manual and SECURITY.md for details.
