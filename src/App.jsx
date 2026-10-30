
import { useMemo, useState } from "react";
import productsData from "./products.js";
import "./index.css";

const categories = [
  "All",
  "Electronics",
  "Home & Kitchen",
  "Fashion",
  "Beauty & Personal Care",
  "Sports & Outdoors",
];

const categoryImages = {
  Electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80",
  "Home & Kitchen":
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
  Fashion:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  "Beauty & Personal Care":
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
  "Sports & Outdoors":
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function getDemoHistory(product) {
  const factors = [1.24, 1.12, 1.19, 1.05, 1.14, 0.96, 1.08, 1];
  return factors.map((factor, index) => ({
    label: ["W-7", "W-6", "W-5", "W-4", "W-3", "W-2", "W-1", "Now"][index],
    price: Math.round(product.price * factor),
  }));
}

function PriceHistory({ product }) {
  const history = getDemoHistory(product);
  const max = Math.max(...history.map((item) => item.price));
  const min = Math.min(...history.map((item) => item.price));
  const points = history
    .map((item, index) => {
      const x = 10 + index * 38;
      const y = 88 - ((item.price - min) / (max - min || 1)) * 58;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="history-card">
      <div className="history-heading">
        <div>
          <span className="eyebrow">PRICE INSIGHT</span>
          <h3>Price history preview</h3>
        </div>
        <span className="demo-badge">SIMULATED</span>
      </div>

      <div className="chart-wrap">
        <svg
          viewBox="0 0 286 105"
          className="history-chart"
          role="img"
          aria-label="Illustrative price history chart"
        >
          <defs>
            <linearGradient id="historyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c3f36b" stopOpacity=".26" />
              <stop offset="100%" stopColor="#c3f36b" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[24, 45, 66, 88].map((y) => (
            <line
              key={y}
              x1="8"
              y1={y}
              x2="278"
              y2={y}
              stroke="currentColor"
              opacity=".09"
            />
          ))}
          <polygon
            points={`10,100 ${points} 276,100`}
            fill="url(#historyFill)"
          />
          <polyline
            points={points}
            fill="none"
            stroke="#c3f36b"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {history.map((item, index) => {
            const x = 10 + index * 38;
            const y = 88 - ((item.price - min) / (max - min || 1)) * 58;
            return (
              <circle
                key={item.label}
                cx={x}
                cy={y}
                r="3"
                fill="#c3f36b"
              />
            );
          })}
        </svg>
        <div className="chart-labels">
          {history.map((item) => (
            <span key={item.label}>{item.label}</span>
          ))}
        </div>
      </div>

      <div className="history-stats">
        <div>
          <span>Illustrative low</span>
          <strong>{money(min)}</strong>
        </div>
        <div>
          <span>Current demo price</span>
          <strong>{money(product.price)}</strong>
        </div>
      </div>
      <p className="fine-print">
        This chart uses generated sample values, not verified retailer history.
      </p>
    </div>
  );
}

function ProductCard({
  product,
  onDetails,
  onCompare,
  onSave,
  saved,
  comparing,
  onBuy,
}) {
  const image = product.image || categoryImages[product.category];

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img
          className="product-image"
          src={image}
          alt={product.name}
          loading="lazy"
        />
        <span className="product-category">{product.category}</span>
        <button
          className={`heart-button ${saved ? "is-saved" : ""}`}
          onClick={() => onSave(product)}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          title={saved ? "Remove from wishlist" : "Save to wishlist"}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>

      <div className="product-content">
        <div className="product-brand">{product.brand}</div>
        <h3>{product.name}</h3>
        <div className="product-rating">
          <span>★</span> {product.rating || "New"}
          <span className="review-count">
            ({product.reviewCount ?? 0} reviews)
          </span>
        </div>

        <div className="product-price-row">
          <strong className="product-price">{money(product.price)}</strong>
          <span className="demo-badge">DEMO</span>
        </div>

        <p className="product-description">
          {product.description || "Explore this demo catalog listing."}
        </p>

        <div className="product-actions">
          <button className="button button-secondary" onClick={() => onDetails(product)}>
            Details
          </button>
          <button
            className={`button ${comparing ? "button-selected" : "button-secondary"}`}
            onClick={() => onCompare(product)}
          >
            {comparing ? "✓ Added" : "⇄ Compare"}
          </button>
        </div>

        <button className="button button-primary buy-button" onClick={() => onBuy(product)}>
          Find online <span>↗</span>
        </button>
      </div>
    </article>
  );
}

