"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Coffee } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.message ?? "Login failed",
        );
        return;
      }

      router.push("/cart");
      router.refresh();
    } catch {
      setErrorMessage(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-orange-50 px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
        <div className="w-full">
          <Link
            href="/cart"
            className="mb-6 inline-flex items-center gap-2 font-bold hover:underline"
          >
            <ArrowLeft size={20} weight="bold" />
            Back to Cart
          </Link>

          <div className="border-2 border-black bg-white p-6 shadow-[7px_7px_0_0_#000] sm:p-8">
            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-black bg-orange-400">
                <Coffee size={26} weight="bold" />
              </div>

              <h1 className="text-3xl font-black uppercase">
                Welcome Back
              </h1>

              <p className="mt-2 text-sm text-zinc-600">
                Login to continue your order.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-black uppercase"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full border-2 border-black bg-white px-4 py-3 outline-none focus:bg-orange-50"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-black uppercase"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full border-2 border-black bg-white px-4 py-3 outline-none focus:bg-orange-50"
                />
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="border-2 border-black bg-red-300 p-3 text-sm font-bold"
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 border-2 border-black bg-yellow-300 px-5 py-4 font-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
              >
                {isSubmitting ? "LOGGING IN..." : "LOGIN"}

                {!isSubmitting && (
                  <ArrowRight
                    size={20}
                    weight="bold"
                  />
                )}
              </button>
            </form>

            <div className="mt-6 border-t-2 border-black pt-5 text-center text-sm">
              <span className="text-zinc-600">
                Don&apos;t have an account?{" "}
              </span>

              <Link
                href="/register"
                className="font-black underline"
              >
                CREATE ACCOUNT
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}