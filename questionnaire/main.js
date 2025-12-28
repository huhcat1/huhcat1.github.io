const status = document.getElementById("status");
const btn = document.getElementById("analyzeBtn");

let tokenizer = null;

status.textContent = "辞書を読み込み中...";

kuromoji.builder({ dicPath: "./dict/" }).build((err, tk) => {
  if (err) {
    status.textContent = "辞書読み込み失敗";
    console.error(err);
    return;
  }
  tokenizer = tk;
  status.textContent = "辞書読み込み完了";
});

btn.onclick = () => {
  if (!tokenizer) {
    alert("辞書読み込み中です。少し待ってください。");
    return;
  }

  const lines = document.getElementById("input").value
    .split("\n")
    .map(l => l.trim())
    .filter(l => l);

  const docs = lines.map(line =>
    tokenizer.tokenize(line)
      .filter(t => t.pos === "名詞")
      .map(t => t.surface_form)
  );

  const tfidf = {};
  const df = {};
  const N = docs.length;

  docs.forEach(doc => {
    const uniq = new Set(doc);
    uniq.forEach(w => df[w] = (df[w] || 0) + 1);
  });

  docs.forEach(doc => {
    const tf = {};
    doc.forEach(w => tf[w] = (tf[w] || 0) + 1);

    for (const w in tf) {
      const score = (tf[w] / doc.length) * Math.log(N / df[w]);
      tfidf[w] = (tfidf[w] || 0) + score;
    }
  });

  const sorted = Object.entries(tfidf)
    .sort((a, b) => b[1] - a[1]);

  const ranking = document.getElementById("ranking");
  const table = document.getElementById("tableBody");

  ranking.innerHTML = "";
  table.innerHTML = "";

  sorted.forEach(([w, s], i) => {
    ranking.innerHTML += `<li>${w} (${s.toFixed(4)})</li>`;
    table.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${w}</td>
        <td>${s.toFixed(4)}</td>
      </tr>`;
  });
};
