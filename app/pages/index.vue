<script setup lang="ts">
definePageMeta({
  layout: false,
})

useHead({
  htmlAttrs: {
    lang: 'id',
  },
})

useSeoMeta({
  title: 'Rangkai | Pindai ISBN, rapikan metadata, ekspor ke SLiMS',
  description:
    'Rangkai membantu pustakawan Indonesia memindai ISBN, merapikan metadata dengan AI, lalu mengekspor catatan katalog siap pakai untuk SLiMS, Koha, CSV, dan MARC21.',
  ogTitle: 'Rangkai | Pindai ISBN, rapikan metadata, ekspor ke SLiMS',
  ogDescription:
    'Alur katalog yang tenang dan rapi untuk sekolah, kampus, dan perpustakaan komunitas.',
  twitterCard: 'summary_large_image',
})

const primaryCta = '/scan/mobile'
const secondaryCta = '#cara-kerja'

const workflow = [
  {
    number: '01',
    title: 'Pindai ISBN atau barcode',
    body:
      'Gunakan kamera ponsel atau masukan manual untuk mulai dari buku berikutnya tanpa mengubah kebiasaan kerja staf.',
  },
  {
    number: '02',
    title: 'Tarik, gabungkan, dan rapikan metadata',
    body:
      'Rangkai mengambil data dari beberapa sumber bibliografis, lalu merapikan judul, nama penulis, klasifikasi, dan subjek.',
  },
  {
    number: '03',
    title: 'Tinjau lalu ekspor catatan jadi',
    body:
      'Petugas tetap memegang kendali sebelum ekspor ke CSV SLiMS, MARC21, atau alur lain yang kompatibel dengan sistem perpustakaan.',
  },
]

const capabilities = [
  {
    title: 'CSV dan MARC21 siap SLiMS',
    body:
      'Ekspor dengan format yang bisa dipakai langsung untuk alur kerja katalogisasi dan impor data.',
  },
  {
    title: 'Ekspor kompatibel Koha',
    body:
      'Siapkan record yang tetap selaras dengan kebutuhan perpustakaan yang memakai Koha.',
  },
  {
    title: 'Scan beruntun atau batch cepat',
    body:
      'Cocok untuk backlog besar, penerimaan buku baru, dan sesi pemindaian yang tidak boleh tersendat.',
  },
  {
    title: 'Banyak sumber bibliografis',
    body:
      'Metadata dikumpulkan dari beberapa sumber tepercaya agar catatan lebih lengkap dan lebih mudah dibandingkan.',
  },
  {
    title: 'Normalisasi AI yang terarah',
    body:
      'Judul, nama penulis, klasifikasi, dan subjek heading dibersihkan tanpa menghapus jejak asalnya.',
  },
  {
    title: 'Antrean scan luring',
    body:
      'Saat koneksi putus, scan tetap masuk antrean lokal dan tersinkron ketika jaringan kembali tersedia.',
  },
]

const compatibility = ['SLiMS', 'Koha', 'CSV', 'MARC21', 'UTF-8', 'ISBN-10', 'ISBN-13']

const faqs = [
  {
    question: 'Aman untuk SLiMS yang sudah ada?',
    answer:
      'Ya. Rangkai menyiapkan ekspor yang selaras dengan alur impor, sehingga Anda tidak perlu mengubah instalasi SLiMS yang sudah berjalan.',
  },
  {
    question: 'Bisa diedit sebelum ekspor?',
    answer:
      'Bisa. Setiap saran AI dapat ditinjau, diubah, atau ditolak sebelum file akhir dibuat.',
  },
  {
    question: 'Kalau sumber metadata tidak sepakat?',
    answer:
      'Rangkai menampilkan sumber yang dipakai dan memberi catatan saat ada perbedaan, supaya petugas bisa memilih hasil yang paling tepat.',
  },
  {
    question: 'Bisa offline?',
    answer:
      'Bisa untuk antrean scan. Catatan tersimpan lokal dulu, lalu disinkronkan saat koneksi kembali.',
  },
  {
    question: 'Banyak ISBN sekaligus?',
    answer:
      'Bisa. Mode scan beruntun dan batch dibuat untuk memproses banyak buku tanpa harus membuka alur baru setiap kali.',
  },
]

