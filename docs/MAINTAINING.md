# Ora — Maintenance guide

A static traditional Catholic prayer app with a guided starting point, a prayer treasury, and the daily Roman liturgy. No package install, backend, analytics, account, or API key.

## Preview

Run `python3 -m http.server 4173` in this directory and visit http://localhost:4173.

## Included

- Guided prayer paths for beginning a daily habit, worry and protection, evening recollection, and Eucharistic devotion. Each has step-by-step instructions, actual prayer text, listening, and browser-local resume/completion state.
- A home screen with today's celebration and direct links to the appointed Mass lesson and Gospel.
- The Mass and all eight canonical hours for every date in 2026–2027, generated with the Divinum Officium 1960 calendar engine. Includes complete English texts, psalms, brief chapters, Scripture selections, Matins lessons, and textual rubrics. The traditional calendar can differ from local diocesan calendars.
- In-app calendar navigation, lessons-only and complete-text views, section navigation, contextual starting instructions, and listening for each section. Date, hour, and view are retained in a shareable hash URL.
- 16 traditional private prayers with Latin titles, English texts, meanings, and customary uses. Search, categories, essentials and Pietà-style collections, and saved favorites.
- Installed English speech voices are preferred (`localService`), with fallback to the device speech service if unavailable or if the selected voice fails. Reading pace and text size are adjustable. An optional Kokoro browser voice is loaded on request from external hosting; it is not bundled in the repository. Device defaults may use an online service; offline speech requires a working installed voice.
- Service-worker caching for the app and browser caching of each opened liturgical day. The full two-year corpus is hosted statically, but only the selected day is downloaded. Previously opened days work offline; this does not download two years to the device at installation. HTTPS or localhost is required for offline support.

The application files are about 65 KB before compression. The calendar index is about 220 KB, and an ordinary liturgical day is about 125 KB. The complete static text corpus is about 85 MB. No liturgical source service is called at runtime.

## GitHub Pages

Push this repository to GitHub on `main`. Pages deploys from the root of the `gh-pages` branch. Source lives on `main`; copy only the public app files, assets, and data into `gh-pages` when updating. An optional Actions workflow template is provided at `scripts/pages-workflow.yml.example` for credentials with workflow permission. All asset paths are relative, so GitHub project Pages subdirectories work. Hash routes require no server rewriting. Repository: https://github.com/awerds/prayer. GitHub Pages publication uses the gh-pages branch. See ../SECURITY.md for the security review and remaining limitations.

Run checks locally:

```sh
node --check app.js
node --check liturgy.js
node --check prayers.js
node --check sw.js
python3 scripts/check_liturgy.py
node scripts/check_reader.mjs
```

## Liturgical text provenance and regeneration

Generated from [Divinum Officium](https://github.com/DivinumOfficium/divinum-officium) commit `e8feeaeddca16e27e6eb349dcfb29c795d62198a`, following **Rubrics 1960 - 1960**, English, first Mass when a day provides multiple Masses. Textual rubrics and responses are retained; presentation is plain text with app-specific section headings. This app does not provide a modern lectionary, the 1970 Liturgy of the Hours, local calendars, or alternate Christmas Masses. The source's MIT license is retained at `data/liturgy/LICENSE.txt` and linked from the reader.

The generator uses the source calendar engine instead of calculating feast precedence independently. It includes all Mass lessons and Matins readings, including non-Scriptural patristic and hagiographical lessons. References are retained beside their complete appointed text. Psalm numbering follows the source's traditional numbering.

To regenerate or extend coverage, use a source checkout at the pinned commit, Python 3, Perl, and the Perl CGI module (`CGI.pm`):

```sh
git clone https://github.com/DivinumOfficium/divinum-officium.git /tmp/ora-divinum-officium
git -C /tmp/ora-divinum-officium checkout e8feeaeddca16e27e6eb349dcfb29c795d62198a
python3 scripts/build_liturgy.py --source /tmp/ora-divinum-officium --start 2026-01-01 --end 2027-12-31
python3 scripts/check_liturgy.py
node scripts/check_reader.mjs
```

The generator resumes completed dates. Use `--force` to regenerate existing dates. Expanding the date range retains previously generated dates in the index. No runtime generation is required for GitHub Pages. Review future source updates and advance the pinned revision deliberately.

## Prayer treasury

The Pietà-style collection includes the Memorare, Anima Christi, Prayer Before a Crucifix, Spiritual Communion, Saint Michael prayer, and Salve Regina. It is not a reproduction of a specific Pietà Prayer Book edition. Editorial explanations distinguish liturgical texts and private devotions. No approval, indulgence, or devotional promise is inferred from inclusion. A specific edition and its publication details would be needed for an edition-specific catalog.

English devotional formulations vary by edition. Vatican News links are general prayer references rather than proof of every exact wording or a prayer-specific imprimatur. Explanations and guided instructions are editorial summaries. Sources include [Vatican News prayers](https://www.vaticannews.va/en/prayers.html), the [Catechism on the Lord's Prayer](https://www.vatican.va/content/catechism/en/part_four/section_two.html), and the [Enchiridion Indulgentiarum](https://www.vatican.va/content/dam/wss/roman_curia/tribunals/apost_penit/documents/rc_trib_appen_doc_20020826_enchiridion-indulgentiarum_lt.html). Content should receive Catholic editorial review before being presented as an authoritative prayer book.

To add private prayers, extend `prayers.js`. When changing app shell assets, increase the shell cache version in `sw.js`. Opened daily texts are kept in a separate browser cache across shell updates.
