import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/products";

// GET: Fetch all products or filter by category
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let filtered = products;
  if (category && category !== "all") {
    filtered = products.filter((p) => p.category === category);
  }

  return NextResponse.json(filtered);
}

// POST: Add a new product (admin use)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    const body = await request.json();
    const { name, description, price, originalPrice, discount, image, category, brand } = body;

    if (!name || !price || !image || !category) {
      return NextResponse.json(
        { error: "Nom, prix, image et catégorie sont requis." },
        { status: 400 }
      );
    }

    const newProduct = {
      id: Math.max(...products.map((p) => p.id)) + 1,
      name,
      description: description || "",
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discount: discount ? Number(discount) : undefined,
      image,
      images: [image],
      finishes: [],
      features: [],
      category,
      brand: brand || "Château d'art",
      createdAt: new Date().toISOString(),
    };

    // In-memory push (for demo; real implementation uses a database)
    products.push(newProduct);

    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

// DELETE: Remove a product by ID (admin use)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis." }, { status: 400 });
    }

    const index = products.findIndex((p) => p.id === Number(id));
    if (index === -1) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    }

    products.splice(index, 1);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Product deletion error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

// PUT: Update a product (admin use)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requis." }, { status: 400 });
    }

    const index = products.findIndex((p) => p.id === Number(id));
    if (index === -1) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    }

    products[index] = { ...products[index], ...updates };

    return NextResponse.json(
      { success: true, product: products[index] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
