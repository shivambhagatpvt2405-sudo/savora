
import React, { useEffect, useMemo, useState } from "react";
import products from "./products";
import { getProductImage } from "./useProductImages";

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Sports & Outdoors",
];

const gradients = [
  "from-blue-100 to-indigo-200",
  "from-pink-100 to-rose-200",
  "from-amber-100 to-orange-200",
  "from-green-100 to-emerald-200",
  "from-purple-100 to-violet-200",
  "from-cyan-100 to-sky-200",
];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

const amazonSearchUrl = (product) =>
  product.affiliateUrl ||
  product.buyUrl ||
  `https://www.amazon.in/s?k=${encodeURIComponent(product.name || "")}`;

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getProductEmoji(product) {
  const text =
    `${product.name || ""} ${product.category || ""}`.toLowerCase();

  if (/earbud|headphone|headset/.test(text)) return "🎧";
  if (/laptop|computer|keyboard|monitor/.test(text)) return "💻";
  if (/phone|mobile|smartphone/.test(text)) return "📱";
  if (/watch/.test(text)) return "⌚";
  if (/camera/.test(text)) return "📷";
  if (/speaker|audio/.test(text)) return "🔊";
  if (/shirt|dress|fashion|clothing|shoe|saree|jean|jacket/.test(text))
    return "👕";
  if (/kitchen|furniture|home|lamp|chair|table|storage/.test(text))
    return "🏠";
  if (/beauty|skin|makeup|cosmetic|lipstick|cream|perfume/.test(text))
    return "✨";
  if (/sport|football|cricket|fitness|gym|yoga|exercise/.test(text))
    return "⚽";
  if (/book/.test(text)) return "📚";
  if (/bag|backpack|handbag/.test(text)) return "👜";

  return "🛍️";
}