const beforeFields = [
  { label: 'ISBN', value: '978-602-...-...' },
  { label: 'Judul', value: '—' },
  { label: 'Penulis', value: '—' },
  { label: 'Penerbit', value: '—' },
  { label: 'Tahun', value: '—' },
  { label: 'Bahasa', value: '—' },
]

const afterFields = [
  { label: 'Judul', value: 'Pengantar Literasi Informasi' },
  { label: 'Penulis', value: 'Sari, Dewi' },
  { label: 'Penerbit', value: 'Pustaka Nusantara' },
  { label: 'Tahun', value: '2024' },
  { label: 'Bahasa', value: 'Indonesia' },
  { label: 'Deskripsi fisik', value: 'xii, 214 hlm. : ilustrasi ; 24 cm' },
  { label: 'DDC', value: '025.5' },
  { label: 'Subjek', value: 'literasi informasi; perpustakaan sekolah; pengolahan bahan pustaka' },
]
</script>

<template>
  <div class="page-shell">
    <a class="skip-link" href="#konten">Lewati ke konten utama</a>

    <header class="masthead">
      <div class="masthead__brand">
        <span class="masthead__mark" aria-hidden="true">RK</span>
        <div>
          <p class="masthead__eyebrow">Rangkai</p>
          <p class="masthead__sub">Asisten katalog buku untuk pustakawan Indonesia</p>
        </div>
      </div>

      <nav class="masthead__nav" aria-label="Navigasi utama">
        <NuxtLink to="#cara-kerja">Cara kerja</NuxtLink>
        <NuxtLink to="#contoh-catatan">Contoh catatan</NuxtLink>
        <NuxtLink to="#fitur">Fitur</NuxtLink>
        <NuxtLink to="/history">Riwayat</NuxtLink>
        <NuxtLink to="/faq">FAQ</NuxtLink>
      </nav>
    </header>

    <main id="konten">
      <section class="hero section">
        <div class="hero__content">
          <p class="section-kicker">Untuk sekolah, kampus, komunitas, dan perpustakaan kecil</p>
          <h1>Barcode ISBN masuk, kartu katalog keluar.</h1>
          <p class="hero__lede">
            Rangkai mengurangi pekerjaan katalogisasi yang berulang. Pindai ISBN, biarkan metadata
            dirapikan AI, lalu ekspor record yang siap dipakai di SLiMS atau Koha.
          </p>

          <p class="hero__workflow" aria-label="Alur utama Rangkai">
            Pindai barcode <span aria-hidden="true">→</span> metadata dirapikan AI
            <span aria-hidden="true">→</span> ekspor ke SLiMS
          </p>

          <div class="hero__actions">
            <NuxtLink class="button button--primary" :to="primaryCta">Mulai Memindai</NuxtLink>
            <NuxtLink class="button button--secondary" :to="secondaryCta">Lihat Cara Kerjanya</NuxtLink>
          </div>

          <p class="hero__note">
            Targetnya sederhana: satu record katalog yang bisa dipakai dalam kurang dari 30 detik per
            buku, saat sumber metadata tersedia.
          </p>
        </div>

        <aside class="hero__panel" aria-label="Pratinjau hasil kerja">
          <div class="record-card">
            <div class="record-card__top">
              <span class="record-card__stamp">CATATAN KATALOG</span>
              <span class="record-card__badge">siap tinjau</span>
            </div>

            <div class="record-card__split">
              <div class="record-card__block">
                <p class="record-card__label">Sebelum</p>
                <ul class="field-list" aria-label="Catatan hasil pindai kasar">
                  <li v-for="field in beforeFields" :key="field.label" class="field-list__item">
                    <span class="field-list__key">{{ field.label }}</span>
                    <span class="field-list__value">{{ field.value }}</span>
                  </li>
                </ul>
              </div>

              <div class="record-card__block record-card__block--after">
                <p class="record-card__label">Sesudah</p>
                <ul class="field-list" aria-label="Catatan katalog yang sudah dirapikan">
                  <li v-for="field in afterFields" :key="field.label" class="field-list__item">
                    <span class="field-list__key">{{ field.label }}</span>
                    <span class="field-list__value">{{ field.value }}</span>
                  </li>
                </ul>
                <p class="record-card__source">
                  Sumber dirujuk: Google Books, Open Library, Library of Congress
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section id="cara-kerja" class="section process">
        <div class="section-heading">
          <p class="section-kicker">Cara kerja</p>
          <h2>Tiga langkah, tanpa memaksa pustakawan berpindah alat kerja.</h2>
        </div>

        <ol class="workflow-list">
          <li v-for="item in workflow" :key="item.number" class="workflow-list__item">
            <span class="workflow-list__number">{{ item.number }}</span>
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.body }}</p>
            </div>
          </li>
        </ol>
      </section>

      <section id="contoh-catatan" class="section comparison">
        <div class="section-heading section-heading--tight">
          <p class="section-kicker">Contoh nyata</p>
          <h2>Catatan yang tadinya kosong menjadi record katalog yang lengkap.</h2>
        </div>

        <div class="comparison__grid">
          <article class="comparison-card comparison-card--before">
            <div class="comparison-card__head">
              <span class="comparison-card__index">Hasil pindai kasar</span>
              <span class="comparison-card__state">belum lengkap</span>
            </div>
            <p class="comparison-card__lead">Barcode terbaca, tetapi isian katalog masih minim.</p>
            <ul class="catalog-fields">
              <li><span>ISBN</span><strong>978-602-...</strong></li>
              <li><span>Judul</span><strong>—</strong></li>
              <li><span>Penulis</span><strong>—</strong></li>
              <li><span>Penerbit</span><strong>—</strong></li>
              <li><span>Tahun</span><strong>—</strong></li>
              <li><span>Bahasa</span><strong>—</strong></li>
            </ul>
          </article>

          <article class="comparison-card comparison-card--after">
            <div class="comparison-card__head">
              <span class="comparison-card__index">Catatan katalog siap tinjau</span>
              <span class="comparison-card__state comparison-card__state--success">dirapikan AI</span>
            </div>
            <p class="comparison-card__lead">
              Petugas mendapat record yang lebih utuh, lengkap dengan sumber dan jejak penelusuran.
            </p>
            <ul class="catalog-fields catalog-fields--complete">
              <li><span>Judul</span><strong>Pengantar Literasi Informasi</strong></li>
              <li><span>Penulis</span><strong>Sari, Dewi</strong></li>
              <li><span>Penerbit</span><strong>Pustaka Nusantara</strong></li>
              <li><span>Tahun</span><strong>2024</strong></li>
              <li><span>Bahasa</span><strong>Indonesia</strong></li>
              <li><span>Deskripsi fisik</span><strong>xii, 214 hlm. : ilustrasi ; 24 cm</strong></li>
              <li><span>DDC</span><strong>025.5</strong></li>
              <li><span>Subjek</span><strong>literasi informasi; perpustakaan sekolah; pengolahan bahan pustaka</strong></li>
              <li><span>Sumber</span><strong>Google Books · Open Library · Library of Congress</strong></li>
            </ul>
          </article>
        </div>
      </section>

      <section id="fitur" class="section features">
        <div class="section-heading">
          <p class="section-kicker">Kemampuan inti</p>
          <h2>Dirancang untuk backlog buku, bukan untuk pamer istilah teknis.</h2>
        </div>

        <div class="feature-stack">
          <article v-for="capability in capabilities" :key="capability.title" class="feature-item">
            <span class="feature-item__rule" aria-hidden="true"></span>
            <div>
              <h3>{{ capability.title }}</h3>
              <p>{{ capability.body }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="section control">
        <div class="control__copy">
          <p class="section-kicker">Kendali tetap di tangan petugas</p>
          <h2>AI memberi usulan, bukan keputusan final.</h2>
          <p>
            Setiap hasil dirapikan secara terbuka: bisa ditinjau, bisa diedit, dan bisa dilacak sebelum
            ekspor. Rangkai membantu mempercepat kerja katalog, tetapi pustakawan tetap memutuskan
            record akhir yang masuk ke sistem.
          </p>
        </div>

        <ul class="control__list" aria-label="Prinsip kendali petugas">
          <li>Usulan AI terlihat jelas sebelum disimpan.</li>
          <li>Perubahan dapat ditelusuri kembali ke sumber dan langkah penyesuaian.</li>
          <li>Ekspor baru berjalan setelah petugas memeriksa record.</li>
        </ul>
      </section>

      <section class="section privacy">
        <div class="privacy__panel">
          <p class="section-kicker">Privasi dan luring</p>
          <h2>Pas untuk sekolah dan institusi yang tidak selalu punya koneksi stabil.</h2>
          <p>
            Antrean scan dapat disimpan secara lokal saat offline, lalu disinkronkan ketika koneksi
            kembali. Itu membuat Rangkai cocok dipakai di ruang katalog, perpustakaan cabang, atau
            jaringan sekolah yang naik turun tanpa mengorbankan alur kerja.
          </p>
        </div>

        <div class="compatibility">
          <p class="compatibility__label">Kompatibel dengan</p>
          <ul class="compatibility__list">
            <li v-for="item in compatibility" :key="item">{{ item }}</li>
          </ul>
        </div>
      </section>

      <section class="section faq">
        <div class="section-heading">
          <p class="section-kicker">FAQ singkat</p>
          <h2>Jawaban cepat untuk alur kerja yang paling sering ditanyakan.</h2>
        </div>

        <div class="faq-list">
          <details v-for="faq in faqs" :key="faq.question" class="faq-item">
            <summary>{{ faq.question }}</summary>
            <p>{{ faq.answer }}</p>
          </details>
        </div>
      </section>

      <section class="section cta">
        <div>
          <p class="section-kicker">Mulai dari buku berikutnya</p>
          <h2>Ambil satu buku di meja Anda, lalu mulai dari sana.</h2>
          <p>
            Rangkai membantu Anda bergerak dari barcode ke record katalog tanpa menambah beban kerja
            yang tidak perlu.
          </p>
        </div>

        <div class="cta__actions">
          <NuxtLink class="button button--primary" :to="primaryCta">Mulai Memindai</NuxtLink>
          <NuxtLink class="button button--secondary" to="/history">Lihat Riwayat</NuxtLink>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p class="footer__brand">Rangkai</p>
      <nav class="footer__nav" aria-label="Tautan pendukung">
        <NuxtLink to="/scan/mobile">Scan</NuxtLink>
        <NuxtLink to="/history">Riwayat</NuxtLink>
        <NuxtLink to="/profile">Profil</NuxtLink>
        <NuxtLink to="/faq">FAQ</NuxtLink>
      </nav>
      <p class="footer__meta">Rapi, tenang, dan siap dipakai di meja katalog.</p>
    </footer>
  </div>
</template>

<style scoped>
/* Hallmark · genre: editorial · macrostructure: Narrative Workflow · theme: Linen · enrichment: none · nav: N6 Newspaper masthead · footer: Ft1 Mast-headed */

.page-shell {
  position: relative;
  min-height: 100vh;
  overflow: clip;
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--color-paper) 96%, white 4%), var(--color-paper-2)),
    repeating-linear-gradient(
      180deg,
      transparent 0,
      transparent 3.25rem,
      color-mix(in oklab, var(--color-rule) 28%, transparent) 3.25rem,
      color-mix(in oklab, var(--color-rule) 28%, transparent) 3.4rem
    );
  color: var(--color-ink);
}

