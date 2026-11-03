# 30 Ekim düzenlemeleri
- [x] Düzenli gelir: gelecek ayları ve çok aylık tutar dönemlerini planla; geçmişi koru (6 aylık ve tek aylık plan kaydedildi, yenileyerek okundu).
- [x] Ayar alt menülerinde geri dönüş; aylık raporları dikey listele (tarayıcı geri ve Kategoriler → Ayarlar doğrulandı).
- [x] Abonelik logo/ad/fiyat tek satır; anasayfa hesap baloncuğu; işlem ekle %15 büyüt.
- [x] Tarayıcı doldurma önerilerini engelle; işlemlerde varsayılan son 30 gün ve geri dönüşte kaydırma konumu (500px konum geri geldi; tarayıcı önerileri cihazın tercihiyle zorlanabilir).
- [x] Toplu kategori/hesap değişikliği ve test hesabında doğrulama (2 işlem değiştirildi, yenileyerek okundu; tüm deneme kayıtları silindi; 61 test geçti).

# Tasarım düzenlemesi
- [x] İşlem formunu sadeleştir: tek alanda kategori araması, kaydırılabilir liste ve yazarken binlik ayırıcı; gerçek test hesabında doğrula.
- [x] Ortak yazı, renk, boşluk ve kontrol düzenini sadeleştir.
- [x] Tabloları ve küçük modülleri taşmadan okunabilir yap.
- [x] Test hesabında telefon ve bilgisayar görünümünü doğrula.

# Mobil modül düzenleme
- [x] Mobilde elle boyutlandırma, taşıma, ekleme ve çıkarmayı aç.
- [x] Telefon yerleşimini kayıtlı masaüstü düzenini bozmadan sakla ve doğrula.

# Nakit akışı bölümü
- [x] "Kalan nakit" adını "Nakit akışı" olarak değiştir (menü, başlık, modül, paylaşım).
- [x] Bölümü ileriye dönük 12 ay takibi olarak anlatan kısa bir açıklama satırı ekle.
- [x] Telefon görünümünde ay grafik rakamlarının üst üste binmesini gider.

- [x] Modül düzenleme: boy seçenekleri + oklar (web), liste görünümü (telefon)
- [x] Capacitor kabuğu + GitHub ile otomatik APK
- [x] APK/Android katmanını tamamen kaldır (1.3.0.0): kullanıcı PWA kullanıyor, APK ile iş yok
- [ ] Uygulama içinde Google girişi (uygulamaya geri dönüş bağlantısı gerekiyor)
- [x] Web değişikliklerinin kurulum gerektirmeden gelmesi (PWA: her açılışta sunucudan)
- [x] Alt kategori ayracı ":" (geçmiş lehdarlar dahil)
- [x] Lehdar boşsa, alan terk edilince kategori adını yaz (2. seçenek)
- [x] Mobil alt menü: Yatırımlar menüden çıktı; Gider ve Dağılım üst sekmeye taşındı (7 sekme tek sıra, 1.3.1.0)


# Daha sonra yapılacaklar
- [x] Dağılım sayfasının tasarımını yenile: dilime dokununca merkezde tutar/pay, altında detay kartı (işlem adedi, ortalama, en yüksek, son işlem), listede eşleşen satır vurgusu ve "işlemleri gör / alt kategoriler" kısayolları (1.2.47.0).
- [ ] Eksik veya yanlış çalışan tıklamaları kontrol edip düzelt (kullanıcının isteğiyle sıraya alındı; henüz uygulanmayacak).

# Tasarım birliği (1.3.2.0)
- [x] Dağılım sayfasının dilini (sunk hücre, eyebrow etiket, tabular sayı) İşlemler, Nakit, Borç, Abonelikler, tablolar ve tanım listelerine taşı (mantık ve yerleşim aynı).
- [x] İşlemler'deki 5 ayrı filtre satırını tek yatay kaydırmalı şeride indir; filtre durumu ve davranışı değişmedi.
- [x] 399px altındaki ekranlarda özet hücrelerini satıra çevirerek tutarın kesilmesini önle.

