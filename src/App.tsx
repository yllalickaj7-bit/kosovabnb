import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ListingPage from "./pages/ListingPage";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import ExperiencesPage from "./pages/ExperiencesPage";
import ServicesPage from "./pages/ServicesPage";
import BecomeHostPage from "./pages/BecomeHostPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/listing/:id" element={<ListingPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/experiences" element={<ExperiencesPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/become-host" element={<BecomeHostPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
