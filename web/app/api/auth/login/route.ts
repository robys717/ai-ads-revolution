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

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Dati mancanti" },
      { status: 400 }
    );
  }

  const users = await readUsers();

  const user = users.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase()
  );
  if (!user) {
    return NextResponse.json(
      { error: "Credenziali non valide" },
      { status: 401 }
    );
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Credenziali non valide" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: "Login ok",
    user: {
      id: user.id,
      companyName: user.companyName,
      email: user.email,
    },
  });
}

