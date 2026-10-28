
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();

    // Temporary demo only — real authentication comes later.
    if (!email.trim() || !password.trim()) {
      alert("Please enter your email and password.");
      return;
    }

    if (!isLogin && !name.trim()) {
      alert("Please enter your name.");
      return;
    }

    alert(
      isLogin
        ? "Login page is ready! Backend authentication is our next step."
        : "Signup page is ready! Account creation will be connected next."
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight text-orange-600"
        >
          Savora
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isLogin ? "Welcome back!" : "Create your account"}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {isLogin
              ? "Sign in to continue your shopping journey."
              : "Join Savora and discover products you love."}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`rounded-lg py-3 text-sm font-semibold ${
              isLogin
                ? "bg-white text-orange-600 shadow"
                : "text-gray-500"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`rounded-lg py-3 text-sm font-semibold ${
              !isLogin
                ? "bg-white text-orange-600 shadow"
                : "text-gray-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                required={!isLogin}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={isLogin ? undefined : 8}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
            {!isLogin && (
              <p className="mt-2 text-xs text-gray-500">
                Use at least 8 characters.
              </p>
            )}
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() =>
                  alert("Password recovery will be added later.")
                }
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-orange-600 py-3.5 font-semibold text-white transition hover:bg-orange-700"
          >
            {isLogin ? "Login to Savora" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {isLogin ? "New to Savora?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>

        <p className="mt-6 text-center text-xs text-gray-400">
          By continuing, you agree to Savora's Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
