import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function getImageExtension(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return ".jpg";
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return ".png";
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return ".webp";
  return null;
}

export async function POST(request) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return NextResponse.json({ message: "Connexion administrateur requise." }, { status: 401 });

  const apiBaseUrl = (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1").replace(/\/$/, "");
  const sessionResponse = await fetch(`${apiBaseUrl}/auth/me`, {
    headers: { cookie },
    cache: "no-store",
  }).catch(() => null);
  if (!sessionResponse?.ok) {
    return NextResponse.json({ message: "Connexion administrateur requise." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ message: "Sélectionne une image à importer." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ message: "L’image ne doit pas dépasser 5 Mo." }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = getImageExtension(bytes);
  if (!extension) {
    return NextResponse.json({ message: "Format non pris en charge. Utilise JPG, PNG ou WebP." }, { status: 415 });
  }

  const scope = formData.get("scope") === "admin" ? "admin-images" : "product-images";
  const filename = `${randomUUID()}${extension}`;
  const imageDirectory = path.join(process.cwd(), "public", scope);
  await mkdir(imageDirectory, { recursive: true });
  await writeFile(path.join(imageDirectory, filename), bytes, { flag: "wx" });

  return NextResponse.json({ imageUrl: `/${scope}/${filename}` }, { status: 201 });
}