import { useState, useEffect } from 'react';

function App() {
  const [nama, setNama] = useState('');
  const [skorKredit, setSkorKredit] = useState(null);
  const [totalUtang, setTotalUtang] = useState('');
  const [penghasilan, setPenghasilan] = useState('');
  const [rasioUtang, setRasioUtang] = useState('');
  const [kelayakan, setKelayakan] = useState('');
  const [interpretasi, setInterpretasi] = useState('');
  const [error, setError] = useState(''); // State untuk menampilkan pesan error

  // Data Dummy untuk skor kredit
  const dataDummySkorKredit = {
    'Ahmad Zulfikar': 750,
    'Budi Santoso': 680,
    'Chandra Wijaya': 720,
    'Dina Maria': 690,
    'Eka Prasetya': 710,
    'Fajar Arifin': 765,
    'Gita Puspita': 730,
  };

  // Fungsi untuk mendapatkan skor kredit
  useEffect(() => {
    if (nama) {
      const skor = dataDummySkorKredit[nama];
      if (skor) {
        setSkorKredit(skor);
        setError(''); // Reset error jika nama ditemukan
      } else {
        setSkorKredit(null);
        setError('Nama nasabah tidak ditemukan.'); // Tampilkan pesan error
      }
    } else {
      setSkorKredit(null);
      setError('');
    }
  }, [nama]);

  // Fungsi untuk menghitung rasio utang
  useEffect(() => {
    const debt = parseFloat(totalUtang);
    const income = parseFloat(penghasilan);
    if (!isNaN(debt) && !isNaN(income) && income !== 0) {
      const ratio = (debt / income) * 100;
      setRasioUtang(ratio.toFixed(2));
    } else {
      setRasioUtang('');
    }
  }, [totalUtang, penghasilan]);

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

  // Fungsi untuk menentukan kelayakan menggunakan metode Tsukamoto
  useEffect(() => {
    if (skorKredit !== null && rasioUtang !== '') {
      const skorKreditFuzzy = calculateFuzzyMembership(skorKredit, [0, 500], [500, 750], [750, 850]);
      const rasioUtangFuzzy = calculateFuzzyMembership(parseFloat(rasioUtang), [0, 30], [30, 60], [60, 100]);

      // Aturan fuzzy
      const rules = [
        { condition: Math.min(skorKreditFuzzy.tinggi, rasioUtangFuzzy.rendah), output: 90 },
        { condition: Math.min(skorKreditFuzzy.sedang, rasioUtangFuzzy.sedang), output: 70 },
        { condition: Math.min(skorKreditFuzzy.rendah, rasioUtangFuzzy.tinggi), output: 30 },
        { condition: Math.min(skorKreditFuzzy.sedang, rasioUtangFuzzy.rendah), output: 80 },
      ];

      let numerator = 0;
      let denominator = 0;

      rules.forEach((rule) => {
        numerator += rule.condition * rule.output;
        denominator += rule.condition;
      });

      const crispOutput = denominator === 0 ? 0 : numerator / denominator;

      // Interpretasi deskriptif
      let description = '';
      if (crispOutput >= 80) {
        description = 'Nasabah sangat layak untuk diberikan kredit.';
      } else if (crispOutput >= 50) {
        description = 'Nasabah cukup layak untuk mendapatkan kredit, namun perlu evaluasi lebih lanjut.';
      } else {
        description = 'Nasabah tidak layak untuk diberikan kredit.';
      }

      setKelayakan(`Kelayakan Kredit: ${crispOutput.toFixed(2)}`);
      setInterpretasi(description);
    } else {
      setKelayakan('');
      setInterpretasi('');
    }
  }, [skorKredit, rasioUtang]);

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Sistem Penilaian Kelayakan Kredit</h1>

      <div>
        <label className="block mb-2">Nama Nasabah</label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-full p-2 border border-gray-300 mb-2"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {skorKredit !== null && <p className='mb-4' style={{ fontStyle: 'italic', fontWeight: 'bold' }}>Skor Kredit: {skorKredit}</p>}

        <div>
          <label className="block mb-2">Total Utang Bulanan</label>
          <input
            type="number"
            value={totalUtang}
            onChange={(e) => setTotalUtang(e.target.value)}
            className="w-full p-2 border border-gray-300 mb-4"
          />
        </div>

        <div>
          <label className="block mb-2">Penghasilan Bulanan</label>
          <input
            type="number"
            value={penghasilan}
            onChange={(e) => setPenghasilan(e.target.value)}
            className="w-full p-2 border border-gray-300 mb-4"
          />
        </div>

        {rasioUtang && <p style={{ fontStyle: 'italic', fontWeight: 'bold' }}>Rasio Utang: {rasioUtang}%</p>}
        {kelayakan && <p style={{ fontStyle: 'italic', fontWeight: 'bold' }}>{kelayakan}</p>}

        <label className="block mb-2 mt-4">Interpretasi Kelayakan Kredit</label>
        <textarea
          value={interpretasi}
          readOnly
          className="w-full p-2 border border-gray-300 bg-gray-100"
          style={{ fontWeight: 'normal' }} 
        />
      </div>
    </div>
  );
}

export default App;
