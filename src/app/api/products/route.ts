import { NextRequest, NextResponse } from "next/server";
import { products as staticProducts, Product, DEFAULT_FINISHES, DEFAULT_FEATURES } from "@/lib/products";
import { getSupabaseConfig, supabaseHeaders } from "@/lib/supabase-config";

export const runtime = 'edge';

function mapDbProduct(item: any): Product {
  const price = Number(item.price) || 0;
  const originalPrice = item.sale_price ? Number(item.sale_price) : undefined;
  let discount: number | undefined = undefined;
  if (originalPrice && originalPrice > price) {
    discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  const imgs = Array.isArray(item.images) && item.images.length > 0 
    ? item.images 
    : [item.image || '/products/salon/aa.jpg'];

  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    price,
    originalPrice,
    discount,
    image: imgs[0],
    images: imgs,
    category: item.category || 'sofas',
    brand: item.brand || "Château d'art",
    featured: true,
    finishes: DEFAULT_FINISHES,
    features: DEFAULT_FEATURES,
    createdAt: item.created_at,
  };
}

// GET: Fetch all products or filter by category from Supabase (fallback to static)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    const { url, key } = getSupabaseConfig();
    let query = `${url}/rest/v1/products?select=*&order=created_at.desc`;
    if (category && category !== "all") {
      query += `&category=eq.${encodeURIComponent(category)}`;
    }

    const res = await fetch(query, {
      headers: supabaseHeaders(key),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data.map(mapDbProduct), {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        });
      }
    }
  } catch (err) {
    console.error("Supabase /api/products GET error:", err);
  }

  // Fallback to static catalog
  let filtered = staticProducts;
  if (category && category !== "all") {
    filtered = staticProducts.filter((p) => p.category === category);
  }

  return NextResponse.json(filtered, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    },
  });
}

// POST: Add a new product to Supabase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, originalPrice, discount, image, images, category, brand } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: "Nom, prix et catégorie sont requis." },
        { status: 400 }
      );
    }

    const imgList = Array.isArray(images) && images.length > 0 
      ? images 
      : [image || '/products/salon/aa.jpg'];

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { url, key } = getSupabaseConfig();
    const res = await fetch(`${url}/rest/v1/products`, {
      method: 'POST',
      headers: supabaseHeaders(key),
      body: JSON.stringify({
        name,
        slug,
        description: description || '',
        price: Number(price),
        sale_price: originalPrice ? Number(originalPrice) : null,
        category,
        images: imgList,
        in_stock: true,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Supabase error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const created = Array.isArray(data) ? data[0] : data;

    return NextResponse.json(
      { success: true, product: mapDbProduct(created) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

// DELETE: Remove a product by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis." }, { status: 400 });
    }

    const { url, key } = getSupabaseConfig();
    const res = await fetch(`${url}/rest/v1/products?id=eq.${id}`, {
      method: 'DELETE',
      headers: supabaseHeaders(key),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Supabase error: ${errText}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Product deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

// PUT: Update a product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requis." }, { status: 400 });
    }

    if (updates.name) {
      updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const { url, key } = getSupabaseConfig();
    const res = await fetch(`${url}/rest/v1/products?id=eq.${id}`, {
      method: 'PATCH',
      headers: supabaseHeaders(key),
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Supabase error: ${errText}`);
    }

    const data = await res.json();
    return NextResponse.json(
      { success: true, product: Array.isArray(data) ? mapDbProduct(data[0]) : data },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
