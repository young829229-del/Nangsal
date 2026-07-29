import React, { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";

export const SignUpSection: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email && !loading) {
      setLoading(true);
      try {
        const saved = localStorage.getItem("nangsal_subscribers");
        const subscribers = saved ? JSON.parse(saved) : [];
        subscribers.push({
          email,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem("nangsal_subscribers", JSON.stringify(subscribers));
        setSubmitted(true);
      } catch (error) {
        console.error("Error saving subscriber:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <section className="w-full bg-white text-black py-20 px-6 md:px-12 flex flex-col items-center justify-center text-center">
      <div className="max-w-xl w-full">
        <h2 className="text-3xl md:text-5xl font-black tracking-widest uppercase mb-4">
          GET 5% OFF
        </h2>
        <p className="text-sm md:text-base font-mono tracking-widest text-neutral-600 uppercase mb-8 leading-relaxed">
          JOIN THE ARCHIVES. GET AN EXCLUSIVE DISCOUNT CODE FOR YOUR FIRST PURCHASE AND SECURE ACCESS TO FUTURE DROPS BEFORE THEY EXHAUST.
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-100 text-black border border-neutral-300 p-4 font-sans text-sm tracking-wide font-medium w-full max-w-md mx-auto rounded-md flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Success! Use discount code: <strong>NANGSAL5</strong></span>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto flex flex-col sm:flex-row items-center gap-3">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 w-full border border-neutral-200 bg-white focus:border-black py-3 px-4 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-black transition-all text-black placeholder-neutral-400 rounded-md shadow-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-black text-white font-sans text-sm font-medium py-3 px-6 hover:bg-neutral-800 transition-colors whitespace-nowrap cursor-pointer rounded-md disabled:opacity-50 shadow-sm"
            >
              {loading ? "Joining..." : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