function ProductImage({ product, imageUrl, className = "" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageUrl, product.id]);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
    >
      {imageUrl && !failed ? (
        <img
          src={imageUrl}
          alt={product.name || "Product"}
          loading="lazy"
          className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
          <span className="text-5xl sm:text-6xl">
            {getProductEmoji(product)}
          </span>
          <p className="mt-3 line-clamp-2 text-xs font-semibold text-gray-600">
            {product.name}
          </p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const allProducts = useMemo(
    () =>
      products.map((product, index) => ({
        ...product,
        id: product.id ?? index + 1,
        name: product.name || "Unnamed product",
        category: product.category || "Other",
        rating: Number(product.rating) || 0,
        reviews: Number(product.reviews ?? product.reviewCount ?? 0),
        price: Number(product.price) || 0,
        background:
          product.background || gradients[index % gradients.length],
      })),
    []
  );

  const [search, setSearch] = useState("");
  const [productImages, setProductImages] = useState({});
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [page, setPage] = useState(1);
  const [wishlist, setWishlist] = useState(() =>
    readStorage("savora-wishlist", [])
  );
  const [history, setHistory] = useState(() =>
    readStorage("savora-history", [])
  );
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("shop");
  const [mobileMenu, setMobileMenu] = useState(false);

  const productsPerPage = 24;

  const highestPrice = Math.max(
    1000,
    ...allProducts.map((product) => product.price)
  );

  useEffect(() => {
    try {
      localStorage.setItem("savora-wishlist", JSON.stringify(wishlist));
    } catch (error) {
      console.warn("Could not save wishlist:", error);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem("savora-history", JSON.stringify(history));
    } catch (error) {
      console.warn("Could not save browsing history:", error);
    }
  }, [history]);

  // Generate an image for products that do not already have one.
  useEffect(() => {
    let cancelled = false;

    async function loadImages() {
      const missingProducts = allProducts.filter(
        (product) =>
          !product.image &&
          !Object.prototype.hasOwnProperty.call(
            productImages,
            product.id
          )
      );

      if (missingProducts.length === 0) return;

      const results = await Promise.all(
        missingProducts.map(async (product) => {
          try {
            const url = await getProductImage(
              `${product.name} ${product.category}`
            );

            return { id: product.id, url: url || "" };
          } catch (error) {
            console.warn(
              `Image unavailable for ${product.name}:`,
              error
            );
            return { id: product.id, url: "" };
          }
        })
      );

      if (cancelled) return;

      setProductImages((previous) => {
        const next = { ...previous };

        results.forEach(({ id, url }) => {
          next[id] = url;
        });

        return next;
      });
    }

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [allProducts, productImages]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (activeTab === "wishlist") {
      result = result.filter((product) =>
        wishlist.includes(product.id)
      );
    }

    if (activeTab === "history") {
      result = history
        .map((id) =>
          allProducts.find((product) => product.id === id)
        )
        .filter(Boolean);
    }

    if (category !== "All") {
      const selectedCategory = category.toLowerCase();

      result = result.filter(
        (product) =>
          (product.category || "").toLowerCase() === selectedCategory
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((product) =>
        [
          product.name,
          product.brand,
          product.category,
          product.description,
          ...(Array.isArray(product.features) ? product.features : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    if (activeTab !== "history") {
      result = result.filter(
        (product) => product.price <= maxPrice
      );
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [
    allProducts,
    search,
    category,
    sort,
    maxPrice,
    activeTab,
    wishlist,
    history,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleProducts = useMemo(
    () =>
      filteredProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
      ),
    [filteredProducts, currentPage]
  );

  function toggleWishlist(productId) {
    setWishlist((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId]
    );
  }

  function openProduct(product) {
    setSelectedProduct(product);

    setHistory((previous) =>
      [
        product.id,
        ...previous.filter((id) => id !== product.id),
      ].slice(0, 100)
    );
  }

  function changeTab(tab) {
    setActiveTab(tab);
    setPage(1);
    setMobileMenu(false);
  }

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setSort("featured");
    setMaxPrice(highestPrice);
    setPage(1);
    setActiveTab("shop");
  }

  function productImage(product) {
    return product.image || productImages[product.id] || "";
  }

  function changeCategory(item) {
    setCategory(item);
    setActiveTab("shop");
    setPage(1);
    setMobileMenu(false);
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-gray-900">
     
      <div className="bg-gray-950 px-4 py-2 text-center text-xs tracking-wide text-white sm:text-sm">
        Discover your next favorite thing ✨ | Welcome to Savora
      </div>

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => changeTab("shop")}
            className="shrink-0 text-2xl font-black tracking-tight sm:text-3xl"
          >
            savora<span className="text-orange-500">.</span>
          </button>

          <div className="hidden flex-1 md:block">
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
                setActiveTab("shop");
              }}
              placeholder="Search products, brands and more..."
              className="mx-auto block w-full max-w-xl rounded-full border border-gray-200 bg-gray-50 px-5 py-3 text-sm outline-none focus:border-orange-400 focus:bg-white"
            />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => changeTab("history")}
              className="hidden text-sm text-gray-600 hover:text-orange-600 sm:block"
            >
              Recently viewed
            </button>

            <button
              onClick={() => changeTab("wishlist")}
              className="rounded-full border border-gray-200 px-3 py-2 text-sm hover:border-orange-400"
            >
              ♡ {wishlist.length}
            </button>

            <button
              onClick={() => setMobileMenu((value) => !value)}
              className="rounded-lg border border-gray-200 px-3 py-2 md:hidden"
              aria-label="Toggle menu"
            >
              ☰
            </button>
          </div>
        </div>

        <div className="px-4 pb-3 md:hidden">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
              setActiveTab("shop");
            }}
            placeholder="Search products..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
          />
        </div>

        <nav
          className={`${
            mobileMenu ? "block" : "hidden md:block"
          } border-t border-gray-100`}
        >
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
            <button
              onClick={() => changeTab("shop")}
              className={`rounded-full px-4 py-2 text-sm ${
                activeTab === "shop"
                  ? "bg-gray-950 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Discover
            </button>

            {categories.map((item) => (
              <button
                key={item}
                onClick={() => changeCategory(item)}
                className={`rounded-full px-4 py-2 text-sm ${
                  category === item && activeTab === "shop"
                    ? "bg-orange-100 font-semibold text-orange-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {activeTab === "shop" && (
          <section className="relative mb-10 overflow-hidden rounded-3xl bg-[#f3e8dc] px-6 py-12 sm:px-12 sm:py-16">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <span className="inline-block rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-widest text-orange-700">
                  Your everyday discovery store
                </span>

                <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  Find things
                  <br />
                  <span className="text-orange-600">you’ll love.</span>
                </h1>

                <p className="mt-5 max-w-lg text-base leading-7 text-gray-600 sm:text-lg">
                  Explore products, compare prices, save favorites, and
                  discover something new with Savora.
                </p>

                <button
                  onClick={() =>
                    document
                      .getElementById("products")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="mt-7 rounded-full bg-gray-950 px-7 py-3.5 text-sm font-bold text-white hover:bg-orange-600"
                >
                  Explore collection →
                </button>

                <p className="mt-4 text-xs text-gray-500">
                  Demo catalog with external shopping links.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  ["🎧", "Tech finds", "Everyday essentials"],
                  ["👟", "Style picks", "Find your look"],
                  ["🏠", "Home favorites", "Make it yours"],
                  ["✨", "New discoveries", "Browse your way"],
                ].map(([emoji, title, description]) => (
                  <div
                    key={title}
                    className="flex min-h-36 flex-col justify-between rounded-2xl bg-white/80 p-5 shadow-sm sm:min-h-44"
                  >
                    <span className="text-4xl">{emoji}</span>
                    <div>
                      <p className="font-bold">{title}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "shop" && (
          <section className="mb-10">
            <h2 className="text-xl font-bold sm:text-2xl">
              Explore categories
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Something for every part of your day.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {[
                { name: "Electronics", emoji: "🎧", color: "bg-blue-50" },
                { name: "Fashion", emoji: "👕", color: "bg-pink-50" },
                {
                  name: "Home & Kitchen",
                  emoji: "🏡",
                  color: "bg-amber-50",
                },
                {
                  name: "Beauty & Personal Care",
                  emoji: "🧴",
                  color: "bg-purple-50",
                },
                {
                  name: "Sports & Outdoors",
                  emoji: "⚽",
                  color: "bg-green-50",
                },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => changeCategory(item.name)}
                  className={`${item.color} rounded-2xl p-4 text-left transition hover:-translate-y-1 hover:shadow-md sm:p-5`}
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <p className="mt-3 text-sm font-bold">{item.name}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        <section id="products" className="scroll-mt-44">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                {activeTab === "wishlist"
                  ? "Your saved collection"
                  : activeTab === "history"
                  ? "Your browsing journey"
                  : "Curated discovery"}
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                {activeTab === "wishlist"
                  ? "Your wishlist ♡"
                  : activeTab === "history"
                  ? "Recently viewed"
                  : search
                  ? "Search results"
                  : category === "All"
                  ? "Discover products"
                  : category}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {filteredProducts.length} products found
                <p className="mt-2 text-sm font-bold text-red-600">
  Debug: Total products = {allProducts.length}
</p>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name: A to Z</option>
              </select>

              <button
                onClick={resetFilters}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium hover:border-orange-400"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 sm:flex sm:items-center sm:gap-6">
            <div className="flex items-center justify-between gap-4 sm:w-56">
              <span className="text-sm font-semibold">Maximum price</span>
              <span className="text-sm font-bold text-orange-600">
                {formatPrice(maxPrice)}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max={highestPrice}
              step={Math.max(1, Math.round(highestPrice / 100))}
              value={Math.min(maxPrice, highestPrice)}
              onChange={(event) => {
                setMaxPrice(Number(event.target.value));
                setPage(1);
              }}
              className="mt-3 w-full accent-orange-500 sm:mt-0"
              aria-label="Maximum price filter"
            />
          </div>

          {(search || category !== "All") && activeTab === "shop" && (
            <div className="mb-5 flex flex-wrap gap-2">
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="rounded-full bg-orange-50 px-3 py-2 text-xs text-orange-700"
                >
                  Search: {search} ×
                </button>
              )}

              {category !== "All" && (
                <button
                  onClick={() => {
                    setCategory("All");
                    setPage(1);
                  }}
                  className="rounded-full bg-orange-50 px-3 py-2 text-xs text-orange-700"
                >
                  {category} ×
                </button>
              )}
            </div>
          )}

          {visibleProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {visibleProducts.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className={`relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br ${product.background}`}
                  >
                    <ProductImage
                      product={product}
                      imageUrl={productImage(product)}
                      className="h-full w-full"
                    />

                    <button
                      onClick={() => toggleWishlist(product.id)}
                      aria-label="Toggle wishlist"
                      className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-xl shadow-sm"
                    >
                      <span
                        className={
                          wishlist.includes(product.id)
                            ? "text-red-500"
                            : "text-gray-500"
                        }
                      >
                        {wishlist.includes(product.id) ? "♥" : "♡"}
                      </span>
                    </button>

                    <span className="absolute left-3 top-3 max-w-[75%] truncate rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                      {product.category}
                    </span>
                  </div>

                  <div className="p-3 sm:p-4">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:text-xs">
                      {product.brand || "Savora selection"}
                    </p>

                    <button
                      onClick={() => openProduct(product)}
                      className="block w-full text-left"
                    >
                      <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 hover:text-orange-600 sm:text-base">
                        {product.name}
                      </h3>
                    </button>

                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <span className="rounded bg-green-50 px-1.5 py-1 font-bold text-green-700">
                        ★ {product.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-400">
                        ({product.reviews.toLocaleString("en-IN")})
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-lg font-black">
                        {formatPrice(product.price)}
                      </span>

                      {product.isDemo && (
                        <span className="rounded bg-amber-50 px-1.5 py-1 text-[9px] font-bold text-amber-700">
                          DEMO
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openProduct(product)}
                        className="rounded-xl border border-gray-200 px-2 py-2.5 text-xs font-bold hover:border-gray-950 sm:text-sm"
                      >
                        Details
                      </button>

                      <a
                        href={amazonSearchUrl(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-gray-950 px-2 py-2.5 text-center text-xs font-bold text-white hover:bg-orange-600 sm:text-sm"
                      >
                        Find to buy ↗
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
              <span className="text-5xl">🔎</span>
              <h3 className="mt-4 text-xl font-bold">No products found</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Try another search or reset your filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-5 rounded-full bg-gray-950 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                Show all products
              </button>
            </div>
          )}

          {filteredProducts.length > productsPerPage && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  setPage((value) => Math.max(1, value - 1));
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-40"
              >
                ← Previous
              </button>

              <span className="px-3 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => {
                  setPage((value) =>
                    Math.min(totalPages, value + 1)
                  );
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </section>

        {activeTab === "shop" && (
          <section className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "🔍",
                title: "Easy discovery",
                description: "Search and browse products in one place.",
              },
              {
                icon: "♡",
                title: "Save favorites",
                description: "Keep a wishlist in your browser.",
              },
              {
                icon: "↗",
                title: "Shop externally",
                description: "Open shopping searches on Amazon India.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-100 bg-white p-6"
              >
                <span className="text-3xl">{item.icon}</span>
                <h3 className="mt-4 font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {item.description}
                </p>
              </div>
            ))}
          </section>
        )}
      </main>

      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <button
              onClick={() => {
                resetFilters();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-2xl font-black"
            >
              savora<span className="text-orange-500">.</span>
            </button>
            <p className="mt-2 text-xs text-gray-500">
              Discover more. Choose better.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <button
              onClick={() => changeTab("shop")}
              className="hover:text-orange-600"
            >
              Discover
            </button>
            <button
              onClick={() => changeTab("wishlist")}
              className="hover:text-orange-600"
            >
              Wishlist
            </button>
            <button
              onClick={() => changeTab("history")}
              className="hover:text-orange-600"
            >
              Browsing history
            </button>
          </div>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Savora · Demo project
          </p>
        </div>

        <div className="border-t border-gray-100 px-4 py-4 text-center text-xs leading-5 text-gray-400">
          Savora is an independent demo project and is not affiliated with
          Amazon. Product listings, prices, ratings, and descriptions may be
          sample data. External shopping links open search results; actual
          availability and prices may differ.
        </div>
      </footer>

      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedProduct(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedProduct.name}
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/95 px-5 py-4 backdrop-blur">
              <p className="text-sm font-bold">Product details</p>
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl"
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2">
              <div
                className={`flex min-h-64 items-center justify-center bg-gradient-to-br p-8 sm:min-h-96 ${selectedProduct.background}`}
              >
                <ProductImage
                  product={selectedProduct}
                  imageUrl={productImage(selectedProduct)}
                  className="h-full min-h-64 w-full sm:min-h-96"
                />
              </div>

              <div className="p-5 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                  {selectedProduct.brand || "Savora selection"}
                </p>

                <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
                  {selectedProduct.name}
                </h2>

                <p className="mt-3 text-sm text-gray-500">
                  {selectedProduct.category}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-lg bg-green-50 px-2.5 py-1.5 text-sm font-bold text-green-700">
                    ★ {selectedProduct.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {selectedProduct.reviews.toLocaleString("en-IN")} reviews
                  </span>
                </div>

                <p className="mt-5 text-3xl font-black">
                  {formatPrice(selectedProduct.price)}
                </p>

                <p className="mt-5 text-sm leading-7 text-gray-600">
                  {selectedProduct.longDescription ||
                    selectedProduct.description ||
                    "Explore this product using the external shopping link."}
                </p>

                {selectedProduct.features?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-bold">Features</h3>
                    <ul className="mt-3 space-y-2">
                      {selectedProduct.features.map((feature, index) => (
                        <li
                          key={`${feature}-${index}`}
                          className="flex gap-2 text-sm leading-6 text-gray-600"
                        >
                          <span className="text-green-600">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedProduct.specifications &&
                  Object.keys(selectedProduct.specifications).length > 0 && (
                    <div className="mt-6">
                      <h3 className="mb-3 font-bold">Specifications</h3>
                      <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                        {Object.entries(
                          selectedProduct.specifications
                        ).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between gap-4 px-3 py-3 text-sm"
                          >
                            <span className="text-gray-500">{key}</span>
                            <span className="text-right font-medium">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedProduct.productHistory && (
                  <div className="mt-6 rounded-xl bg-gray-50 p-4">
                    <h3 className="font-bold">Product notes</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {selectedProduct.productHistory}
                    </p>
                  </div>
                )}

                {selectedProduct.isDemo && (
                  <p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                    Demo listing: verify the actual product, price, reviews,
                    and availability on the retailer's website.
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href={amazonSearchUrl(selectedProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-gray-950 px-5 py-4 text-center text-sm font-bold text-white hover:bg-orange-600"
                  >
                    Find product on Amazon India ↗
                  </a>

                  <button
                    onClick={() => toggleWishlist(selectedProduct.id)}
                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold hover:border-orange-400"
                  >
                    {wishlist.includes(selectedProduct.id)
                      ? "♥ Remove from wishlist"
                      : "♡ Add to wishlist"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, Heart, ShoppingBag, Sparkles, ArrowRight, ArrowLeft,
  Menu, X, UserRound, Wallet, Bell, TrendingDown, SlidersHorizontal,
  Star, Zap, ShieldCheck, History, LogIn, LogOut, Eye, Check,
  Gamepad2, Shirt, Headphones, Laptop, ChevronDown, Plus, Trash2,
  Home, Flame, Crown, RotateCcw, CircleDollarSign
} from "lucide-react";
import "./index.css";

const PRODUCTS = [
  { id: 1, name: "Wireless Headphones", category: "Electronics", price: 1499, oldPrice: 2499, rating: 4.6, emoji: "🎧", color: "lavender", description: "Everyday sound, made better.", platform: "Savora Demo Store", history: [2199, 1999, 2299, 1799, 1499] },
  { id: 2, name: "Smart Watch", category: "Electronics", price: 2199, oldPrice: 3499, rating: 4.5, emoji: "⌚", color: "blue", description: "A smarter way to track your day.", platform: "Savora Demo Store", history: [2999, 2799, 2499, 2399, 2199] },
  { id: 3, name: "Everyday Backpack", category: "Fashion", price: 899, oldPrice: 1499, rating: 4.4, emoji: "🎒", color: "peach", description: "Your daily carry, sorted.", platform: "Savora Demo Store", history: [1299, 1199, 999, 1099, 899] },
  { id: 4, name: "Running Sneakers", category: "Fashion", price: 1799, oldPrice: 2999, rating: 4.7, emoji: "👟", color: "mint", description: "Comfort for every step.", platform: "Savora Demo Store", history: [2499, 2299, 1999, 1899, 1799] },
  { id: 5, name: "Desk Lamp", category: "Home & Kitchen", price: 699, oldPrice: 999, rating: 4.3, emoji: "💡", color: "yellow", description: "Light up your study corner.", platform: "Savora Demo Store", history: [899, 849, 799, 749, 699] },
  { id: 6, name: "Coffee Maker", category: "Home & Kitchen", price: 2499, oldPrice: 3999, rating: 4.5, emoji: "☕", color: "peach", description: "Your morning ritual, upgraded.", platform: "Savora Demo Store", history: [3299, 2999, 2799, 2699, 2499] },
  { id: 7, name: "Wireless Mouse", category: "Electronics", price: 549, oldPrice: 899, rating: 4.4, emoji: "🖱️", color: "blue", description: "A clean setup essential.", platform: "Savora Demo Store", history: [799, 749, 699, 599, 549] },
  { id: 8, name: "Portable Speaker", category: "Electronics", price: 1299, oldPrice: 1999, rating: 4.5, emoji: "🔊", color: "lavender", description: "Big vibes, portable size.", platform: "Savora Demo Store", history: [1799, 1699, 1499, 1399, 1299] },
  { id: 9, name: "Oversized Hoodie", category: "Fashion", price: 799, oldPrice: 1299, rating: 4.6, emoji: "🧥", color: "mint", description: "Maximum comfort, effortless style.", platform: "Savora Demo Store", history: [1199, 999, 1099, 899, 799] },
  { id: 10, name: "Gaming Controller", category: "Electronics", price: 1599, oldPrice: 2499, rating: 4.7, emoji: "🎮", color: "lavender", description: "Level up your game nights.", platform: "Savora Demo Store", history: [2299, 1999, 1899, 1799, 1599] },
  { id: 11, name: "Skincare Set", category: "Beauty & Personal Care", price: 649, oldPrice: 999, rating: 4.3, emoji: "🧴", color: "peach", description: "A simple self-care routine.", platform: "Savora Demo Store", history: [899, 799, 749, 699, 649] },
  { id: 12, name: "Yoga Mat", category: "Sports & Outdoors", price: 599, oldPrice: 999, rating: 4.4, emoji: "🧘", color: "mint", description: "Make room for your reset.", platform: "Savora Demo Store", history: [899, 799, 749, 649, 599] },
  { id: 13, name: "Mechanical Keyboard", category: "Electronics", price: 1899, oldPrice: 2999, rating: 4.8, emoji: "⌨️", color: "blue", description: "A satisfying setup upgrade.", platform: "Savora Demo Store", history: [2799, 2499, 2299, 2099, 1899] },
  { id: 14, name: "Mini Plant Pot", category: "Home & Kitchen", price: 249, oldPrice: 399, rating: 4.2, emoji: "🪴", color: "mint", description: "A little green for your space.", platform: "Savora Demo Store", history: [349, 329, 299, 279, 249] },
  { id: 15, name: "Sports Water Bottle", category: "Sports & Outdoors", price: 349, oldPrice: 599, rating: 4.3, emoji: "🥤", color: "blue", description: "Stay hydrated wherever you go.", platform: "Savora Demo Store", history: [549, 499, 449, 399, 349] },
  { id: 16, name: "Anime Graphic Tee", category: "Gen Z Picks", price: 499, oldPrice: 899, rating: 4.8, emoji: "👕", color: "lavender", description: "Wear your fandom your way.", platform: "Savora Demo Store", history: [799, 699, 649, 549, 499] },
  { id: 17, name: "Anime LED Light", category: "Gen Z Picks", price: 799, oldPrice: 1299, rating: 4.7, emoji: "🌙", color: "blue", description: "Give your room main-character energy.", platform: "Savora Demo Store", history: [1199, 1099, 999, 899, 799] },
  { id: 18, name: "Cute Desk Figure", category: "Gen Z Picks", price: 399, oldPrice: 699, rating: 4.6, emoji: "🧸", color: "peach", description: "Tiny figure, big personality.", platform: "Savora Demo Store", history: [649, 599, 499, 449, 399] }
];

const CATEGORIES = [
  "All Products",
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Sports & Outdoors",
  "Gen Z Picks"
];

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

const discount = (product) =>
  Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);

function Logo({ light = false }) {
  return (
    <button
      className={`brand ${light ? "brand-light" : ""}`}
      onClick={() => window.dispatchEvent(new Event("savora-home"))}
      aria-label="Savora home"
    >
      <span className="brand-symbol"><ShoppingBag size={21} strokeWidth={2.5} /><Sparkles size={11} className="brand-sparkle" /></span>
      <span className="brand-name">savora<span>.</span><small>SHOP SMARTER</small></span>
    </button>
  );
}

function Button({ children, onClick, variant = "primary", className = "", type = "button" }) {
  return (
    <button type={type} onClick={onClick} className={`btn btn-${variant} ${className}`}>
      {children}
    </button>
  );
}

function ProductCard({ product, isFavorite, onFavorite, onDetails, onAlert, anime = false }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.24 }}
      className={`product-card ${anime ? "anime-product-card" : ""}`}
    >
      <div className={`product-art art-${product.color}`}>
        <span className="product-badge">{discount(product)}% OFF</span>
        <button
          className={`heart-button ${isFavorite ? "is-favorite" : ""}`}
          onClick={() => onFavorite(product.id)}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        <span className="product-emoji" role="img" aria-label={product.name}>{product.emoji}</span>
        {anime && <span className="anime-spark">✦</span>}
      </div>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="rating-line"><Star size={14} fill="currentColor" /> {product.rating} <span>· Demo rating</span></div>
        <div className="price-line">
          <strong>{money(product.price)}</strong>
          <del>{money(product.oldPrice)}</del>
        </div>
        <div className="product-actions">
          <Button variant="dark" className="details-button" onClick={() => onDetails(product)}>
            View details <ArrowRight size={15} />
          </Button>
          <button className="alert-icon-button" onClick={() => onAlert(product)} title="Set a price alert">
            <Bell size={17} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function PriceHistory({ product }) {
  const max = Math.max(...product.history);
  const min = Math.min(...product.history);
  return (
    <div className="history-panel">
      <div className="history-heading">
        <div><span className="eyebrow">PRICE TIMELINE</span><h3>Price history</h3></div>
        <span className="history-chip"><TrendingDown size={14} /> {discount(product)}% below MRP</span>
      </div>
      <div className="history-chart" aria-label="Illustrative sample price history">
        {product.history.map((price, index) => (
          <div className="history-bar-wrap" key={`${price}-${index}`}>
            <span className="history-bar-price">{money(price)}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(18, (price / max) * 100)}%` }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              className={`history-bar ${index === product.history.length - 1 ? "history-bar-current" : ""}`}
            />
            <span className="history-label">{["Past", "Earlier", "Recent", "Latest", "Now*"][index]}</span>
          </div>
        ))}
      </div>
      <p className="small-note">*Illustrative demo data, not verified live or historical marketplace prices. Range shown: {money(min)}–{money(max)}.</p>
    </div>
  );
}

function Modal({ title, onClose, children, wide = false }) {
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        role="dialog"
        aria-modal="true"
        className={`modal ${wide ? "modal-wide" : ""}`}
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function AnimePage({ onBack, products, favorites, onFavorite, onDetails, onAlert, onLogin }) {
  const [animeSearch, setAnimeSearch] = useState("");
  const animeProducts = products.filter((p) =>
    p.category === "Gen Z Picks" || ["Fashion", "Electronics"].includes(p.category)
  );
  const filtered = animeProducts.filter((p) =>
    p.name.toLowerCase().includes(animeSearch.toLowerCase())
  );

  return (
    <motion.main
      className="anime-page"
      initial={{ opacity: 0, x: 60, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -60, scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="anime-grid-bg" />
      <header className="anime-header">
        <button className="anime-back" onClick={onBack}><ArrowLeft size={18} /> Back to Savora</button>
        <Logo light />
        <Button variant="anime-outline" onClick={onLogin}><UserRound size={16} /> Account</Button>
      </header>

      <section className="anime-hero">
        <div className="anime-hero-copy">
          <motion.span className="anime-kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Sparkles size={15} /> YOUR NEXT OBSESSION STARTS HERE
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            MAIN CHARACTER
            <span>ENERGY.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            Anime vibes. Streetwear finds. Setup upgrades.
            Shop your aesthetic without losing your budget.
          </motion.p>
          <div className="anime-hero-actions">
            <Button variant="anime" onClick={() => document.getElementById("anime-products")?.scrollIntoView({ behavior: "smooth" })}>
              Explore the drop <ArrowRight size={17} />
            </Button>
            <span className="anime-caption">OTAKU APPROVED* <small>*Savora demo theme</small></span>
          </div>
          <div className="anime-mini-stats">
            <div><strong>01</strong><span>Find your vibe</span></div>
            <div><strong>02</strong><span>Compare prices</span></div>
            <div><strong>03</strong><span>Save your coins</span></div>
          </div>
        </div>

        <motion.div className="anime-visual" initial={{ opacity: 0, rotate: 5, scale: 0.9 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} transition={{ delay: 0.2, duration: 0.55 }}>
          <div className="anime-orbit orbit-one" />
          <div className="anime-orbit orbit-two" />
          <div className="anime-card-sticker sticker-top">NEW DROP ✦</div>
          <div className="anime-character" aria-label="Anime-inspired original character illustration" role="img">
            <div className="character-halo" />
            <div className="character-hair-back" />
            <div className="character-body"><div className="character-collar" /><div className="character-shirt-mark">S</div></div>
            <div className="character-neck" />
            <div className="character-face"><span className="character-eye eye-left" /><span className="character-eye eye-right" /><span className="character-blush blush-left" /><span className="character-blush blush-right" /><span className="character-mouth" /></div>
            <div className="character-hair-front"><i /><i /><i /><i /></div>
            <div className="character-ear ear-left" /><div className="character-ear ear-right" />
            <span className="character-star star-a">✦</span><span className="character-star star-b">✧</span>
          </div>
          <div className="anime-card-sticker sticker-bottom"><Zap size={14} /> VIBE CHECK: PASSED</div>
          <span className="anime-floating-text floating-one">かわいい!</span>
          <span className="anime-floating-text floating-two">SAVE MODE ON</span>
        </motion.div>
      </section>

      <section className="anime-feature-strip">
        <div><Gamepad2 size={21} /><span>GAMING VIBES</span></div>
        <div><Shirt size={21} /><span>STREETWEAR</span></div>
        <div><Headphones size={21} /><span>SETUP GOALS</span></div>
        <div><Sparkles size={21} /><span>YOUR AESTHETIC</span></div>
      </section>

      <section id="anime-products" className="anime-products-section">
        <div className="section-topline">
          <div><span className="anime-kicker">THE SAVORA ANIME DROP</span><h2>Find your <span>next fave.</span></h2></div>
          <label className="anime-search"><Search size={18} /><input value={animeSearch} onChange={(e) => setAnimeSearch(e.target.value)} placeholder="Find your next obsession..." /></label>
        </div>
        <div className="anime-notice"><Sparkles size={17} /> Curated demo picks for anime lovers. Prices shown are sample prices.</div>
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} anime isFavorite={favorites.includes(product.id)} onFavorite={onFavorite} onDetails={onDetails} onAlert={onAlert} />
          ))}
        </div>
        {filtered.length === 0 && <div className="empty-state"><Search size={28} /><h3>No matching vibes</h3><p>Try another product name.</p></div>}
      </section>
      <footer className="anime-footer"><Logo light /><p>Keep the vibe. Protect the budget. ✦</p><button onClick={onBack}>Back to main Savora ↑</button></footer>
    </motion.main>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Products");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [favorites, setFavorites] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [budget, setBudget] = useState(3000);
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [mode, setMode] = useState("buyer");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [alertProduct, setAlertProduct] = useState(null);
  const [alertTarget, setAlertTarget] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activePanel, setActivePanel] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [toast, setToast] = useState("");

  React.useEffect(() => {
    const goHome = () => setPage("home");
    window.addEventListener("savora-home", goHome);
    return () => window.removeEventListener("savora-home", goHome);
  }, []);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const requireLogin = (callback) => {
    if (!loggedIn) {
      setLoginOpen(true);
      notify("Sign in to use this feature.");
      return;
    }
    callback?.();
  };

  const filteredProducts = useMemo(() => {
    let list = PRODUCTS.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All Products" || product.category === category;
      const matchesPrice = product.price <= maxPrice;
      const matchesStudent = mode !== "student" || product.price <= 2500;
      return matchesSearch && matchesCategory && matchesPrice && matchesStudent;
    });
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "discount") list = [...list].sort((a, b) => discount(b) - discount(a));
    return list;
  }, [search, category, sort, maxPrice, mode]);

  const cheapestProducts = useMemo(() => {
    const categories = [...new Set(PRODUCTS.map((p) => p.category))];
    return categories.map((cat) => PRODUCTS.filter((p) => p.category === cat).sort((a, b) => a.price - b.price)[0]);
  }, []);

  const spent = expenses.reduce((total, expense) => total + expense.amount, 0);
  const remaining = budget - spent;
  const wishlistProducts = PRODUCTS.filter((product) => favorites.includes(product.id));

  const toggleFavorite = (id) => {
    if (!loggedIn) {
      setLoginOpen(true);
      notify("Demo sign-in required to save your wishlist.");
      return;
    }
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    notify(favorites.includes(id) ? "Removed from wishlist." : "Added to wishlist.");
  };

  const openAlert = (product) => {
    if (!loggedIn) {
      setLoginOpen(true);
      notify("Demo sign-in required to create price alerts.");
      return;
    }
    setAlertProduct(product);
    setAlertTarget(String(Math.max(1, product.price - 100)));
  };

  const saveAlert = (event) => {
    event.preventDefault();
    if (!alertProduct || Number(alertTarget) <= 0) return;
    setAlerts((current) => [...current, { id: Date.now(), productId: alertProduct.id, name: alertProduct.name, target: Number(alertTarget) }]);
    setAlertProduct(null);
    notify("Demo price alert saved!");
  };

  const signIn = (event) => {
    event.preventDefault();
    if (loginName.trim() && loginPassword === "admin123") {
      setLoggedIn(true);
      setLoginOpen(false);
      setLoginError("");
      setLoginName("");
      setLoginPassword("");
      notify("Signed in to Savora demo!");
    } else {
      setLoginError("Enter any username and the demo password: admin123");
    }
  };

  const addExpense = (event) => {
    event.preventDefault();
    const amount = Number(expenseAmount);
    if (!expenseName.trim() || amount <= 0) return;
    setExpenses((current) => [...current, { id: Date.now(), name: expenseName.trim(), amount }]);
    setExpenseName("");
    setExpenseAmount("");
    notify("Expense added to your demo budget.");
  };

  const openPanel = (panel) => {
    requireLogin(() => {
      setShowWishlist(false);
      setActivePanel(panel);
      setMobileMenu(false);
    });
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All Products");
    setSort("featured");
    setMaxPrice(5000);
  };

  return (
    <div className="savora-app">
      <AnimatePresence mode="wait">
        {page === "anime" ? (
          <AnimePage
            key="anime"
            onBack={() => setPage("home")}
            products={PRODUCTS}
            favorites={favorites}
            onFavorite={toggleFavorite}
            onDetails={setSelectedProduct}
            onAlert={openAlert}
            onLogin={() => loggedIn ? openPanel("profile") : setLoginOpen(true)}
          />
        ) : (
          <motion.div key="home" className="main-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
            <header className="site-header">
              <div className="header-inner">
                <Logo />
                <nav className={mobileMenu ? "nav-open" : ""}>
                  <button onClick={() => { setPage("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Home</button>
                  <button onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}>Explore</button>
                  <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>How it works</button>
                  <button className="genz-nav-link" onClick={() => { setPage("anime"); setMobileMenu(false); window.scrollTo(0, 0); }}><Sparkles size={16} /> Gen Z Shop <span className="new-tag">NEW</span></button>
                </nav>
                <div className="header-actions">
                  <button className="header-icon" onClick={() => requireLogin(() => setShowWishlist(true))} aria-label="Wishlist">
                    <Heart size={20} /><span className="count-dot">{favorites.length}</span>
                  </button>
                  <button className="account-button" onClick={() => loggedIn ? openPanel("profile") : setLoginOpen(true)}>
                    <UserRound size={17} /> {loggedIn ? "My account" : "Sign in"}
                  </button>
                  <button className="mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">{mobileMenu ? <X /> : <Menu />}</button>
                </div>
              </div>
            </header>

            <main>
              <section className="hero-section">
                <div className="hero-bg-orb orb-left" /><div className="hero-bg-orb orb-right" />
                <div className="hero-inner">
                  <motion.div className="hero-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <span className="eyebrow"><Sparkles size={15} /> YOUR SMARTER WAY TO SHOP</span>
                    <h1>Less searching.<br /><span>More saving.</span></h1>
                    <p>Discover great finds, compare sample prices, and make every rupee count. Shopping that works for your life and your budget.</p>
                    <div className="hero-buttons">
                      <Button onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}>Explore products <ArrowRight size={17} /></Button>
                      <Button variant="outline" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}><Eye size={17} /> Discover Savora</Button>
                    </div>
                    <div className="hero-trust"><span><ShieldCheck size={17} /> Smarter choices, always</span><span><Check size={17} /> Know what you're buying</span></div>
                  </motion.div>
                  <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.92, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.6, delay: 0.12 }}>
                    <div className="hero-product-circle"><span className="hero-product-emoji">🎧</span><span className="hero-sparkle sparkle-one">✦</span><span className="hero-sparkle sparkle-two">✧</span></div>
                    <div className="floating-card floating-card-top"><span className="floating-icon"><TrendingDown size={18} /></span><div><strong>Smart picks</strong><small>Spend with purpose</small></div></div>
                    <div className="floating-card floating-card-bottom"><span className="floating-icon peach-icon"><Heart size={18} /></span><div><strong>Made for you</strong><small>Shop your way</small></div></div>
                    <div className="hero-visual-caption"><span>FEATURED FIND</span><strong>Everyday tech</strong><span>Discover your next favourite.</span></div>
                  </motion.div>
                </div>
                <div className="hero-stats"><div><strong>Curated picks</strong><span>Less noise, more value</span></div><div><strong>Compare smarter</strong><span>See prices at a glance</span></div><div><strong>Budget friendly</strong><span>Keep your goals in view</span></div></div>
              </section>

              <section className="mode-section section-wrap">
                <div className="section-heading"><span className="eyebrow">MADE FOR YOUR LIFESTYLE</span><h2>What’s your shopping style?</h2><p>Choose your mode. Make Savora work for you.</p></div>
                <div className="mode-grid">
                  <motion.button whileHover={{ y: -4 }} className={`mode-card ${mode === "buyer" ? "mode-active" : ""}`} onClick={() => { setMode("buyer"); notify("Buyer Mode selected."); }}>
                    <span className="mode-icon buyer-icon"><ShoppingBag size={23} /></span><span className="mode-label">MODE 01</span><h3>Buyer Mode</h3><p>Explore finds, compare sample prices, and build your wishlist.</p><span className="mode-link">Explore products <ArrowRight size={16} /></span>
                  </motion.button>
                  <motion.button whileHover={{ y: -4 }} className={`mode-card ${mode === "student" ? "mode-active" : ""}`} onClick={() => { setMode("student"); notify("Student Mode selected. Showing products up to ₹2,500."); }}>
                    <span className="mode-icon student-icon"><Wallet size={23} /></span><span className="mode-label">MODE 02</span><h3>Student Mode</h3><p>Find affordable picks and keep your spending goals on track.</p><span className="mode-link">Shop on a budget <ArrowRight size={16} /></span>
                  </motion.button>
                  <motion.button whileHover={{ y: -4 }} className="mode-card mode-card-anime" onClick={() => { setPage("anime"); window.scrollTo(0, 0); }}>
                    <span className="mode-icon anime-mode-icon"><Sparkles size={23} /></span><span className="mode-label">MODE 03 · NEW</span><h3>Gen Z Shop</h3><p>Anime vibes, trending finds, and main-character energy.</p><span className="mode-link">Enter the anime world <ArrowRight size={16} /></span>
                  </motion.button>
                </div>
              </section>

              <section className="explore-section section-wrap" id="explore">
                <div className="section-heading explore-heading"><div><span className="eyebrow">THE GOOD FINDS</span><h2>Find your next favourite.</h2><p>Browse the demo catalogue and compare listed prices.</p></div><div className="explore-mode-pill"><span className={`mode-status ${mode}`} /> {mode === "student" ? "Student Mode" : "Buyer Mode"}</div></div>

                <div className="search-toolbar">
                  <label className="search-field"><Search size={19} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." /><kbd>⌕</kbd></label>
                  <label className="select-field"><SlidersHorizontal size={17} /><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="discount">Biggest discount</option></select><ChevronDown size={15} /></label>
                </div>

                <div className="category-filter">
                  {CATEGORIES.map((item) => <button key={item} className={category === item ? "category-active" : ""} onClick={() => setCategory(item)}>{item === "Gen Z Picks" && <Sparkles size={14} />}{item}</button>)}
                </div>

                <div className="price-filter"><label htmlFor="max-price">Maximum price <strong>{money(maxPrice)}</strong></label><input id="max-price" type="range" min="200" max="5000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} /><button onClick={resetFilters}><RotateCcw size={14} /> Reset filters</button></div>

                {mode === "student" && <div className="student-banner"><Wallet size={21} /><div><strong>Student-friendly picks</strong><span>Showing products priced at ₹2,500 or less. Set your personal budget below.</span></div><button onClick={() => openPanel("budget")}>My budget <ArrowRight size={15} /></button></div>}

                <div className="results-row"><p><strong>{filteredProducts.length}</strong> products found <span>· Sample catalogue</span></p><button onClick={() => openPanel("alerts")}><Bell size={16} /> My price alerts ({alerts.length})</button></div>

                {filteredProducts.length ? <div className="product-grid">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} isFavorite={favorites.includes(product.id)} onFavorite={toggleFavorite} onDetails={setSelectedProduct} onAlert={openAlert} />)}</div> : <div className="empty-state"><Search size={30} /><h3>No products found</h3><p>Try a different search or reset your filters.</p><Button onClick={resetFilters}>Reset filters</Button></div>}
              </section>

              <section className="cheapest-section">
                <div className="section-wrap">
                  <div className="section-heading"><span className="eyebrow">GOOD VALUE, LESS SPEND</span><h2>Small price. Smart choice.</h2><p>The lowest-priced sample pick in each category.</p></div>
                  <div className="cheapest-grid">{cheapestProducts.map((product) => <button className="cheapest-item" key={product.id} onClick={() => setSelectedProduct(product)}><span className={`cheapest-emoji art-${product.color}`}>{product.emoji}</span><span className="cheapest-copy"><small>{product.category}</small><strong>{product.name}</strong><span>{money(product.price)}</span></span><ArrowRight size={17} /></button>)}</div>
                </div>
              </section>

              <section className="how-section section-wrap" id="how-it-works">
                <div className="section-heading"><span className="eyebrow">SHOP WITH A PLAN</span><h2>Simple steps. Smarter spending.</h2><p>A clearer way to decide what’s worth your money.</p></div>
                <div className="steps-grid"><div className="step-card"><span>01</span><Search size={23} /><h3>Discover</h3><p>Search the demo catalogue and explore categories that fit your needs.</p></div><div className="step-card"><span>02</span><History size={23} /><h3>Compare</h3><p>Review sample listed prices and illustrative price-history charts.</p></div><div className="step-card"><span>03</span><CircleDollarSign size={23} /><h3>Spend smarter</h3><p>Set a budget, track expenses, and plan before you buy.</p></div></div>
              </section>

              <section className="budget-callout section-wrap"><div className="budget-callout-icon"><Wallet size={26} /></div><div><span className="eyebrow">YOUR MONEY, YOUR RULES</span><h2>Make your budget go further.</h2><p>Track spending and keep your next purchase in perspective.</p></div><Button onClick={() => openPanel("budget")}>Open budget tracker <ArrowRight size={17} /></Button></section>
            </main>

            <footer className="site-footer"><div className="footer-top"><Logo /><p>Less searching. More saving.</p><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top ↑</button></div><div className="footer-bottom"><span>© 2026 Savora Demo</span><span>Built for smarter shopping.</span><span>Prices shown are illustrative demo data, not live marketplace offers.</span></div></footer>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct && (
          <Modal title={selectedProduct.name} onClose={() => setSelectedProduct(null)} wide>
            <div className="product-modal-layout">
              <div className={`modal-product-art art-${selectedProduct.color}`}><span>{selectedProduct.emoji}</span><span className="modal-discount">{discount(selectedProduct)}% OFF</span></div>
              <div className="modal-product-copy"><span className="product-category">{selectedProduct.category}</span><h2>{selectedProduct.name}</h2><p>{selectedProduct.description}</p><div className="modal-price">{money(selectedProduct.price)} <del>{money(selectedProduct.oldPrice)}</del></div><p className="saving-copy">Illustrative saving versus sample MRP: {money(selectedProduct.oldPrice - selectedProduct.price)}</p><div className="demo-platform"><ShoppingBag size={16} /><span>Listed on</span><strong>{selectedProduct.platform}</strong></div><div className="modal-actions"><Button onClick={() => toggleFavorite(selectedProduct.id)}><Heart size={16} /> {favorites.includes(selectedProduct.id) ? "Saved" : "Add to wishlist"}</Button><Button variant="outline" onClick={() => openAlert(selectedProduct)}><Bell size={16} /> Price alert</Button></div></div>
            </div>
            <PriceHistory product={selectedProduct} />
            <p className="small-note">Savora currently uses sample catalogue data. This demo does not fetch live Amazon/Flipkart prices or make purchases.</p>
          </Modal>
        )}

        {alertProduct && (
          <Modal title="Create a price alert" onClose={() => setAlertProduct(null)}>
            <form className="form-stack" onSubmit={saveAlert}>
              <div className="alert-product-preview"><span>{alertProduct.emoji}</span><div><strong>{alertProduct.name}</strong><small>Current sample price: {money(alertProduct.price)}</small></div></div>
              <label>Notify me when price is at or below (₹)<input type="number" min="1" required value={alertTarget} onChange={(e) => setAlertTarget(e.target.value)} /></label>
              <p className="small-note">This creates a local demo alert. Automatic notifications are not enabled.</p>
              <Button type="submit" className="full-width"><Bell size={16} /> Save demo alert</Button>
            </form>
          </Modal>
        )}

        {loginOpen && (
          <Modal title={loggedIn ? "Your Savora account" : "Welcome to Savora"} onClose={() => { setLoginOpen(false); setLoginError(""); }}>
            {loggedIn ? <div className="profile-card"><span className="profile-avatar"><UserRound size={25} /></span><h3>Demo shopper</h3><p>You are signed in to this browser session.</p><Button variant="outline" onClick={() => { setLoggedIn(false); setFavorites([]); setAlerts([]); setExpenses([]); setLoginOpen(false); notify("Signed out."); }}><LogOut size={16} /> Sign out</Button></div> : <form className="form-stack" onSubmit={signIn}><p className="modal-intro">Sign in to save favourites, set price alerts, and track your budget.</p><label>Username<input value={loginName} onChange={(e) => setLoginName(e.target.value)} placeholder="Enter any username" required /></label><label>Demo password<input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Enter demo password" required /></label>{loginError && <p className="form-error">{loginError}</p>}<div className="demo-login-hint"><ShieldCheck size={16} /><span>Demo access: any username + password <strong>admin123</strong></span></div><Button type="submit" className="full-width"><LogIn size={16} /> Sign in to demo</Button><p className="small-note">This is a front-end demonstration, not secure production authentication. Do not enter a real password.</p></form>}
          </Modal>
        )}

        {showWishlist && (
          <Modal title="Your wishlist" onClose={() => setShowWishlist(false)} wide>
            {wishlistProducts.length ? <div className="wishlist-list">{wishlistProducts.map((product) => <div className="wishlist-row" key={product.id}><span className={`wishlist-emoji art-${product.color}`}>{product.emoji}</span><div className="wishlist-copy"><strong>{product.name}</strong><small>{product.category}</small></div><strong>{money(product.price)}</strong><button className="icon-button" onClick={() => toggleFavorite(product.id)} title="Remove"><Trash2 size={17} /></button><Button variant="outline" onClick={() => { setShowWishlist(false); setSelectedProduct(product); }}>Details</Button></div>)}</div> : <div className="empty-state"><Heart size={28} /><h3>Your wishlist is waiting</h3><p>Save products you like and find them here.</p><Button onClick={() => setShowWishlist(false)}>Explore products</Button></div>}
          </Modal>
        )}

        {activePanel && (
          <Modal title={activePanel === "budget" ? "Your budget tracker" : activePanel === "alerts" ? "Your price alerts" : "Your profile"} onClose={() => setActivePanel("")} wide={activePanel === "budget" || activePanel === "alerts"}>
            {activePanel === "budget" && <div className="budget-panel"><div className="budget-summary"><span className="eyebrow">YOUR MONTHLY PLAN</span><div className="budget-total">{money(budget)}</div><p>Planned budget</p><label>Update your budget (₹)<input type="number" min="0" value={budget} onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))} /></label><div className="budget-progress-label"><span>Budget used</span><strong>{budget > 0 ? Math.min(100, Math.round(spent / budget * 100)) : spent > 0 ? 100 : 0}%</strong></div><div className="budget-progress"><span style={{ width: `${budget > 0 ? Math.min(100, spent / budget * 100) : spent > 0 ? 100 : 0}%` }} /></div><div className="budget-numbers"><div><small>Spent</small><strong>{money(spent)}</strong></div><div><small>Remaining</small><strong className={remaining < 0 ? "negative-money" : ""}>{money(remaining)}</strong></div></div></div><form className="expense-form" onSubmit={addExpense}><h3><Plus size={18} /> Add an expense</h3><label>Expense name<input value={expenseName} onChange={(e) => setExpenseName(e.target.value)} placeholder="e.g. Headphones" required /></label><label>Amount (₹)<input type="number" min="1" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="e.g. 1499" required /></label><Button type="submit" className="full-width">Add expense</Button><div className="expense-list-heading"><strong>Your expenses</strong><span>{expenses.length} entries</span></div>{expenses.length ? expenses.map((expense) => <div className="expense-row" key={expense.id}><span>{expense.name}</span><strong>{money(expense.amount)}</strong><button className="icon-button" onClick={() => setExpenses((list) => list.filter((item) => item.id !== expense.id))} type="button" aria-label="Delete expense"><Trash2 size={16} /></button></div>) : <p className="small-note">No expenses yet. Add your first one above.</p>}</form></div>}

            {activePanel === "alerts" && <div className="alerts-list">{alerts.length ? alerts.map((alert) => <div className="alert-row" key={alert.id}><span className="alert-row-icon"><Bell size={18} /></span><div><strong>{alert.name}</strong><small>Alert target: {money(alert.target)}</small></div><button className="icon-button" onClick={() => setAlerts((list) => list.filter((item) => item.id !== alert.id))} aria-label="Delete alert"><Trash2 size={17} /></button></div>) : <div className="empty-state"><Bell size={28} /><h3>No price alerts yet</h3><p>Open a product and set a demo target price.</p></div>}<p className="small-note">These alerts are saved in the current app session. They do not send automatic notifications.</p></div>}

            {activePanel === "profile" && <div className="profile-card"><span className="profile-avatar"><UserRound size={25} /></span><h3>Demo shopper</h3><p>Manage your demo account and shopping preferences.</p><div className="profile-stats"><div><strong>{favorites.length}</strong><small>Wishlist items</small></div><div><strong>{alerts.length}</strong><small>Price alerts</small></div><div><strong>{expenses.length}</strong><small>Expenses</small></div></div><Button variant="outline" onClick={() => { setLoggedIn(false); setFavorites([]); setAlerts([]); setExpenses([]); setActivePanel(""); notify("Signed out."); }}><LogOut size={16} /> Sign out</Button></div>}
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>{toast && <motion.div className="toast-message" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}><Check size={17} /> {toast}</motion.div>}</AnimatePresence>
    </div>
  );
}
