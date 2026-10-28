
import { useMemo, useState } from "react";
import productsData from "./products.js";
import "./index.css";

const categories = [
  "Electronics",
  "Home & Kitchen",
  "Fashion",
  "Beauty & Personal Care",
  "Sports & Outdoors",
];

const categoryImages = {
  Electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  ],
  "Home & Kitchen": [
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80",
  ],
  Fashion: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  ],
  "Beauty & Personal Care": [
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80",
  ],
  "Sports & Outdoors": [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
  ],
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const ratingOf = (product) => Number(product.rating) || 4.5;

// Two products per category, with unique demo images.
const featuredProducts = categories.flatMap((category) => {
  const categoryProducts = productsData.filter(
    (product) => product.category === category
  );

  return categoryProducts.slice(0, 2).map((product, index) => ({
    ...product,
    image:
      categoryImages[category]?.[index] ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  }));
});

// Clearly simulated price history. This is not real retailer history.
function getDemoHistory(product) {
  const current = Number(product.price) || 999;
  const offsets = [1.24, 1.12, 1.19, 1.05, 1.14, 0.96, 1.08, 1];

  return offsets.map((factor, index) => ({
    label: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Now"][index],
    price: Math.max(1, Math.round(current * factor)),
  }));
}

function PriceHistory({ product }) {
  const history = useMemo(() => getDemoHistory(product), [product]);
  const values = history.map((point) => point.price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = history
    .map((point, index) => {
      const x = 12 + (index / (history.length - 1)) * 276;
      const y = 108 - ((point.price - min) / range) * 78;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="savora-history">
      <div className="savora-history-heading">
        <div>
          <span className="savora-mini-label">DEMO PRICE TREND</span>
          <h3>Price history</h3>
        </div>
        <span className="savora-history-badge">Sample data</span>
      </div>

      <div className="savora-history-stats">
        <div>
          <span>Sample low</span>
          <strong>{money(min)}</strong>
        </div>
        <div>
          <span>Sample high</span>
          <strong>{money(max)}</strong>
        </div>
        <div>
          <span>Current demo price</span>
          <strong>{money(product.price)}</strong>
        </div>
      </div>

      <svg
        className="savora-chart"
        viewBox="0 0 300 125"
        role="img"
        aria-label="Illustrative sample price trend chart"
      >
        {[30, 55, 80, 108].map((y) => (
          <line
            key={y}
            x1="8"
            y1={y}
            x2="292"
            y2={y}
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeDasharray="4 4"
          />
        ))}
        <polyline
          points={points}
          fill="none"
          stroke="#a3e635"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {history.map((point, index) => {
          const x = 12 + (index / (history.length - 1)) * 276;
          const y = 108 - ((point.price - min) / range) * 78;

          return (
            <circle
              key={point.label}
              cx={x}
              cy={y}
              r="3.5"
              fill="#a3e635"
            />
          );
        })}
      </svg>

      <p className="savora-history-note">
        Illustrative values only. These are not verified Amazon, Flipkart,
        or other retailer prices.
      </p>
    </div>
  );
}

export default function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [mode, setMode] = useState("buyer");

  const [budget, setBudget] = useState(3000);
  const [spent, setSpent] = useState(0);

  const [compareIds, setCompareIds] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);

  const [loginOpen, setLoginOpen] = useState(false);
  const [loginReason, setLoginReason] = useState("save products");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notice, setNotice] = useState("");

  const visibleProducts = useMemo(() => {
    const filtered = featuredProducts.filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;

      const searchable =
        `${product.name} ${product.brand || ""} ${product.category}`.toLowerCase();

      return matchesCategory && searchable.includes(search.toLowerCase());
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price-low") return Number(a.price) - Number(b.price);
      if (sortBy === "price-high") return Number(b.price) - Number(a.price);
      if (sortBy === "rating") return ratingOf(b) - ratingOf(a);
      return 0;
    });
  }, [search, category, sortBy]);

  const comparedProducts = compareIds
    .map((id) => featuredProducts.find((product) => product.id === id))
    .filter(Boolean);

  const lowestComparedPrice =
    comparedProducts.length > 0
      ? Math.min(...comparedProducts.map((product) => Number(product.price) || 0))
      : null;

  const remaining = budget - spent;
  const progress =
    budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

  function requireLogin(reason) {
    if (loggedIn) return true;

    setLoginReason(reason);
    setLoginOpen(true);
    return false;
  }

  function handleLogin(event) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setNotice("Please enter your email and password.");
      return;
    }

    setLoggedIn(true);
    setLoginOpen(false);
    setPassword("");
    setNotice("Demo login successful!");
  }

  function toggleSave(product) {
    if (!requireLogin("save products")) return;

    const exists = saved.includes(product.id);

    setSaved((previous) =>
      exists
        ? previous.filter((id) => id !== product.id)
        : [...previous, product.id]
    );

    setNotice(exists ? "Product removed from saved items." : "Product saved!");
  }

  function toggleCompare(product) {
    setCompareIds((previous) => {
      if (previous.includes(product.id)) {
        return previous.filter((id) => id !== product.id);
      }

      if (previous.length >= 2) {
        setNotice("Compare up to two products at a time.");
        return previous;
      }

      return [...previous, product.id];
    });
  }

  function buyProduct(product) {
    if (!requireLogin("continue to buy")) return;

    setNotice(
      `Demo only: ${product.name} selected. No payment was made.`
    );
  }

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setSortBy("featured");
  }

  return (
    <div className="savora" id="home">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-mark">S</span>
          <span>savora<span className="brand-dot">.</span></span>
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#products">Explore</a>
          <a href="#how">How it works</a>
        </nav>

        <div className="header-actions">
          <button
            className="text-button"
            onClick={() => {
              if (!requireLogin("view your saved products")) return;
              setNotice(`You have ${saved.length} saved product(s).`);
            }}
          >
            ♡ Saved {saved.length || ""}
          </button>

          {loggedIn ? (
            <button
              className="login-button"
              onClick={() => {
                setLoggedIn(false);
                setNotice("Logged out.");
              }}
            >
              Log out
            </button>
          ) : (
            <button
              className="login-button"
              onClick={() => {
                setLoginReason("sign in");
                setLoginOpen(true);
              }}
            >
              Log in
            </button>
          )}
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              YOUR SMARTER WAY TO SHOP
            </div>

            <h1>
              Less searching.
              <br />
              <span>More saving.</span>
            </h1>

            <p className="hero-description">
              Discover great products, compare prices and make smarter
              choices that fit your style and budget.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#products">
                Explore products ↗
              </a>
              <a className="secondary-button" href="#how">
                How it works
              </a>
            </div>

            <div className="hero-trust">
              <span>✓</span> Browse freely. No account needed.
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-glow" />
            <div className="hero-card">
              <img src={categoryImages.Electronics[0]} alt="Featured headphones" />
              <div className="hero-product-info">
                <span>FEATURED PICK</span>
                <strong>Find your next favorite.</strong>
                <small>Thoughtful picks. Smarter spending.</small>
              </div>
            </div>

            <div className="floating-card floating-top">
              <span className="floating-icon">↗</span>
              <div>
                <strong>Compare smarter</strong>
                <small>Know your options</small>
              </div>
            </div>

            <div className="floating-card floating-bottom">
              <span className="floating-icon">₹</span>
              <div>
                <strong>Budget friendly</strong>
                <small>Shop with purpose</small>
              </div>
            </div>
          </div>
        </section>

        <section className="benefit-strip">
          <div>✦ Curated product picks</div>
          <div>↔ Easy price comparison</div>
          <div>◎ Budget-friendly planning</div>
        </section>

        <section className="products-section" id="products">
          <div className="section-heading">
            <div>
              <div className="eyebrow">THE SAVORA EDIT</div>
              <h2>Good finds. Better choices.</h2>
              <p>Explore two sample products from each category.</p>
            </div>
            <span className="demo-label">DEMO PRODUCTS</span>
          </div>

          <div className="mode-row">
            <div>
              <strong>Choose your experience</strong>
              <p>Switch between shopping and student planning.</p>
            </div>
            <div className="mode-switch">
              <button
                className={mode === "buyer" ? "active" : ""}
                onClick={() => setMode("buyer")}
              >
                🛍 Buyer
              </button>
              <button
                className={mode === "student" ? "active" : ""}
                onClick={() => setMode("student")}
              >
                ✦ Student
              </button>
            </div>
          </div>

          {mode === "student" && (
            <div className="student-banner">
              <div>
                <div className="eyebrow">STUDENT MODE</div>
                <h3>Shop with a plan.</h3>
                <p>
                  Plan your spending and compare options. Prices are sample data.
                </p>
              </div>
              <span className="student-symbol">₹</span>
            </div>
          )}

          <section className="budget-planner">
            <div className="budget-heading">
              <div>
                <div className="eyebrow">YOUR MONEY, YOUR PLAN</div>
                <h3>Smart Budget Planner</h3>
                <p>Know how much you can still spend.</p>
              </div>
              <span className="budget-icon">₹</span>
            </div>

            <div className="budget-inputs">
              <label>
                Total budget (₹)
                <input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(event) =>
                    setBudget(Math.max(0, Number(event.target.value) || 0))
                  }
                />
              </label>

              <label>
                Already spent (₹)
                <input
                  type="number"
                  min="0"
                  value={spent}
                  onChange={(event) =>
                    setSpent(Math.max(0, Number(event.target.value) || 0))
                  }
                />
              </label>
            </div>

            <div className="budget-summary">
              <div>
                <span>Total budget</span>
                <strong>{money(budget)}</strong>
              </div>
              <div>
                <span>Already spent</span>
                <strong>{money(spent)}</strong>
              </div>
              <div>
                <span>Remaining</span>
                <strong className={remaining < 0 ? "over-budget" : "remaining"}>
                  {money(remaining)}
                </strong>
              </div>
            </div>

            <div className="budget-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
              <div style={{ width: `${progress}%` }} />
            </div>

            <p className="budget-message">
              {remaining < 0
                ? "You are over budget. Consider reducing spending."
                : budget === 0
                  ? "Enter a budget to start planning."
                  : `You have ${money(remaining)} left to spend.`}
            </p>
          </section>

          <div className="search-row">
            <label className="search-box">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products or brands..."
                aria-label="Search products"
              />
              {search && <button onClick={() => setSearch("")}>×</button>}
            </label>
            <span className="result-count">{visibleProducts.length} products</span>
          </div>

          <div className="sort-row">
            <label htmlFor="product-sort">Sort products</label>
            <select id="product-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <div className="category-list">
            {["All", ...categories].map((item) => (
              <button
                key={item}
                className={`category-chip ${category === item ? "selected" : ""}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <button
                  className={`save-button ${saved.includes(product.id) ? "is-saved" : ""}`}
                  onClick={() => toggleSave(product)}
                  aria-label="Save product"
                >
                  {saved.includes(product.id) ? "♥" : "♡"}
                </button>

                <button className="product-image-button" onClick={() => setSelectedProduct(product)}>
                  <img className="product-image" src={product.image} alt={product.name} loading="lazy" />
                  <span className="image-category">{product.category}</span>
                </button>

                <div className="product-details">
                  <div className="product-brand">{product.brand || "Savora pick"}</div>
                  <h3>{product.name}</h3>

                  <div className="rating">
                    <span>★</span> {ratingOf(product).toFixed(1)}
                    <small>({product.reviewCount || 0} reviews)</small>
                  </div>

                  <div className="price-row">
                    <strong>{money(product.price)}</strong>
                    <span className="demo-price-tag">DEMO</span>
                  </div>

                  <div className="product-actions">
                    <button className="details-button" onClick={() => setSelectedProduct(product)}>
                      Details
                    </button>
                    <button
                      className={`details-button ${compareIds.includes(product.id) ? "compare-selected" : ""}`}
                      onClick={() => toggleCompare(product)}
                    >
                      {compareIds.includes(product.id) ? "✓ Selected" : "⇄ Compare"}
                    </button>
                    <button className="buy-button" onClick={() => buyProduct(product)}>
                      Buy now ↗
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {visibleProducts.length === 0 && (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try another search or category.</p>
              <button className="secondary-button" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}

          {compareIds.length > 0 && (
            <section className="comparison-section">
              <div className="comparison-heading">
                <div>
                  <div className="eyebrow">SIDE BY SIDE</div>
                  <h3>Compare products</h3>
                  <p>Select up to two products.</p>
                </div>
                <button className="details-button" onClick={() => setCompareIds([])}>
                  Clear comparison
                </button>
              </div>

              {compareIds.length < 2 && (
                <p className="comparison-hint">Select one more product to compare.</p>
              )}

              <div className="comparison-grid">
                {comparedProducts.map((product) => {
                  const isLowest = Number(product.price) === lowestComparedPrice;

                  return (
                    <article className={`comparison-card ${isLowest && comparedProducts.length === 2 ? "comparison-best" : ""}`} key={product.id}>
                      <img src={product.image} alt={product.name} />
                      <h4>{product.name}</h4>
                      <p>{product.brand || "Savora pick"}</p>

                      {isLowest && comparedProducts.length === 2 && (
                        <span className="best-price-label">Lowest demo price</span>
                      )}

                      <div className="comparison-value">
                        <span>Price</span>
                        <strong className={isLowest && comparedProducts.length === 2 ? "lowest-price" : ""}>
                          {money(product.price)}
                        </strong>
                      </div>

                      <div className="comparison-value">
                        <span>Rating</span>
                        <strong>★ {ratingOf(product).toFixed(1)}</strong>
                      </div>

                      <div className="comparison-value">
                        <span>Category</span>
                        <strong>{product.category}</strong>
                      </div>

                      <button className="details-button" onClick={() => setSelectedProduct(product)}>
                        View details
                      </button>
                      <button
                        className="details-button"
                        onClick={() => setCompareIds((previous) => previous.filter((id) => id !== product.id))}
                      >
                        Remove
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          <p className="demo-disclaimer">
            Demo notice: prices, ratings, and chart history are sample data, not live store information.
          </p>
        </section>

        <section className="how-section" id="how">
          <div className="eyebrow">SHOP WITH CLARITY</div>
          <h2>A smarter way to find what you need.</h2>
          <div className="how-grid">
            <article className="how-card">
              <span>01</span>
              <h3>Discover</h3>
              <p>Browse products without creating an account.</p>
            </article>
            <article className="how-card">
              <span>02</span>
              <h3>Compare</h3>
              <p>Compare sample prices and ratings side by side.</p>
            </article>
            <article className="how-card">
              <span>03</span>
              <h3>Save your picks</h3>
              <p>Sign in to save favorites to your wishlist.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand" href="#home">
          <span className="brand-mark">S</span>
          <span>savora<span className="brand-dot">.</span></span>
        </a>
        <p>Shop smarter. Spend with purpose.</p>
        <small>© 2026 Savora · Student project demo</small>
      </footer>

      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
        </div>
      )}

      {loginOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setLoginOpen(false);
        }}>
          <section className="login-modal">
            <button className="modal-close" onClick={() => setLoginOpen(false)} aria-label="Close login">×</button>
            <div className="login-brand"><span className="brand-mark">S</span></div>
            <div className="eyebrow">WELCOME TO SAVORA</div>
            <h2>Your picks, all in one place.</h2>
            <p>Sign in to {loginReason}. Browsing and searching are always free.</p>

            <form onSubmit={handleLogin}>
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter any demo password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button className="primary-button login-submit" type="submit">Continue ↗</button>
            </form>

            <div className="login-note">DEMO LOGIN · Any valid email + any password</div>
            <p className="privacy-note">Demo only. This form does not create a real account or send your details to a server.</p>
          </section>
        </div>
      )}

      {selectedProduct && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedProduct(null);
        }}>
          <section className="detail-modal">
            <button className="modal-close" onClick={() => setSelectedProduct(null)} aria-label="Close details">×</button>

            <img className="detail-image" src={selectedProduct.image} alt={selectedProduct.name} />
            <div className="eyebrow">{selectedProduct.category}</div>
            <h2>{selectedProduct.name}</h2>
            <p className="detail-brand">{selectedProduct.brand || "Savora pick"}</p>
            <h3>{money(selectedProduct.price)}</h3>
            <p>{selectedProduct.longDescription || selectedProduct.description || "Demo product listing."}</p>

            {Array.isArray(selectedProduct.features) && selectedProduct.features.length > 0 && (
              <div className="detail-features">
                <h4>Product highlights</h4>
                <ul>
                  {selectedProduct.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
              </div>
            )}

            {selectedProduct.specifications && (
              <div className="detail-specifications">
                <h4>Specifications</h4>
                {Object.entries(selectedProduct.specifications).map(([label, value]) => (
                  <div className="comparison-value" key={label}>
                    <span>{label}</span>
                    <strong>{String(value)}</strong>
                  </div>
                ))}
              </div>
            )}

            <PriceHistory product={selectedProduct} />

            <div className="detail-actions">
              <button className="details-button" onClick={() => toggleSave(selectedProduct)}>
                {saved.includes(selectedProduct.id) ? "♥ Saved" : "♡ Save"}
              </button>
              <button className="details-button" onClick={() => toggleCompare(selectedProduct)}>
                {compareIds.includes(selectedProduct.id) ? "✓ Compared" : "⇄ Compare"}
              </button>
              <button className="buy-button" onClick={() => buyProduct(selectedProduct)}>
                Buy now ↗
              </button>
            </div>

            <small className="detail-disclaimer">
              Sample listing only. No live price verification or payment.
            </small>
          </section>
        </div>
      )}
    </div>
  );
}
