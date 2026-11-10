import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (isLogin) {
      // redirect vetëm brenda faqes (shmang open redirect)
      const redirect = searchParams.get("redirect");
      navigate(redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/");
    } else {
      toast({
        title: "✉️",
        description: "Kontrollo email-in tënd për të konfirmuar llogarinë.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SEOHead
        title={isLogin ? "Hyr në llogari | KosovaBnB" : "Krijo llogari | KosovaBnB"}
        description="Hyr në llogarinë tënde ose krijo një llogari të re në KosovaBnB për të rezervuar vendbanime në Kosovë."
        canonical="https://kosovabnb.lovable.app/auth"
        noindex
      />
      <main className="w-full max-w-md">
        <a
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          KosovaBnB
        </a>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-card-foreground mb-2">
            {isLogin ? t("loginTitle") : t("signupTitle")}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {isLogin ? t("noAccount") : t("hasAccount")}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-semibold hover:underline"
            >
              {isLogin ? t("signup") : t("login")}
            </button>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email")}
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3 border border-input rounded-xl bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("password")}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="w-full pl-11 pr-4 py-3 border border-input rounded-xl bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-brand text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "..." : isLogin ? t("login") : t("signup")}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
