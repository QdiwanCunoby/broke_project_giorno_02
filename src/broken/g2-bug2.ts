// src/broken/g2-bug2.ts
async function getBalance(id: string): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(15420.50), 500);
  });
}

async function consoleBalance(balance: string): Promise<void> {
  const saldo = await getBalance(balance);
  console.log("Saldo:", saldo);
}
  
consoleBalance("account-001");