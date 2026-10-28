import { motion } from "framer-motion";
import { ArrowLeft, Heart, Sparkles } from "lucide-react";

const items = [
  { id: 9, name: "Anime Graphic Tee", price: 599, emoji: "👕" },
  { id: 11, name: "Cute Desk Figure", price: 399, emoji: "🧸" },
  { id: 12, name: "LED Mood Light", price: 799, emoji: "🌈" },
  { id: 10, name: "Gaming Controller", price: 1899, emoji: "🎮" },
  { id: 1, name: "Wireless Headphones", price: 1499, emoji: "🎧" },
  { id: 3, name: "Everyday Backpack", price: 899, emoji: "🎒" },
];

const money = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export default function GenZPage({
  onBack,
  favorites = [],
  onToggleFavorite = () => {},
}) {
  return (
    <main className="genz-page">
      <header className="genz-topbar">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Savora
        </button>

        <span className="genz-logo">
          <Sparkles size={20} /> savora.
        </span>
      </header>

      <section className="genz-hero">
        <div>
          <span className="genz-kicker">YOUR VIBE, YOUR RULES</span>
          <h1>
            Big vibe.
            <br />
            <span>Small budget.</span>
          </h1>
          <p>
            Discover aesthetic products, gaming favourites and everyday
            essentials while keeping your budget in mind.
          </p>
        </div>

        <div className="genz-orb">✨ 🎧 🌈</div>
      </section>

      <section className="genz-picks">
        <h2>Made for your mood.</h2>

        <div className="genz-grid">
          {items.map((item, index) => {
            const saved = favorites.includes(item.id);

            return (
              <motion.article
                className="genz-card"
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ y: -5 }}
              >
                <div className={`genz-art genz-art-${index % 4}`}>
                  <span className="genz-emoji">{item.emoji}</span>

                  <button
                    className="genz-heart"
                    onClick={() => onToggleFavorite(item.id)}
                    aria-label="Toggle wishlist"
                  >
                    <Heart
                      size={19}
                      fill={saved ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <div className="genz-card-info">
                  <h3>{item.name}</h3>
                  <strong>{money(item.price)}</strong>

                  <button onClick={() => onToggleFavorite(item.id)}>
                    {saved ? "Saved to wishlist ♥" : "Save for later"}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <footer className="genz-footer">
        savora. <span>Shop smarter, stay you.</span>
      </footer>
    </main>
  );
}