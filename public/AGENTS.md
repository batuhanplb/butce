# public/ rules

- Recurring income retains the existing effective-month `amts` schedule; `cash-income.js` builds plans via `periodsToAmts` (monthly items: "İptal edene kadar" or "Değişken" period list, no end month) and preserves past entries and actual/skip overrides. Why: future salary plans must not rewrite history.
- Selected transaction changes live in `transaction-bulk.js`; category changes may use any category type (user wants cross-type categories) and account changes skip self-transfers. Why: bulk edits must preserve transaction meaning.
- Settings subviews use settings hash history; page scroll positions are stored per view. Why: Back must return to the parent context.

- Shared presentation changes go in `butce-theme.css` (loaded after legacy styles) as revertible appended blocks (Dağılım dili, Landing 1.3.5.0, Simülasyon 1.3.6.0, 1.3.7.0); never change budgeting logic for visuals. Why: one revertible block per refresh.
- `.mod .krow` rows never wrap the amount (`.r` `flex:0 0 auto`, nowrap; name/%pay ellipsis); adapt with `@container` on module width. Under 230px `.dl` month diff shows under the amount, `.dl.muted` hidden. Why: narrow modules broke amounts and hid the diff.
- Dashboard layout = order + size preset (`SZ`, v3 `{id,on,sz}`); `meta.dashMobile` mobile, `meta.dash` desktop. Why: stable modules.
- Mobile bar `mbar()`: 6 tabs + 2 `.msep` separators (İşlemler|Gider, Dağılım|Nakit); Hesaplar/Kategoriler/Lehdarlar open from the Settings list (`renderSettings()`); Yatırımlar desktop only. Why: user wants grouped, simple menu.
- Amount typing format lives in `transaction-input.js` (dot + 3+ digits = thousands, 1–2 = decimals); keep `src/test/transaction-input.test.js` green. Why: 400.000 limit bug.
- Cash simulation math in `cash-sim.js` (weighted 12-month estimate, outliers clipped at 2.5× median); sim rows added with `on:true`; selection `meta.cash.sim.sel` never shared. Cash flow uses plain calendar months (salary day removed). Why: correct estimates, no double counting.
- Chart buttons use visible `.cbv` + `aria-label`, never `title`. Why: white browser tooltip.
- Landing visuals (`landingHtml()`, `.ld-shot`/`.ld-mini`) use only theme variables and must be updated with UI changes (`src/test/landing.test.js`). Why: login screen shows every feature.
- `sw.js` is cache-first stale-while-revalidate: instant open, new version on next open. Why: slow connections made opening slow.
- Open subscriptions (`meta.recs`) generate only past + next occurrence (`recN`, `extendRecs`); paused via `r.paused` (`subPause`). Why: user wants current + next everywhere.