.page-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at top left, color-mix(in oklab, var(--color-accent-surface) 55%, transparent) 0, transparent 34%),
    radial-gradient(circle at 82% 14%, color-mix(in oklab, var(--color-success-soft) 55%, transparent) 0, transparent 26%);
  opacity: 0.95;
}

.skip-link {
  position: absolute;
  left: var(--page-gutter);
  top: var(--space-sm);
  z-index: 20;
  transform: translateY(-200%);
  padding: 0.65rem 0.9rem;
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-pill);
  background: var(--color-paper);
  color: var(--color-ink);
  text-decoration: none;
}

.skip-link:focus-visible {
  transform: translateY(0);
}

.masthead,
main,
.footer {
  position: relative;
  z-index: 1;
  width: min(calc(100% - (var(--page-gutter) * 2)), var(--page-measure));
  margin: 0 auto;
}

.masthead {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-lg) 0 var(--space-md);
  border-bottom: var(--rule-heavy) solid var(--color-rule);
}

.masthead__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
}

.masthead__mark {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border: 1px solid var(--color-rule);
  border-radius: 0.95rem;
  background: color-mix(in oklab, var(--color-paper) 88%, white 12%);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  letter-spacing: 0.18em;
}

.masthead__eyebrow,
.masthead__sub,
.section-kicker,
.comparison-card__index,
.record-card__stamp,
.record-card__label,
.compatibility__label,
.footer__meta {
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.masthead__eyebrow {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-ink-soft);
}

