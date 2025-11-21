import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

interface User {
  id: string;
  companyName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "users.json");

async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

async function writeUsers(users: User[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), "utf8");
}

export async function POST(request: Request) {
  const body = await request.json();
  const { companyName, email, password } = body;

  if (!companyName || !email || !password) {
    return NextResponse.json(
      { error: "Dati mancanti" },
      { status: 400 }
    );
  }

  const users = await readUsers();

  const existing = users.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase()
  );
  if (existing) {
    return NextResponse.json(
      { error: "Email già registrata" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser: User = {
    id: crypto.randomUUID(),
    companyName,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await writeUsers(users);

  return NextResponse.json(
    { message: "Registrazione completata" },
    { status: 201 }
  );
}

