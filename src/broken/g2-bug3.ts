// src/broken/g2-bug3.ts
async function loadData() {
  const results = await Promise.allSettled([
    fetch("https://api.example.com/accounts"),
    fetch("https://api.example.com/invalid-endpoint"),
    fetch("https://api.example.com/customers"),
  ]);
  console.log("Tutti i dati caricati:", results.length);
}
loadData();
git init