.masthead__sub {
  margin: 0.2rem 0 0;
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.masthead__nav,
.footer__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem 1rem;
}

.masthead__nav a,
.footer__nav a {
  color: var(--color-ink-soft);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color var(--dur-short) var(--ease-out), color var(--dur-short) var(--ease-out);
}

.masthead__nav a:hover,
.masthead__nav a:focus-visible,
.footer__nav a:hover,
.footer__nav a:focus-visible {
  color: var(--color-ink);
  border-color: currentColor;
}

.section {
  padding: clamp(2rem, 4.5vw, 4.2rem) 0;
}

.hero {
  display: grid;
  gap: var(--space-xl);
  align-items: start;
}

.hero__content {
  display: grid;
  gap: var(--space-md);
}

.section-kicker {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-accent-strong);
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1,
h2 {
  font-family: var(--font-display);
  font-weight: 600;
  line-height: 0.98;
  letter-spacing: -0.03em;
}

h1 {
  max-width: 11ch;
  font-size: var(--text-display);
}

h2 {
  max-width: 14ch;
  font-size: var(--text-display-s);
}

h3 {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  line-height: 1.1;
  font-weight: 600;
}

p,
li,
summary {
  font-size: var(--text-md);
  line-height: 1.65;
}

.hero__lede,
.hero__note,
.section-heading p,
.comparison-card__lead,
.feature-item p,
.control__copy p,
.privacy__panel p,
.faq-item p,
.cta p {
  color: var(--color-ink-soft);
  max-width: 68ch;
}

