import { useState } from 'react';

function App() {
  const [nama, setNama] = useState('');
  const [totalUtang, setTotalUtang] = useState('');
  const [penghasilan, setPenghasilan] = useState('');
  const [skorKredit, setSkorKredit] = useState(null);
  const [rasioUtang, setRasioUtang] = useState('');
  const [kelayakan, setKelayakan] = useState('');

  // Data Dummy untuk skor kredit
  const dataDummySkorKredit = {
    'Ahmad Zulfikar': 750,
    'Budi Santoso': 680,
    'Chandra Wijaya': 720,
    'Dina Maria': 690,
    'Eka Prasetya': 710,
    'Fajar Arifin': 765,
    'Gita Puspita': 730,
    // Tambahkan data nasabah lainnya sesuai kebutuhan
  };

  // Fungsi untuk menghitung fuzzy membership
  const calculateFuzzyMembership = (value, lowRange, midRange, highRange) => {
    if (value <= lowRange[1]) return { rendah: 1, sedang: 0, tinggi: 0 };
    if (value >= highRange[0]) return { rendah: 0, sedang: 0, tinggi: 1 };

    const rendah =
      value <= lowRange[1] ? 1 : Math.max(0, (lowRange[1] - value) / (lowRange[1] - lowRange[0]));
    const sedang =
      value >= midRange[0] && value <= midRange[1]
        ? 1
        : Math.max(0, 1 - Math.abs(value - midRange[1]) / (midRange[1] - midRange[0]));
    const tinggi =
      value >= highRange[0] ? 1 : Math.max(0, (value - highRange[0]) / (highRange[1] - highRange[0]));

    return { rendah, sedang, tinggi };
  };

  // Fungsi utama untuk menghitung kelayakan
  const handleCalculateEligibility = () => {
    // Cari skor kredit berdasarkan nama
    const skor = dataDummySkorKredit[nama];
    if (!skor) {
      alert('Nama nasabah tidak ditemukan.');
      return;
    }
    setSkorKredit(skor);

    // Hitung rasio utang
    const debt = parseFloat(totalUtang);
    const income = parseFloat(penghasilan);
    if (isNaN(debt) || isNaN(income) || income === 0) {
      alert('Masukkan data utang dan penghasilan dengan benar.');
      return;
    }
    const ratio = (debt / income) * 100;
    setRasioUtang(ratio.toFixed(2));

    // Hitung fuzzy membership
    const skorKreditFuzzy = calculateFuzzyMembership(skor, [0, 500], [500, 750], [750, 850]);
    const rasioUtangFuzzy = calculateFuzzyMembership(ratio, [0, 30], [30, 60], [60, 100]);

    // Logika fuzzy untuk kelayakan
    const keputusan =
      skorKreditFuzzy.tinggi > 0.5 && rasioUtangFuzzy.rendah > 0.5
        ? 'Layak'
        : skorKreditFuzzy.rendah > 0.5 || rasioUtangFuzzy.tinggi > 0.5
        ? 'Tidak Layak'
        : 'Dipertimbangkan';

    setKelayakan(keputusan);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Sistem Penilaian Kelayakan Kredit</h1>

      <div>
        <label className="block mb-2">Nama Nasabah</label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-full p-2 border border-gray-300 mb-4"
        />

        <label className="block mb-2">Total Utang Bulanan</label>
        <input
          type="number"
          value={totalUtang}
          onChange={(e) => setTotalUtang(e.target.value)}
          className="w-full p-2 border border-gray-300 mb-4"
        />

        <label className="block mb-2">Penghasilan Bulanan</label>
        <input
          type="number"
          value={penghasilan}
          onChange={(e) => setPenghasilan(e.target.value)}
          className="w-full p-2 border border-gray-300 mb-4"
        />

        <button
          onClick={handleCalculateEligibility}
          className="w-full bg-green-500 text-white p-2 mb-4 rounded-lg"
        >
          Hitung Kelayakan Kredit
        </button>

        {skorKredit !== null && <p>Skor Kredit: {skorKredit}</p>}
        {rasioUtang && <p>Rasio Utang: {rasioUtang}%</p>}
        {kelayakan && <p>Kelayakan Kredit: {kelayakan}</p>}
      </div>
    </div>
  );
}

export default App;
