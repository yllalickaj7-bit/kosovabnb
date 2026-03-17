import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <SEOHead
        title="404 – Faqja nuk u gjet | KosovaBnB"
        description="Faqja që po kërkoni nuk ekziston. Kthehuni në faqen kryesore të KosovaBnB."
        noindex
      />
      <main className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Faqja nuk u gjet</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Kthehu në faqen kryesore
        </a>
      </main>
    </div>
  );
};

export default NotFound;
