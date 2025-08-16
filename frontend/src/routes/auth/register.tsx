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
import { useRegister } from "../../hooks/api";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer", // buyer, seller
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await registerMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      // Navigate to home page on successful registration
      navigate({ to: "/" });
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ general: "Registration failed. Please try again." });
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
                Join the Elite
                <br />
                <span className="text-purple-200">Auction Community</span>
              </h1>

              <p className="text-xl text-purple-100 leading-relaxed">
                Create your account and start bidding on exclusive premium items
                or become a seller in our prestigious marketplace.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-8">
              <div className="flex items-center gap-4 text-white/90">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <div className="font-semibold">Quick Setup</div>
                  <div className="text-purple-200 text-sm">
                    Get started in minutes
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-white/90">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💎</span>
                </div>
                <div>
                  <div className="font-semibold">Premium Access</div>
                  <div className="text-purple-200 text-sm">
                    Exclusive auction items
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-white/90">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌟</span>
                </div>
                <div>
                  <div className="font-semibold">Trusted Community</div>
                  <div className="text-purple-200 text-sm">
                    Join thousands of users
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
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
            <h2 className="text-3xl font-bold text-dark-100">Create Account</h2>
            <p className="text-dark-400">Join our premium auction community</p>
          </div>

          <Card variant="glass" className="backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-center justify-center">
                <UserIcon className="text-primary-500" />
                Sign Up
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
                  label="Full Name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  error={errors.name}
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                />

                <Input
                  label="Email Address"
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
                  autoComplete="new-password"
                  placeholder="Create a strong password"
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

                <Input
                  label="Confirm Password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  error={errors.confirmPassword}
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  }
                />

                {/* Role Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-dark-300">
                    I want to:
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    <label className="flex items-center gap-3 p-4 border border-surface-600 rounded-xl hover:border-primary-500/50 cursor-pointer transition-all group bg-surface-800/30 backdrop-blur-sm">
                      <input
                        type="radio"
                        name="role"
                        value="buyer"
                        checked={formData.role === "buyer"}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          formData.role === "buyer"
                            ? "bg-primary-600 border-primary-600"
                            : "border-surface-500 group-hover:border-primary-500"
                        }`}
                      >
                        {formData.role === "buyer" && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-dark-100 flex items-center gap-2">
                          <span className="text-lg">🛒</span>
                          Buy Items (Bidder)
                        </div>
                        <div className="text-sm text-dark-400">
                          Participate in auctions and place bids
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border border-surface-600 rounded-xl hover:border-primary-500/50 cursor-pointer transition-all group bg-surface-800/30 backdrop-blur-sm">
                      <input
                        type="radio"
                        name="role"
                        value="seller"
                        checked={formData.role === "seller"}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          formData.role === "seller"
                            ? "bg-primary-600 border-primary-600"
                            : "border-surface-500 group-hover:border-primary-500"
                        }`}
                      >
                        {formData.role === "seller" && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-dark-100 flex items-center gap-2">
                          <span className="text-lg">⚡</span>
                          Sell Items (Auctioneer)
                        </div>
                        <div className="text-sm text-dark-400">
                          Create auctions and sell your items
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  isLoading={registerMutation.isPending}
                >
                  {registerMutation.isPending
                    ? "Creating account..."
                    : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <p className="text-dark-400">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Sign in
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
