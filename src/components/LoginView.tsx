import React, { useState } from "react";
import { useApp } from "./AppContext";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export const LoginView: React.FC = () => {
  const { loginWithCustomToken, updateProfileDetails, setActiveTab } = useApp();
  
  const [loginStep, setLoginStep] = useState<"email" | "otp">("email");
  const [loginEmail, setLoginEmail] = useState("");
  const [sentOtp, setSentOtp] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleSendOtp = async () => {
    setLoginError("");
    if (!loginEmail) {
      setLoginError("Please enter a valid email address.");
      return;
    }
    setIsSendingOtp(true);
    try {
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setSentOtp(generated);
      
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, code: generated })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }
      
      setLoginStep("otp");
      if (data.isDevMode) {
        setLoginError(`Preview mode: No email config found. Use code: ${generated}`);
      }
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || "Error generating OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSendingOtp(true);
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, code: otpCode, sentCode: sentOtp })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }
      
      if (!data.isFallback) {
        const authResult = await loginWithCustomToken(data.token);
        if (authResult && authResult.error) {
          throw new Error(authResult.error);
        }
      }

      await updateProfileDetails("", "", "", loginEmail);
      setActiveTab("HOME");
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || "Invalid code. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 md:p-12">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-neutral-200 p-8 shadow-sm text-center"
      >
        <span className="text-[11px] font-mono tracking-[0.4em] text-neutral-400 block mb-1 uppercase font-bold">
          Nangsal Apparel
        </span>
        <h2 className="text-xl font-mono tracking-widest text-black font-extrabold uppercase mb-8">
          LOGIN / REGISTER
        </h2>

        {loginStep === "email" ? (
          <div className="space-y-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-4 font-sans text-sm">
              {loginError && <p className="text-red-500 text-xs font-mono bg-red-50 p-2 border border-red-100">{loginError}</p>}
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-sm p-3.5 pr-12 text-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-black hover:bg-neutral-100 rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSendingOtp ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ArrowRight size={18} />
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 font-mono text-xs uppercase text-neutral-500">
            {loginError && <p className="text-red-500 text-xs text-center">{loginError}</p>}
            <div className="space-y-1">
              <label className="text-[9px] font-bold tracking-wider text-neutral-400 block text-left">6-DIGIT VERIFICATION CODE</label>
              <input
                type="text"
                required
                placeholder="ENTER OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm text-neutral-800 tracking-widest focus:outline-none focus:border-black focus:bg-white text-center tracking-[0.5em] rounded-sm transition-all"
              />
              <p className="text-[9px] text-neutral-400 text-left mt-2 lowercase">
                (For this preview, use code: {sentOtp})
              </p>
            </div>
            <button
              type="submit"
              disabled={isSendingOtp}
              className="w-full bg-black text-white text-[11px] font-bold tracking-widest py-3.5 hover:bg-neutral-900 transition-colors cursor-pointer rounded-sm disabled:opacity-50 flex justify-center items-center h-[46px]"
            >
              {isSendingOtp ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "VERIFY & LOGIN"
              )}
            </button>
            <button
              type="button"
              onClick={() => setLoginStep("email")}
              className="w-full bg-transparent text-neutral-500 border border-neutral-200 text-[10px] font-bold tracking-widest py-3 hover:bg-neutral-50 transition-colors cursor-pointer rounded-sm"
            >
              BACK
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