function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [mode, setMode] = useState("buyer");
  const [budget, setBudget] = useState("3000");
  const [spent, setSpent] = useState("0");
  const [compareIds, setCompareIds] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginReason, setLoginReason] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notice, setNotice] = useState("");
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const showNotice = (message) => {
    setNotice(message);
    window.clearTimeout(showNotice.timeout);
    showNotice.timeout = window.setTimeout(() => setNotice(""), 3000);
  };

  const visibleProducts = useMemo(() => {
    let result = productsData.filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        [product.name, product.brand, product.category, product.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      const matchesWishlist = !wishlistOnly || savedIds.includes(product.id);

      return matchesCategory && matchesSearch && matchesWishlist;
    });

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [category, search, sortBy, wishlistOnly, savedIds]);

  const comparedProducts = productsData.filter((product) =>
    compareIds.includes(product.id)
  );

  const totalSpent = Math.max(0, Number(spent) || 0);
  const totalBudget = Math.max(0, Number(budget) || 0);
  const remaining = totalBudget - totalSpent;
  const budgetPercent =
    totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

  const requireLogin = (reason) => {
    if (loggedIn) return true;
    setLoginReason(reason);
    setLoginOpen(true);
    return false;
  };

  const toggleSave = (product) => {
    if (!requireLogin("Save products to your wishlist")) return;

    setSavedIds((current) =>
      current.includes(product.id)
        ? current.filter((id) => id !== product.id)
        : [...current, product.id]
    );
    showNotice(
      savedIds.includes(product.id)
        ? "Removed from your wishlist"
        : "Added to your wishlist"
    );
  };

  const toggleCompare = (product) => {
    setCompareIds((current) => {
      if (current.includes(product.id)) {
        return current.filter((id) => id !== product.id);
      }
      if (current.length >= 3) {
        showNotice("Compare up to 3 products at a time.");
        return current;
      }
      return [...current, product.id];
    });
  };

  const handleBuy = (product) => {
    const url =
      product.buyUrl ||
      `https://www.amazon.in/s?k=${encodeURIComponent(product.name)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    showNotice("Opening a retailer search for this demo product.");
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      showNotice("Enter an email and password to continue.");
      return;
    }
    setLoggedIn(true);
    setLoginOpen(false);
    setPassword("");
    showNotice("Demo session started. No account was created.");
  };

  const featuredCategories = Object.keys(categoryImages);

  return (
    <div className="app-shell">
      <div className="announcement-bar">
        <span className="announcement-dot" />
        Your smarter shopping companion
        <span className="announcement-divider">·</span>
        Demo experience
      </div>

      <header className="site-header">
        <a className="brand" href="#home" aria-label="Savora home">
          <span className="brand-mark">s</span>
          <span>savora<span className="brand-period">.</span></span>
        </a>

        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenu((open) => !open)}
          aria-label="Toggle navigation"
        >
          {mobileMenu ? "✕" : "☰"}
        </button>

        <nav className={`main-nav ${mobileMenu ? "nav-open" : ""}`}>
          <a href="#home" onClick={() => setMobileMenu(false)}>Home</a>
          <a href="#explore" onClick={() => setMobileMenu(false)}>Explore</a>
          <a href="#how" onClick={() => setMobileMenu(false)}>How it works</a>
          <a href="#budget" onClick={() => { setMode("student"); setMobileMenu(false); }}>Budget planner</a>
        </nav>

        <div className="header-actions">
          <button
            className="header-wishlist"
            onClick={() => {
              if (!requireLogin("Open your wishlist")) return;
              setWishlistOnly((value) => !value);
              document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span>♡</span> Wishlist
            {savedIds.length > 0 && <span className="wishlist-count">{savedIds.length}</span>}
          </button>
          {loggedIn ? (
            <button className="button button-secondary header-cta" onClick={() => {
              setLoggedIn(false);
              setWishlistOnly(false);
              showNotice("Demo session ended.");
            }}>
              Sign out
            </button>
          ) : (
            <button className="button button-primary header-cta" onClick={() => {
              setLoginReason("Try the Savora demo account");
              setLoginOpen(true);
            }}>
              Get started <span>↗</span>
            </button>
          )}
        </div>
      </header>

      <main>
        <section className="hero section-container" id="home">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="sparkle">✳</span>
              YOUR SMARTER WAY TO SHOP
            </div>
            <h1>
              Less searching.
              <br />
              <span>More saving.</span>
            </h1>
            <p className="hero-description">
              Discover products, compare your options, and plan your spending.
              Make every purchase feel like a smarter decision.
            </p>

            <div className="hero-actions">
              <a className="button button-primary button-large" href="#explore">
                Explore products <span>↗</span>
              </a>
              <a className="button button-ghost button-large" href="#how">
                Discover Savora <span>↓</span>
              </a>
            </div>

            <div className="hero-social-proof">
              <div className="avatar-stack" aria-hidden="true">
                <span>S</span><span>✦</span><span>✓</span>
              </div>
              <div>
                <strong>Shop with intention.</strong>
                <span>Compare clearly. Spend confidently.</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85"
                alt="Shopping and payment experience"
              />
              <div className="image-shade" />
              <div className="hero-image-label">
                <span className="label-icon">✳</span>
                <div>
                  <strong>Spend with purpose</strong>
                  <span>Your choices, your budget.</span>
                </div>
              </div>
              <div className="floating-price-card">
                <span className="floating-card-icon">↗</span>
                <div>
                  <span>THE SAVORA WAY</span>
                  <strong>Know before you buy.</strong>
                </div>
              </div>
            </div>
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
          </div>
        </section>

        <section className="benefit-strip section-container">
          <div className="benefit-item">
            <span className="benefit-icon">⌕</span>
            <div><strong>Discover</strong><span>Find your next favorite</span></div>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">⇄</span>
            <div><strong>Compare</strong><span>See options side by side</span></div>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">◎</span>
            <div><strong>Plan</strong><span>Keep spending in view</span></div>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">↗</span>
            <div><strong>Choose</strong><span>Shop with more confidence</span></div>
          </div>
        </section>

        <section className="category-section section-container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A LITTLE OF EVERYTHING</span>
              <h2>Find your <span>kind of good.</span></h2>
            </div>
            <a href="#explore" className="text-link">Explore all products ↗</a>
          </div>

          <div className="category-grid">
            {featuredCategories.map((item, index) => (
              <button
                key={item}
                className={`category-tile category-tile-${index + 1}`}
                onClick={() => {
                  setCategory(item);
                  setWishlistOnly(false);
                  document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <img src={categoryImages[item]} alt="" loading="lazy" />
                <span className="category-overlay" />
                <span className="category-tile-text">
                  <span className="category-number">0{index + 1}</span>
                  <strong>{item}</strong>
                  <span className="category-discover">Explore category ↗</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mode-section section-container">
          <div className="mode-copy">
            <span className="eyebrow">MADE FOR YOUR REAL LIFE</span>
            <h2>What’s your <span>shopping style?</span></h2>
            <p>
              Whether you're comparing your next purchase or making your
              monthly money stretch, Savora helps you start with a plan.
            </p>
          </div>
          <div className="mode-cards">
            <button
              className={`mode-card ${mode === "buyer" ? "mode-card-active" : ""}`}
              onClick={() => setMode("buyer")}
            >
              <span className="mode-card-icon">⌕</span>
              <span className="mode-card-label">FOR EVERY SHOPPER</span>
              <strong>Smart buyer</strong>
              <span>Explore products and compare options.</span>
              <span className="mode-card-arrow">↗</span>
            </button>
            <button
              className={`mode-card ${mode === "student" ? "mode-card-active" : ""}`}
              onClick={() => setMode("student")}
            >
              <span className="mode-card-icon">◷</span>
              <span className="mode-card-label">FOR BUDGET MINDS</span>
              <strong>Student mode</strong>
              <span>Track spending and plan what comes next.</span>
              <span className="mode-card-arrow">↗</span>
            </button>
          </div>
        </section>

        {mode === "student" && (
          <section className="budget-section section-container" id="budget">
            <div className="budget-intro">
              <span className="eyebrow">YOUR MONEY, YOUR RULES</span>
              <h2>A budget that <span>gets you.</span></h2>
              <p>
                Set a limit, track what you've spent, and see what's left
                before making your next move.
              </p>
              <div className="budget-note">
                <span>✳</span> Your budget stays in this demo session.
              </div>
            </div>

            <div className="budget-panel">
              <div className="budget-panel-top">
                <div>
                  <span className="eyebrow">MONTHLY SNAPSHOT</span>
                  <h3>Your spending plan</h3>
                </div>
                <span className="budget-status">{remaining >= 0 ? "ON YOUR WAY" : "OVER BUDGET"}</span>
              </div>

              <label className="field-label" htmlFor="budget-input">Your budget (₹)</label>
              <div className="budget-input-wrap">
                <span>₹</span>
                <input
                  id="budget-input"
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                />
              </div>

              <label className="field-label" htmlFor="spent-input">Amount already spent (₹)</label>
              <div className="budget-input-wrap">
                <span>₹</span>
                <input
                  id="spent-input"
                  type="number"
                  min="0"
                  value={spent}
                  onChange={(event) => setSpent(event.target.value)}
                />
              </div>

              <div className="budget-progress-heading">
                <span>Budget used</span><strong>{budgetPercent.toFixed(0)}%</strong>
              </div>
              <div
                className="budget-progress-track"
                role="progressbar"
                aria-valuenow={budgetPercent}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div className="budget-progress-fill" style={{ width: `${budgetPercent}%` }} />
              </div>

              <div className="budget-summary">
                <div>
                  <span>Spent</span>
                  <strong>{money(totalSpent)}</strong>
                </div>
                <div>
                  <span>{remaining >= 0 ? "Still available" : "Over budget by"}</span>
                  <strong className={remaining < 0 ? "negative-value" : "positive-value"}>
                    {money(Math.abs(remaining))}
                  </strong>
                </div>
              </div>

              <a className="button button-primary budget-explore" href="#explore">
                Browse within your budget ↗
              </a>
            </div>
          </section>
        )}

        <section className="products-section section-container" id="explore">
          <div className="section-heading products-heading">
            <div>
              <span className="eyebrow">THE DISCOVERY EDIT</span>
              <h2>Good finds. <span>Better choices.</span></h2>
              <p className="section-subtitle">
                Explore our sample catalog and compare products your way.
              </p>
            </div>
            <div className="catalog-count">
              <strong>{visibleProducts.length}</strong>
              <span>{wishlistOnly ? "saved items" : "demo listings"}</span>
            </div>
          </div>

          <div className="catalog-toolbar">
            <div className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search products, brands, categories..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search products"
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear search">✕</button>
              )}
            </div>
            <label className="sort-control">
              <span>Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="rating">Top rated</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>

          <div className="category-filters">
            {categories.map((item) => (
              <button
                key={item}
                className={`filter-chip ${category === item ? "filter-chip-active" : ""}`}
                onClick={() => {
                  setCategory(item);
                  setWishlistOnly(false);
                }}
              >
                {item}
              </button>
            ))}
            {wishlistOnly && (
              <button className="filter-chip clear-filter" onClick={() => setWishlistOnly(false)}>
                ✕ Clear wishlist filter
              </button>
            )}
          </div>

          {visibleProducts.length > 0 ? (
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDetails={setSelectedProduct}
                  onCompare={toggleCompare}
                  onSave={toggleSave}
                  saved={savedIds.includes(product.id)}
                  comparing={compareIds.includes(product.id)}
                  onBuy={handleBuy}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>⌕</span>
              <h3>No products found</h3>
              <p>Try another search or choose a different category.</p>
              <button
                className="button button-primary"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setWishlistOnly(false);
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </section>

        {comparedProducts.length > 0 && (
          <section className="compare-section section-container" id="compare">
            <div className="section-heading">
              <div>
                <span className="eyebrow">SIDE-BY-SIDE</span>
                <h2>Make the <span>comparison.</span></h2>
              </div>
              <button className="text-link-button" onClick={() => setCompareIds([])}>
                Clear comparison ✕
              </button>
            </div>
            <p className="section-subtitle">
              Compare up to three sample listings. Prices are demonstration values.
            </p>
            <div className="compare-table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    {comparedProducts.map((product) => (
                      <th key={product.id}>
                        <button
                          className="compare-remove"
                          onClick={() => toggleCompare(product)}
                          aria-label={`Remove ${product.name}`}
                        >
                          ✕
                        </button>
                        <img
                          src={product.image || categoryImages[product.category]}
                          alt=""
                        />
                        <strong>{product.name}</strong>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Demo price</td>
                    {comparedProducts.map((product) => (
                      <td key={product.id} className="compare-price">{money(product.price)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Category</td>
                    {comparedProducts.map((product) => <td key={product.id}>{product.category}</td>)}
                  </tr>
                  <tr>
                    <td>Rating</td>
                    {comparedProducts.map((product) => <td key={product.id}>★ {product.rating}</td>)}
                  </tr>
                  <tr>
                    <td>Brand</td>
                    {comparedProducts.map((product) => <td key={product.id}>{product.brand}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="how-section section-container" id="how">
          <div className="how-heading">
            <span className="eyebrow">SIMPLE BY DESIGN</span>
            <h2>Three steps to <span>shop smarter.</span></h2>
            <p>Less clutter. More clarity. Decisions that feel right for you.</p>
          </div>
          <div className="how-grid">
            <article className="how-card">
              <span className="how-number">01</span>
              <span className="how-icon">⌕</span>
              <h3>Discover</h3>
              <p>Search a sample catalog and browse the categories that interest you.</p>
            </article>
            <article className="how-card">
              <span className="how-number">02</span>
              <span className="how-icon">⇄</span>
              <h3>Compare</h3>
              <p>Put products side by side and review their demo prices and details.</p>
            </article>
            <article className="how-card">
              <span className="how-number">03</span>
              <span className="how-icon">◎</span>
              <h3>Plan your spend</h3>
              <p>Set a budget and keep track of how much you want to spend.</p>
            </article>
          </div>
        </section>

        <section className="closing-cta section-container">
          <div>
            <span className="eyebrow">YOUR NEXT SMART MOVE</span>
            <h2>Shop your way.<br /><span>Stay in control.</span></h2>
          </div>
          <a className="button button-primary button-large" href="#explore">
            Start exploring <span>↗</span>
          </a>
          <div className="closing-decoration">s.</div>
        </section>
      </main>

      <footer className="site-footer section-container">
        <div className="footer-top">
          <a className="brand footer-brand" href="#home">
            <span className="brand-mark">s</span><span>savora<span className="brand-period">.</span></span>
          </a>
          <p>Shop smarter. Spend with purpose.</p>
          <a href="#home" className="back-top">Back to top ↑</a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Savora. Student demo project.</span>
          <span>Sample catalog · No verified live pricing</span>
        </div>
      </footer>

      {notice && <div className="toast-message" role="status">{notice}</div>}

      {loginOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setLoginOpen(false);
          }}
        >
          <section className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
            <button className="modal-close" onClick={() => setLoginOpen(false)} aria-label="Close">✕</button>
            <span className="brand-mark modal-brand-mark">s</span>
            <span className="eyebrow">WELCOME TO SAVORA</span>
            <h2 id="login-title">Your smarter space.</h2>
            <p>{loginReason || "Start your demo session to explore saved products."}</p>
            <form onSubmit={handleLogin}>
              <label className="field-label" htmlFor="login-email">Email address</label>
              <input
                className="form-input"
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <label className="field-label" htmlFor="login-password">Password</label>
              <input
                className="form-input"
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter any demo password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button className="button button-primary login-submit" type="submit">
                Continue to demo ↗
              </button>
            </form>
            <p className="fine-print">
              Demo only: this form does not create an account or send your details to a server.
            </p>
          </section>
        </div>
      )}

      {selectedProduct && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedProduct(null);
          }}
        >
          <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
            <button className="modal-close" onClick={() => setSelectedProduct(null)} aria-label="Close">✕</button>
            <div className="detail-layout">
              <div className="detail-image-wrap">
                <img
                  className="detail-image"
                  src={selectedProduct.image || categoryImages[selectedProduct.category]}
                  alt={selectedProduct.name}
                />
              </div>
              <div className="detail-copy">
                <span className="eyebrow">{selectedProduct.category}</span>
                <h2 id="detail-title">{selectedProduct.name}</h2>
                <p className="detail-brand">{selectedProduct.brand}</p>
                <div className="detail-price">{money(selectedProduct.price)} <span className="demo-badge">DEMO PRICE</span></div>
                <p>{selectedProduct.longDescription || selectedProduct.description}</p>
                <div className="detail-rating">★ {selectedProduct.rating} <span>·</span> {selectedProduct.reviewCount ?? 0} reviews</div>

                <h3>Highlights</h3>
                <ul className="detail-features">
                  {(selectedProduct.features || ["Demo catalog listing", "Check retailer for details"]).map((feature) => (
                    <li key={feature}><span>✓</span>{feature}</li>
                  ))}
                </ul>

                {selectedProduct.specifications && (
                  <>
                    <h3>Specifications</h3>
                    <dl className="spec-list">
                      {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                        <div key={key}>
                          <dt>{key}</dt><dd>{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}

                <button className="button button-primary detail-buy" onClick={() => handleBuy(selectedProduct)}>
                  Find online <span>↗</span>
                </button>
              </div>
            </div>
            <PriceHistory product={selectedProduct} />
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
