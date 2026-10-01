
export type UUID = string;

export interface Customer {
  id: UUID;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
}

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Account {
  id: UUID;
  iban: string;
  balance: number;
  customerId: UUID;
}

export interface CustomerWithAccounts {
  customer: Customer;
  accounts: Account[];
}

// ─── Repository: il contratto che il Service usa ───

export interface ICustomerRepository {
  findAll(): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  create(dto: CreateCustomerDto): Promise<Customer>;
}

export interface IAccountRepository {
  findByCustomerId(customerId: string): Promise<Account[]>;
}

/** Simula la latenza di un database */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class InMemoryCustomerRepository implements ICustomerRepository {
  private customers: Customer[] = [];

  async findAll(): Promise<Customer[]> {
    await delay(300);
    return [...this.customers]; // Copia — non esporre il riferimento interno
  }

  async findById(id: string): Promise<Customer | null> {
    await delay(300);
    return this.customers.find((c) => c.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    await delay(300);
    return this.customers.find((c) => c.email === email) ?? null;
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    await delay(300);
    const customer: Customer = {
      id: crypto.randomUUID(),
      ...dto,
      createdAt: new Date(),
    };
    this.customers.push(customer);
    return customer;
  }
}

export class InMemoryAccountRepository implements IAccountRepository {
  constructor(private readonly accounts: Account[] = []) {}

  async findByCustomerId(customerId: string): Promise<Account[]> {
    await delay(300);
    return this.accounts.filter((a) => a.customerId === customerId);
  }
}

// ─── Service: business logic, riceve il Repository via constructor injection ───

export class CustomerService {
  constructor(private readonly repository: ICustomerRepository) {}

  async findAll(): Promise<Customer[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.repository.findById(id);
    if (!customer) throw new Error("Customer con id " + id + " non trovato");
    return customer;
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    // Business rule: nome e cognome obbligatori
    if (!dto.firstName.trim() || !dto.lastName.trim()) {
      throw new Error("Nome e cognome sono obbligatori");
    }
    // Business rule: email univoca
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) throw new Error("Email " + dto.email + " già registrata");
    return this.repository.create(dto);
  }
}

/**
 * Carica Customer e Account in parallelo: le due query sono indipendenti,
 * quindi Promise.all impiega ~300ms invece di ~600ms in sequenza.
 * Se una delle due fallisce (es. customer inesistente), Promise.all rigetta subito.
 */
export async function getCustomerWithAccounts(
  customerService: CustomerService,
  accountRepository: IAccountRepository,
  customerId: string
): Promise<CustomerWithAccounts> {
  const [customer, accounts] = await Promise.all([
    customerService.findById(customerId),
    accountRepository.findByCustomerId(customerId),
  ]);
  return { customer, accounts };
}

// ─── Demo ───

async function main() {
  // Wiring delle dipendenze (manual DI)
  const customerRepository = new InMemoryCustomerRepository();
  const customerService = new CustomerService(customerRepository);

  const mario = await customerService.create({
    firstName: "Mario",
    lastName: "Rossi",
    email: "mario.rossi@example.com",
  });
  const laura = await customerService.create({
    firstName: "Laura",
    lastName: "Bianchi",
    email: "laura.bianchi@example.com",
  });

  const accountRepository = new InMemoryAccountRepository([
    { id: "acc-001", iban: "IT60X0542811101000000123456", balance: 10000, customerId: mario.id },
    { id: "acc-002", iban: "IT60X0542811101000000654321", balance: 2500, customerId: mario.id },
    { id: "acc-003", iban: "IT60X0542811101000000789012", balance: 5000, customerId: laura.id },
  ]);

  console.log("Tutti i customer:");
  const all = await customerService.findAll();
  all.forEach((c) => console.log("  " + c.firstName + " " + c.lastName + " — " + c.email));

  console.log("\nCustomer + conti in parallelo...");
  const start = Date.now();
  const { customer, accounts } = await getCustomerWithAccounts(customerService, accountRepository, mario.id);
  console.log("  " + customer.firstName + " " + customer.lastName + " (" + (Date.now() - start) + "ms)");
  accounts.forEach((a) => console.log("    " + a.iban + " — " + a.balance + " EUR"));

  console.log("\nTest errore: email duplicata...");
  try {
    await customerService.create({ firstName: "Mario", lastName: "Verdi", email: "mario.rossi@example.com" });
  } catch (error) {
    console.log("  ✅ Errore gestito: " + (error as Error).message);
  }

  console.log("\nTest errore: customer inesistente...");
  try {
    await getCustomerWithAccounts(customerService, accountRepository, "non-esiste");
  } catch (error) {
    console.log("  ✅ Errore gestito: " + (error as Error).message);
  }
}

main().catch(console.error);
