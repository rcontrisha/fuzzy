import { useState, useEffect } from "react";
import FuzzyChart from "./FuzzyChart";
import "chart.js/auto";

function App() {
  const [nama, setNama] = useState("");
  const [skorKredit, setSkorKredit] = useState(null);
  const [totalUtang, setTotalUtang] = useState("");
  const [penghasilan, setPenghasilan] = useState("");
  const [rasioUtang, setRasioUtang] = useState("");
  const [kelayakan, setKelayakan] = useState("");
  const [interpretasi, setInterpretasi] = useState("");
  const [error, setError] = useState("");

  const [historySkor, setHistorySkor] = useState([]);
  const [historyRasio, setHistoryRasio] = useState([]);
  const [historyOutput, setHistoryOutput] = useState([]);

  const dataDummySkorKredit = {
    "Ahmad Zulfikar": 750,
    "Budi Santoso": 680,
    "Chandra Wijaya": 720,
    "Dina Maria": 690,
    "Eka Prasetya": 710,
    "Fajar Arifin": 765,
    "Gita Puspita": 730,
  };

  useEffect(() => {
    if (nama) {
      const skor = dataDummySkorKredit[nama];
      if (skor) {
        setSkorKredit(skor);
        setError("");
      } else {
        setSkorKredit(null);
        setError("Nama nasabah tidak ditemukan.");
      }
    } else {
      setSkorKredit(null);
      setError("");
    }
  }, [nama]);

  useEffect(() => {
    const debt = parseFloat(totalUtang);
    const income = parseFloat(penghasilan);
    if (!isNaN(debt) && !isNaN(income) && income !== 0) {
      const ratio = (debt / income) * 100;
      setRasioUtang(ratio.toFixed(2));
    } else {
      setRasioUtang("");
    }
  }, [totalUtang, penghasilan]);

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

  useEffect(() => {
    if (skorKredit !== null && rasioUtang !== "") {
      const skorKreditFuzzy = calculateFuzzyMembership(skorKredit, [0, 500], [500, 750], [750, 850]);
      const rasioUtangFuzzy = calculateFuzzyMembership(parseFloat(rasioUtang), [0, 30], [30, 60], [60, 100]);

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

      let description = "";
      if (crispOutput >= 80) {
        description = "Nasabah sangat layak untuk diberikan kredit.";
      } else if (crispOutput >= 50) {
        description = "Nasabah cukup layak untuk mendapatkan kredit, namun perlu evaluasi lebih lanjut.";
      } else {
        description = "Nasabah tidak layak untuk diberikan kredit.";
      }

      setKelayakan(`Kelayakan Kredit: ${crispOutput.toFixed(2)}`);
      setInterpretasi(description);

      setHistorySkor([...historySkor, skorKredit]);
      setHistoryRasio([...historyRasio, rasioUtang]);
      setHistoryOutput([...historyOutput, crispOutput]);
    } else {
      setKelayakan("");
      setInterpretasi("");
    }
  }, [skorKredit, rasioUtang]);

  const createChartData = (data, label) => ({
    labels: data.map((_, index) => `Observasi ${index + 1}`),
    datasets: [
      {
        label,
        data,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
      },
    ],
  });

  // Fungsi Keanggotaan Fuzzy untuk Skor Kredit
  const skorLabels = [0, 500, 750, 850];
  const skorRendah = [1, 0, 0, 0];
  const skorSedang = [0, 1, 1, 0];
  const skorTinggi = [0, 0, 0, 1];

  // Fungsi Keanggotaan Fuzzy untuk Rasio Utang
  const rasioLabels = [0, 30, 60, 100];
  const rasioRendah = [1, 0, 0, 0];
  const rasioSedang = [0, 1, 1, 0];
  const rasioTinggi = [0, 0, 0, 1];

  // Fungsi Keanggotaan Fuzzy untuk Output Kelayakan Kredit
  const outputLabels = [0, 30, 50, 80, 100];
  const outputRendah = [1, 0.8, 0.5, 0, 0];
  const outputSedang = [0, 0.2, 0.5, 0.8, 0];
  const outputTinggi = [0, 0, 0.5, 1, 1];

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Sistem Penilaian Kelayakan Kredit</h1>

      <label>Nama Nasabah</label>
      <input
        type="text"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        className="w-full p-2 border mb-4"
      />
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <label>Total Utang Bulanan</label>
      <input
        type="number"
        value={totalUtang}
        onChange={(e) => setTotalUtang(e.target.value)}
        className="w-full p-2 border mb-4"
      />

      <label>Penghasilan Bulanan</label>
      <input
        type="number"
        value={penghasilan}
        onChange={(e) => setPenghasilan(e.target.value)}
        className="w-full p-2 border mb-4"
      />

      {rasioUtang && <p>Rasio Utang: {rasioUtang}%</p>}
      {kelayakan && <p>{kelayakan}</p>}
      {interpretasi && (
        <div className="my-4">
          <label className="block text-lg font-semibold mb-2">Keputusan Kelayakan Kredit</label>
          <textarea
            value={interpretasi}
            disabled
            className="w-full h-32 p-4 bg-gray-100 text-black border-2 border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Grafik untuk Skor Kredit */}
      <FuzzyChart
        title="Fungsi Keanggotaan Skor Kredit"
        lowData={skorRendah}
        midData={skorSedang}
        highData={skorTinggi}
        labels={skorLabels}
      />

      {/* Grafik untuk Rasio Utang */}
      <FuzzyChart
        title="Fungsi Keanggotaan Rasio Utang"
        lowData={rasioRendah}
        midData={rasioSedang}
        highData={rasioTinggi}
        labels={rasioLabels}
      />

      {/* Grafik untuk Output Kelayakan Kredit */}
      <FuzzyChart
        title="Fungsi Keanggotaan Output Kelayakan Kredit"
        lowData={outputRendah}
        midData={outputSedang}
        highData={outputTinggi}
        labels={outputLabels}
      />
    </div>
  );
}

export default App;
