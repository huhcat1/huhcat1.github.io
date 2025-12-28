const segmenter = new Intl.Segmenter("ja", { granularity: "word" });

const stopWords = new Set([
  "こと", "もの", "それ", "これ", "ため", "よう", "感じ"
]);

document.getElementById("analyzeBtn").addEventListener("click", analyze);

function tokenize(text) {
  return Array.from(segmenter.segment(text))
    .map(s => s.segment.trim())
    .filter(w =>
      w.length > 1 &&
      !stopWords.has(w) &&
      !/^[\p{P}\p{S}]+$/u.test(w)
    );
}

function computeTfIdf(docs) {
  const tokens = docs.map(tokenize);
  const df = {};
  const N = docs.length;

  tokens.forEach(doc => {
    new Set(doc).forEach(w => {
      df[w] = (df[w] || 0) + 1;
    });
  });

  const scores = {};

  tokens.forEach(doc => {
    const tf = {};
    doc.forEach(w => tf[w] = (tf[w] || 0) + 1);

    Object.entries(tf).forEach(([w, c]) => {
      const tfVal = c / doc.length;
      const idfVal = Math.log(N / df[w]);
      scores[w] = (scores[w] || 0) + tfVal * idfVal;
    });
  });

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([word, score]) => ({ word, score }));
}

function analyze() {
  const docs = document.getElementById("input").value
    .split("\n")
    .map(v => v.trim())
    .filter(Boolean);

  if (docs.length === 0) return;

  const result = computeTfIdf(docs);

  const ranking = document.getElementById("ranking");
  const tbody = document.getElementById("tableBody");

  ranking.innerHTML = "";
  tbody.innerHTML = "";

  result.slice(0, 10).forEach((r, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${i + 1}位</span><span>${r.word}</span><span>${r.score.toFixed(3)}</span>`;
    ranking.appendChild(li);
  });

  result.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i + 1}</td><td>${r.word}</td><td>${r.score.toFixed(4)}</td>`;
    tbody.appendChild(tr);
  });

  document.getElementById("rankingSection").style.display = "block";
  document.getElementById("tableSection").style.display = "block";
}