# Liste satırlarında tutar sığdırma (1.3.2.1)
- [x] Anasayfa modül listelerinde (Dağılım, En büyük harcamalar, Hesaplar) tutar artık hiç kırılmıyor: "₺27.067" tek satırda kalıyor, ad ve "%22,44 pay" etiketi tek satırda üç nokta ile kısalıyor.
- [x] Kırılma viewport'a değil modülün kendi genişliğine göre yönetiliyor (`@container`): dar modülde tutar/yüzde bir tık küçülür, 220px altında ad için yer açılır.

# Mobilde ay farkı (1.3.3.0)
- [x] Dağılım satırlarındaki "geçen aya göre değişim" (↑/↓ %) mobilde gizlenmiyor: 230px altındaki modüllerde tutarın altında 9-9,5px'lik sağa yaslı satır olarak görünüyor.
- [x] Önceki ay verisi olmayan satırlarda gelen "—" işareti dar modülde gizli kalır (kalabalık yapmasın); satır yüksekliği artmadı, liste yoğunluğu aynı.

# Nakit akışı simülasyonu (1.3.4.0)
- [x] Nakit akışı sayfasına **Orijinal / Simülasyon** sekmesi: seçilen kategori ve lehdarlar geçmiş aylardan tahmin edilip gider satırı olarak ekleniyor.
- [x] Tahmin düz ortalama değil: son 12 ay, 3 aylık yarı ömürle ağırlıklı; tek seferlik uç harcamalar medyanın 2,5 katında kırpılıyor; kalemin ilk göründüğü aydan öncesi "veri yok" sayılıyor.
- [x] Ay içinde yalnızca kalan tahmin düşülüyor (tahmin 20.000, 1.000 harcandı → 19.000); gelecek aylarda tahminin tamamı sayılıyor.
- [x] "Maaş / dönem başlangıcı" mekaniği tamamen kaldırıldı: nakit akışı artık düz takvim ayı (1 → ay sonu) ile çalışıyor, ayarlardaki gün seçimi kaldırıldı.
- [x] Simülasyon tahminleri paylaşılan sayfada yok; paylaşım her zaman Orijinal görünümü ve salt okunur satırları gönderiyor.
- [x] Birim testleri: `src/test/cash-sim.test.js` (tahmin/kırpma/kalan/aylık toplam) ve `src/test/cash-sim-ui.test.js` (sekme, tahmin satırı, gelecek ay, kalem seçimi).

## Nakit akışı simülasyonu düzeltmeleri (1.3.4.1)
- [x] Tahmin satırları artık ayın çıkış toplamına ve "Ay sonu kalan"a giriyor: `cashPlan({sim})` satırları `on:true` ile ekleniyor, böylece simülasyon kalemleri sonraki ayların bakiyesinden gerçekten düşüyor (önce çıkış toplamı `l.on` filtrelediği için tahmin hiç sayılmıyordu).
- [x] Simülasyon kartı site diliyle hizalandı: kesikli çerçeve, "≈" rozeti ve uzun not kaldırıldı; normal kart + satır listesi + ince toplam satırı, sağ üstte sade "**+ Gider**" butonu (eskiden "+ Kalem").
- [x] Sekme çubuğu (`.cash-tabseg`) kompaktlaştı (32px buton, sunk zemin, aktif beyaz + gölge); ay kartındaki tahmin satırı tick hizasına girintili, soluk italik.
- [x] UI testine "tahmin çıkış toplamına ve ay sonu kalanına yansır" eklendi (cari ay 19.000 kalan, gelecek ay 20.000 tam tahmin).

