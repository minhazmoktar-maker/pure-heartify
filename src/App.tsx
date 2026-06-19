import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index.tsx";
import Watch from "./pages/Watch.tsx";
import SearchResults from "./pages/SearchResults.tsx";
import SectionAll from "./pages/SectionAll.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Privacy from "./pages/Privacy.tsx";
import Profile from "./pages/Profile.tsx";
import Channels from "./pages/Channels.tsx";
import ModerationLog from "./pages/ModerationLog.tsx";
import Audit from "./pages/Audit.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import NotFound from "./pages/NotFound.tsx";
import { MobileBridge } from "./components/MobileBridge";
import ReferralBridge from "./components/ReferralBridge";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <PlayerProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MobileBridge />
            <ReferralBridge />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/watch/:videoId" element={<Watch />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/section/:sectionId" element={<SectionAll />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/channels" element={<Channels />} />
              <Route path="/admin/moderation" element={<ModerationLog />} />
              <Route path="/admin/audit" element={<Audit />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  </TooltipProvider>
  </QueryClientProvider>
);

export default App;
