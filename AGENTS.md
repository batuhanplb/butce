<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Subdirectories have their own `AGENTS.md` (see `public/AGENTS.md`); read it before changing files there.
- Proje adı **butce** (GitHub `batuhanplb/butce`, marka "Bütçe"). Why: tek ve tutarlı ad.
- `/` and `/index.html` serve `src/original-index.html` verbatim; vanilla `public/app.js`/`core.js` hold the app. Why: the static app is the functional source of truth.
- `app.js` imports `/cloud-store.js`, bundled from `src/cloud-store/entry.ts`; run `bun run build:cloud-store` after editing it. Its guarded Capacitor `?native_auth=1` bridge and the remaining `@capacitor/*` deps stay until the bundle is rebuilt without them. Why: the static app runs the committed bundle.
- Uygulama Chrome "Ana ekrana ekle" PWA olarak kullanılıyor; Android/APK/OTA katmanı 1.3.0.0'da kaldırıldı, APK önermeyin. Why: gerçek kullanım PWA.
- Yayın akışı: `git push` → önizleme; canlıya geçiş yalnızca kullanıcı Publish'e basınca. Repo canlıdan ileride olması normaldir, raporlama/publish'e itme; canlının repodan ileri olması gerçek uyuşmazlıktır. Why: kullanıcı bu akışı istiyor.
- Göreve başlamadan `git fetch origin` + `git status`; yerel `main` gerideyse önce al. Lovable dışından commit yazarı `batuhanplb <81333730+batuhanplb@users.noreply.github.com>`; pushed history asla yeniden yazılmaz. Why: Lovable düzenlemeleri git ile yansır, bot kimliği commit kartlarını gizler.
- `APP_VERSION` (public/app.js, 1.a.b.c) her değişiklikte artar: son hane küçük, üçüncü özellik, ikinci büyük sistem. Why: kullanıcı sürümleri bununla izler.
