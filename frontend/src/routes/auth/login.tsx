import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { HammerIcon, UserIcon } from "../../components/ui/Icons";
import { useState } from "react";
import { useLogin } from "../../hooks/api";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

function LoginPage() {
  const loginMutation = useLogin();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ general: "Invalid email or password. Please try again." });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center px-12 py-20">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <HammerIcon className="w-12 h-12 text-white" />
              <span className="text-4xl font-bold text-white">AuctionHub</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-bold text-white leading-tight">
                Welcome Back
                <br />
                <span className="text-purple-200">to Premium Auctions</span>
              </h1>

              <p className="text-xl text-purple-100 leading-relaxed">
                Sign in to continue bidding on exclusive items and manage your
                auction activities.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-8">
              <div className="flex items-center gap-4 text-white/90">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <div className="font-semibold">Premium Quality</div>
                  <div className="text-purple-200 text-sm">
                    Curated exclusive items
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-white/90">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <div className="font-semibold">Real-time Bidding</div>
                  <div className="text-purple-200 text-sm">
                    Live auction experience
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-white/90">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                <div>
                  <div className="font-semibold">Secure Platform</div>
                  <div className="text-purple-200 text-sm">
                    Protected transactions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-dark-900">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <HammerIcon className="w-10 h-10 text-primary-500" />
              <span className="text-2xl font-bold text-gradient">
                AuctionHub
              </span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-dark-100">Welcome Back</h2>
            <p className="text-dark-400">Sign in to your account to continue</p>
          </div>

          <Card variant="glass" className="backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-center justify-center">
                <UserIcon className="text-primary-500" />
                Sign In
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl backdrop-blur-sm">
                    {errors.general}
                  </div>
                )}

                <Input
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={errors.email}
                  variant="glass"
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  }
                />

                <Input
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  error={errors.password}
                  variant="glass"
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  }
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) =>
                        handleInputChange("rememberMe", e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 border-surface-500 flex items-center justify-center transition-all ${
                        formData.rememberMe
                          ? "bg-primary-600 border-primary-600"
                          : "hover:border-primary-500"
                      }`}
                    >
                      {formData.rememberMe && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-dark-300 group-hover:text-dark-100 transition-colors">
                      Remember me
                    </span>
                  </label>

                  <Link
                    to="."
                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  isLoading={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <p className="text-dark-400">
              New to AuctionHub?{" "}
              <Link
                to="/auth/register"
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Create an account
              </Link>
            </p>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-surface-600"></div>
              <span className="text-dark-500 text-sm">or</span>
              <div className="flex-1 h-px bg-surface-600"></div>
            </div>

            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <HammerIcon size="sm" />
                Browse Auctions as Guest
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