# Tanıtım ekranında özellik örnekleri (1.3.5.0)
- [x] Giriş öncesi ekranda "Neler yapabilirsin" maddelerinin her birinin altına ilgili sayfanın küçük bir örneği eklendi: nakit akışı, değişken tutarlar, ekstre eşleştirme, kart kesim uyarısı, borç takvimi, abonelikler, aylık rapor, günlük harcama, toplu işlem, ana sayfa düzeni, paylaşım linki, içe aktarma.
- [x] Örnekler görsel dilini uygulamadan alır: renk, çizgi ve köşe yarıçapı yalnızca tema değişkenlerinden (`var(--...)`) gelir; sert kodlanmış renk yok, koyu temada da aynı görünür.
- [x] `src/test/landing.test.js`: her özelliğin bir örneği olduğunu, örneklerde sabit renk kullanılmadığını ve gerçek sayfa adları/tutarların gösterildiğini doğrular; örneksiz yeni özellik eklenirse test kırılır.
- [x] `AGENTS.md` kuralı: uygulamada görsel değişiklik yapıldığında tanıtım ekranındaki `.ld-shot` / `.ld-mini` örnekleri de güncellenir.

## Tutar alanlarında binlik ayırıcı düzeltmesi (1.3.5.1)
- [x] Binlik ayırıcıdan sonra yazılan hane artık sayıyı büyütüyor: `"4.000"` + `0` eskiden `"4,0000"` gibi okunup alanı **4,00**'a düşürüyordu, bu yüzden Hesaplar > kredi kartı **Limiti** 400.000 yazılamıyordu; noktadan sonra 3+ hane artık her zaman binlik kabul ediliyor (`"40.000"`, `"400.000"`).
- [x] Düzeltme `public/transaction-input.js` içinde tek kural (`after.length > DECIMALS`), yani işlem tutarı, açılış bakiyesi, taksit satırları, borç limiti gibi tüm tutar alanlarında geçerli; ondalık yazım (`1.250,5`) ve `parseAmt` ile kaydetme değişmedi.
- [x] `src/test/transaction-input.test.js`: `"4.0000" → "40.000"`, `"40.0000" → "400.000"`, `"400.0000" → "4.000.000"` tablo satırları + "400000'i tuş tuş yaz" ve "binlikten sonra ondalık yazılabilir" testleri (21 → 27 test).




