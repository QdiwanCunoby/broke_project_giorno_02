# 🔧 The Broken Project — Giorno 2

Esercitazione LipariBank su async/await, Promise e gestione errori.

## Setup

```bash
npm install
```

## Bug da risolvere

| Script         | File                      | Problema                                       |
| -------------- | ------------------------- | ---------------------------------------------- |
| `npm run bug1` | `src/broken/g2-bug1.ts`   | 🔴 `await` fuori da funzione `async`            |
| `npm run bug2` | `src/broken/g2-bug2.ts`   | 🟡 Promise non gestita (`Promise { <pending> }`) |
| `npm run bug3` | `src/broken/g2-bug3.ts`   | 🟢 errore ignorato in `Promise.all`             |

`npm run typecheck` esegue il controllo dei tipi su tutto il progetto.

## Feature opzionale

`CustomerService` con constructor injection di `ICustomerRepository`, metodi async
`findAll`, `findById`, `create` e `getCustomerWithAccounts` che carica Customer e
Account in parallelo con `Promise.all`.
