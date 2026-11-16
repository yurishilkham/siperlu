export default function AppFooter() {
  return (
    <footer className="af-foot">
      <div className="af-row">
        <span className="af-brand">
          <img src="/logo-bawaslu.png" alt="Logo Bawaslu" aria-hidden="true" />
          <b>SIPERLU</b>
        </span>
        <p>
          Badan Pengawas Pemilihan Umum Kota Pasuruan —{" "}
          {new Date().getFullYear()}
        </p>
      </div>
      <small>
        Mode demo: arsip disimpan di sesi peramban dan kembali ke kondisi awal
        saat halaman dimuat ulang.
      </small>
    </footer>
  );
}