# Simülasyon ekranı görsel düzeni (1.3.6.0)
- [x] Tahmin kartı ve ay kartı satırları sitenin ritmine oturdu: kart içi 14px boşluk, satır başına 9-10px dikey pay ve 1px ayırıcı; metinler artık kart kenarına/çizgiye yapışmıyor (eskiden `.card` padding'siz ve `.simrow` yatay payı sıfırdı).
- [x] Sekme sitenin `.seg` bileşenine indirildi (6/4px köşe, 30px yükseklik, 12px yazı, siyah `box-shadow` yerine `--line` çerçeve); uyarı kutusu pembe çerçeve yerine `--sunk` hücre + "DİKKAT" eyebrow, tutar sağda.
- [x] Özet hücrelerinde mavi "ok" tinti kaldırıldı (yalnız eksi durumda %7 `--exp` tint, `.sum` ile aynı oran); grafikte tarayıcının native `title` balonu kaldırıldı, bar renkleri satır içi stilden CSS'e taşındı (seçili ay `--sunk` sütun + ince çerçeve, eksi aylar `--exp`).
- [x] Ay kartında gelir/gider sütunları ince dikey çizgiyle ayrıldı, satırlar 1px çizgiyle bölündü ve 44px tick hizası korundu; 599px altında tek sütuna iner.
- [x] Tahmin satırı kesikli kenar/italik/bej zemin yerine sitenin "soluk" dili: soluk ad + tutar ve `tahmin` etiketi; ay gezinmesi ikon butonlara (`.ib`) döndü, başlıkla birlikte ortalanıyor.
- [x] Tüm stiller `butce-theme.css` sonundaki "Simülasyon / nakit akışı görsel düzeni (1.3.6.0)" bloğunda; hesaplama, `cash-sim.js`, paylaşım görünümü ve testler değişmedi. Doğrulama: headless Chrome ile 1400px açık/koyu ve 390px ekran görüntüleri, yatay taşma yok (`scrollWidth == clientWidth`).


# 1.3.7.0 toplu revizyon
- [x] Abonelik modülünde logo + isim yan yana
- [x] Ekstrede basılı tut: sil / önceki-sonraki ekstreye taşı (tarih değişmez), seçim çubuğu ekstrede de çıkıyor
- [x] Lehdar önerisinde kategoriler de (lehdarlar sayfasına yansımaz)
- [x] Seçim modunda "Tümünü seç"
- [x] Lehdarlar sayfasında gider/gelir ayrımı yok
- [x] Aboneliği duraklat / devam ettir
- [x] Lehdar/kategori sayfasına geri dönünce kaydırma yeri korunur
- [x] Klavye açılınca alt menü klavyenin altında kalır
- [x] Uygulama önce önbellekten açılır, arka planda bağlanır
- [x] Borç ve gider tabloları kompakt; borçta ay toplamı ay adının altında
- [x] İşlemler: dönem ve geçmiş/gelecek ayrı satırlarda; hesap seçimi varsayılan açık
- [x] Abonelik: mevcut + bir sonraki ödeme, sonraki tarih gelince yenisi eklenir
- [x] Dönemler: Son 30 gün, Bu ay, Geçen ay, Diğer ▾, Tümü
- [x] Mobil alt menü 6 sekme + ayırıcılar; Tanımlar ayarlara taşındı
- [x] Ayarlar liste düzeni, 4 tema, yedekle/geri yükle, uygulama/bildirim/nakit kutuları kaldırıldı

# Nakit akışında geçmiş aylar (1.3.12.0)
- [x] `cashPlan()` artık `opt.back` ile geçmiş ay üretiyor: aynı satır mantığı (düzenli kalem, borç taksiti, planlı işlem) geçmiş aylar için de çalışıyor; "elde" bugünkü bakiyeden geriye yürütülüyor (`elde[önceki] = elde[sonraki] + çıkış − giriş`), böylece ay sonu kalanı sonraki ayın "elde"siyle birebir bağlanıyor.
- [x] Cari ayda sol ok aktifleşti (eskiden `prev` tanımsız olduğu için pasifti): geriye 6 ay dönülebiliyor, orada tiklenmemiş kalem görünüp işaretlenebiliyor; tick `meta.cash.items[].skip`'e yazılıyor ve kalan anında güncelleniyor.
- [x] Grafik penceresi seçili aydan itibaren 12 ay kayıyor; "Dikkat, eksiye düşüyor" uyarısı yalnızca cari ve ileri aylar için veriliyor; simülasyon tahminleri geçmiş aylara eklenmiyor (o ayın harcaması zaten gerçekleşti).
- [x] Paylaşılan sayfada da geçmiş aylar gezilebiliyor (`cashPlan({ back: CASH_BACK })`).
- [x] `src/test/cash-sim-ui.test.js`: sol okun aktifliği + önceki aya geçiş, geçmiş aydaki kalemin tiklenip `skip`'e yazılması, geçmiş ayın geriye yürütülmüş elde/çıkış/kalan değerleri (5 → 8 test).

# Abonelik logoları (1.3.13.2)
- [x] `subIco()` artık `--sico` değişkeni ve `subico` sınıfı üretiyor; `original-index.html` içindeki `@media (max-width:899px){ .cic{width/height:32px!important} }` kuralı satır içi boyutu geçersiz kıldığı için abonelik logoları hep 32px kalıyordu.
- [x] `butce-theme.css` sonuna eklenen blokla her logo tek tip: `border-radius:50%`, `padding:0`, `object-fit:cover` — logo beyaz kutuyu artık tamamen dolduruyor, daire/karesi karışık durmuyor.
- [x] Boyutlar: anasayfa abonelik modülü 32 → 36px, abonelikler sayfası 32 → 42px, hesap listesi 34px korunuyor (`--sico:34px`).
- [x] Sürüm 1.3.13.2, `butce-theme.css?v=37`, `sw.js` butce-v76.