.hero__workflow {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.6rem;
  align-items: center;
  width: fit-content;
  padding: 0.8rem 1rem;
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-pill);
  background: color-mix(in oklab, var(--color-paper) 92%, white 8%);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-ink);
}

.hero__actions,
.cta__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0.8rem 1.15rem;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  text-decoration: none;
  font-weight: 600;
  transition:
    transform var(--dur-short) var(--ease-out),
    background-color var(--dur-short) var(--ease-out),
    border-color var(--dur-short) var(--ease-out),
    color var(--dur-short) var(--ease-out);
}

.button:hover {
  transform: translateY(-1px);
}

.button--primary {
  background: var(--color-ink);
  color: var(--color-paper);
  border-color: var(--color-ink);
}

.button--secondary {
  background: transparent;
  color: var(--color-ink);
  border-color: var(--color-rule);
}

.button:focus-visible,
details summary:focus-visible,
.masthead__nav a:focus-visible,
.footer__nav a:focus-visible {
  outline: 3px solid color-mix(in oklab, var(--color-focus) 58%, white 42%);
  outline-offset: 3px;
}

.hero__note {
  max-width: 52ch;
  font-size: var(--text-base);
}

.hero__panel {
  min-width: 0;
}

.record-card,
.comparison-card,
.privacy__panel,
.compatibility,
.control,
.faq-item,
.cta {
  border: 1px solid var(--color-rule);
  background: color-mix(in oklab, var(--color-paper) 92%, white 8%);
  box-shadow: 0 16px 40px color-mix(in oklab, black 8%, transparent);
}

.record-card {
  padding: var(--space-md);
  border-radius: 1.2rem;
}

.record-card__top {
  display: flex;
  justify-content: space-between;
  gap: var(--space-sm);
  align-items: center;
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-rule);
}

