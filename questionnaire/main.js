// ★ window から明示的に取得（これが決定打）
const kuromoji = window.kuromoji;

if (!kuromoji) {
  alert("kuromoji が読み込まれていません（CDN失敗）");
  throw new Error("kuromoji not found");
}

let tokenizer = null;
const stopWords = new Set(["こと","もの","ため","これ","それ"]);

document.addEventListener("DOMContentLoaded", () => {

  kuromoji.builder({
    dicPath: "./dict/"   // ← 必ず末尾 /
  }).build((err, t) => {
    if (err) {
      console.error(err);
      document.getElementById("status").textContent = "辞書読み込み失敗";
      return;
    }
    tokenizer = t;
    document.getElementById("status").textContent = "準備完了";
    document.getElementById("analyzeBtn").disabled = false;
  });

  document.getElementById("analyzeBtn").onclick = analyze;
});

function tokenize(text) {
  return tokenizer.tokenize(text)
    .filter(t =>
      (t.pos === "名詞" || t.pos === "形容詞") &&
      t.basic_form !== "*" &&
      !stopWords.has(t.basic_form)
    )
    .map(t => t.basic_form);
}

function computeTfIdf(docs) {
  const tokenized = docs.map(tokenize);
  const df = {};
  tokenized.forEach(d => [...new Set(d)].forEach(w => df[w]=(df[w]||0)+1));

  const N = docs.length;
  const scores = {};

  tokenized.forEach(d => {
    const tf = {};
    d.forEach(w => tf[w]=(tf[w]||0)+1);
    Object.entries(tf).forEach(([w,c]) => {
      scores[w]=(scores[w]||0)+(c/d.length)*Math.log(N/df[w]);
    });
  });

  return Object.entries(scores)
    .sort((a,b)=>b[1]-a[1])
    .map(([word,score])=>({word,score}));
}

function analyze() {
  if (!tokenizer) return;

  const docs = document.getElementById("input").value
    .split("\n").map(s=>s.trim()).filter(Boolean);

  const result = computeTfIdf(docs);

  const ranking = document.getElementById("ranking");
  ranking.innerHTML="";
  result.slice(0,10).forEach((r,i)=>{
    ranking.innerHTML+=`
      <li>
        <span>${i+1}位</span>
        <span>${r.word}</span>
        <span>${r.score.toFixed(3)}</span>
      </li>`;
  });

  const tbody=document.getElementById("tableBody");
  tbody.innerHTML="";
  result.forEach((r,i)=>{
    tbody.innerHTML+=`
      <tr>
        <td>${i+1}</td>
        <td>${r.word}</td>
        <td>${r.score.toFixed(4)}</td>
      </tr>`;
  });

  document.getElementById("rankingSection").style.display="block";
  document.getElementById("tableSection").style.display="block";
}
