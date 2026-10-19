"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatDZD } from "@/lib/utils";

export type CardProduct = {
  id: number;
  name: string;
  slug: string;
  price: string;
  oldPrice: string | null;
  images: string[];
  stock: number;
  rating: string;
  sold: number;
  categoryName?: string | null;
};

export default function ProductCard({ product }: { product: CardProduct }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const price = Number(product.price);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
  const discount = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const image = product.images?.[0] ?? "";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-slate-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🛍️</div>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 rounded-full bg-rose-600 px-2 py-1 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-bold text-white">
            نفد المخزون
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.categoryName && (
          <span className="text-[11px] font-bold text-emerald-700">{product.categoryName}</span>
        )}
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 text-sm font-bold text-slate-800 transition hover:text-emerald-700"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1 text-xs text-amber-500">
          ⭐ <span className="font-bold">{Number(product.rating).toFixed(1)}</span>
          <span className="text-slate-400">({product.sold} مبيع)</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <div className="text-lg font-extrabold text-emerald-800">{formatDZD(price)}</div>
            {oldPrice && oldPrice > price && (
              <div className="text-xs text-slate-400 line-through">{formatDZD(oldPrice)}</div>
            )}
          </div>
          <button
            disabled={product.stock <= 0}
            onClick={() => {
              add(
                {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price,
                  image,
                  stock: product.stock,
                },
                1,
              );
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
            }}
            className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {added ? "✓ أُضيف" : "أضف للسلة"}
          </button>
        </div>
      </div>
    </div>
  );
}