.record-card__stamp,
.record-card__label,
.compatibility__label {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.record-card__badge,
.comparison-card__state {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-pill);
  background: var(--color-success-soft);
  color: var(--color-success);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.record-card__split {
  display: grid;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.record-card__block {
  padding: var(--space-sm);
  border: 1px solid var(--color-rule);
  border-radius: 1rem;
  background: color-mix(in oklab, var(--color-paper-3) 68%, white 32%);
}

.record-card__block--after {
  background: color-mix(in oklab, var(--color-success-soft) 52%, white 48%);
}

.field-list {
  list-style: none;
  display: grid;
  gap: 0.55rem;
  margin: var(--space-sm) 0 0;
  padding: 0;
}

.field-list__item {
  display: grid;
  gap: 0.15rem;
}

.field-list__key {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.field-list__value {
  color: var(--color-ink);
}

.record-card__source {
  margin-top: var(--space-sm);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.section-heading {
  display: grid;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.section-heading--tight {
  max-width: 42rem;
}

.workflow-list {
  list-style: none;
  display: grid;
  gap: var(--space-md);
  margin: 0;
  padding: 0;
}

.workflow-list__item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-md);
  align-items: start;
  padding: 1rem 0;
  border-top: 1px solid var(--color-rule);
}

.workflow-list__item:last-child {
  border-bottom: 1px solid var(--color-rule);
}

.workflow-list__number {
  display: inline-grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  border: 1px solid var(--color-rule);
  background: color-mix(in oklab, var(--color-accent-surface) 70%, white 30%);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-accent-strong);
}

.comparison__grid {
  display: grid;
  gap: var(--space-md);
}

.comparison-card {
  padding: var(--space-md);
  border-radius: 1.1rem;
}

.comparison-card__head {
  display: flex;
  justify-content: space-between;
  gap: var(--space-sm);
  align-items: center;
  padding-bottom: var(--space-sm);
  margin-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-rule);
}

.comparison-card__index {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.comparison-card__state {
  background: color-mix(in oklab, var(--color-paper-3) 56%, white 44%);
  color: var(--color-ink-soft);
}

.comparison-card__state--success {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.comparison-card__lead {
  margin-bottom: var(--space-md);
}

.catalog-fields {
  list-style: none;
  display: grid;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
}

.catalog-fields li {
  display: grid;
  gap: 0.2rem;
  padding: 0.55rem 0;
  border-top: 1px dotted var(--color-rule);
}

.catalog-fields li:first-child {
  border-top: 0;
  padding-top: 0;
}

.catalog-fields span {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.catalog-fields strong {
  font-weight: 500;
  color: var(--color-ink);
}

.catalog-fields--complete strong {
  color: var(--color-ink);
}

.feature-stack {
  display: grid;
  gap: 0;
}

.feature-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-md);
  padding: 1.1rem 0;
  border-top: 1px solid var(--color-rule);
}

.feature-item:last-child {
  border-bottom: 1px solid var(--color-rule);
}

.feature-item__rule {
  width: 0.8rem;
  height: 0.8rem;
  margin-top: 0.35rem;
  border-radius: 999px;
  background: var(--color-success);
  box-shadow: 0 0 0 0.35rem var(--color-success-soft);
}

.control,
.privacy {
  display: grid;
  gap: var(--space-lg);
  padding: clamp(1.2rem, 2.8vw, 2rem);
  border-radius: 1.2rem;
}

.control__list {
  list-style: none;
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
}

.control__list li {
  padding-left: 1rem;
  border-left: 2px solid var(--color-success);
}

.privacy__panel {
  padding: 1rem;
  border-radius: 1rem;
}

.compatibility {
  padding: 1rem;
  border-radius: 1rem;
}

.compatibility__list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin: var(--space-sm) 0 0;
  padding: 0;
}

.compatibility__list li {
  padding: 0.5rem 0.8rem;
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-pill);
  background: color-mix(in oklab, var(--color-paper) 82%, white 18%);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.faq-list {
  display: grid;
  gap: var(--space-sm);
}

.faq-item {
  padding: 0.15rem 1rem 0.2rem;
  border-radius: 1rem;
}

.faq-item summary {
  cursor: pointer;
  list-style: none;
  padding: 0.9rem 0;
  font-weight: 600;
  color: var(--color-ink);
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item p {
  padding: 0 0 1rem;
}

.cta {
  display: grid;
  gap: var(--space-lg);
  padding: clamp(1.3rem, 3vw, 2rem);
  border-radius: 1.3rem;
}

.footer {
  display: grid;
  gap: 0.65rem;
  padding: var(--space-lg) 0 var(--space-xl);
  border-top: var(--rule-heavy) solid var(--color-rule);
}

.footer__brand {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  line-height: 1;
}

.footer__meta {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

@media (min-width: 760px) {
  .hero {
    grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
    gap: var(--space-2xl);
  }

  .record-card__split,
  .control,
  .privacy,
  .cta {
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.95fr);
    align-items: start;
  }

  .comparison__grid {
    grid-template-columns: minmax(0, 0.93fr) minmax(0, 1.07fr);
  }

  .privacy {
    grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }

  .button:hover {
    transform: none;
  }
}
</style>
