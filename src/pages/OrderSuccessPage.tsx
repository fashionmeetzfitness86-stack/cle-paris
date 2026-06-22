import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../store/cart";

export default function OrderSuccessPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const clear = useCart((s) => s.clear);
  const sessionId = params.get("session_id");

  // Payment confirmed by Stripe → empty the cart once.
  useEffect(() => {
    if (sessionId) clear();
  }, [sessionId, clear]);

  return (
    <div className="min-h-screen bg-[#F4EFE8]">
      <div className="mx-auto max-w-2xl px-6 py-32 text-center animate-fade-up">
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-[#C8A97E] text-[#C8A97E] text-2xl">
          ✓
        </div>
        <div className="text-[11px] uppercase tracking-[0.3em] text-[#C8A97E]">
          CLÉ&nbsp;PARIS
        </div>
        <h1 className="mt-5 font-display text-4xl font-light tracking-tight text-[#111]">
          {t("order.title")}
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-[#6F6F6F]">
          {t("order.body")}
        </p>
        <Link
          to="/collection"
          className="mt-10 inline-block border border-[#111] px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] text-[#111] hover:bg-[#111] hover:text-[#FAF7F2] transition-all duration-300"
        >
          {t("order.continue")}
        </Link>
      </div>
    </div>
  );
}
