
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useSearchParams } from "react-router-dom";
import { Activity, ArrowLeft, Star, Eye, EyeOff } from "lucide-react";
import { useAuthFlow } from "@/hooks/useAuthFlow";

export const LoginForm: React.FC = () => {
  const {
    email, setEmail, password, setPassword,
    loading, error, handleSignIn, handleSignUp, handleForgotPassword,
    handleNewPassword, showForgotPassword, setShowForgotPassword,
    isPasswordReset
  } = useAuthFlow();

  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");

  const isPasswordSetup = searchParams.get('setup-password') === 'true';
  const orgSlug = searchParams.get('org');
  const invitedEmail = searchParams.get('email');

  // Set email from URL params for password setup
  useEffect(() => {
    if (isPasswordSetup && invitedEmail) {
      setEmail(decodeURIComponent(invitedEmail));
    }
  }, [isPasswordSetup, invitedEmail, setEmail]);

  const handleNewPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setNewPasswordError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setNewPasswordError("Password must be at least 6 characters");
      return;
    }

    setNewPasswordError("");
    handleNewPassword(newPassword);
  };

  // Password setup form for invited users
  if (isPasswordSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunset-50 via-coral-50 to-golden-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-lg">
            <CardHeader className="text-center">
              <div className="mx-auto bg-sunset-100 w-16 h-16 rounded-full flex items-center justify-center text-sunset-500 mb-4 shadow-md">
                <Activity className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-space font-extrabold text-warm-gray-900">Set Your Password</CardTitle>
              <p className="text-warm-gray-500 font-medium">Complete your invitation to join the organization</p>
              {orgSlug && (
                <p className="text-sm text-sunset-600 font-medium">Organization: {orgSlug}</p>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNewPasswordSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="invited-email" className="font-medium text-warm-gray-700">Email</Label>
                  <Input
                    id="invited-email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-gray-50 border-warm-gray-200 text-base cursor-not-allowed"
                  />
                </div>
                <div className="relative">
                  <Label htmlFor="new-password" className="font-medium text-warm-gray-700">Create Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      placeholder="Create your password"
                      className="bg-white border-warm-gray-200 focus:border-sunset-400 focus:ring-sunset-300 text-base pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-warm-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-warm-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-warm-gray-500 mt-1">
                    Password must be at least 6 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="confirm-password" className="font-medium text-warm-gray-700">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                    className="bg-white border-warm-gray-200 focus:border-sunset-400 focus:ring-sunset-300 text-base"
                  />
                </div>
                {newPasswordError && (
                  <Alert className="bg-red-50 border border-red-200">
                    <AlertDescription className="text-red-700">{newPasswordError}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-sunset-500 to-coral-500 hover:from-sunset-600 hover:to-coral-600 text-white text-base font-bold rounded-full shadow-lg shadow-sunset-500/20"
                  disabled={loading}
                >
                  {loading ? "Setting up..." : "Complete Setup"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Password reset form
  if (isPasswordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunset-50 via-coral-50 to-golden-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="w-full max-w-md">
          <Link to="/auth" className="inline-flex items-center text-sunset-500 hover:text-sunset-600 mb-8 transition-colors font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-lg">
            <CardHeader className="text-center">
              <div className="mx-auto bg-sunset-100 w-16 h-16 rounded-full flex items-center justify-center text-sunset-500 mb-4 shadow-md">
                <Activity className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-space font-extrabold text-warm-gray-900">Set New Password</CardTitle>
              <p className="text-warm-gray-500 font-medium">Enter your new password below</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNewPasswordSubmit} className="space-y-5">
                <div className="relative">
                  <Label htmlFor="new-password" className="font-medium text-warm-gray-700">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter new password"
                      className="bg-white border-warm-gray-200 focus:border-sunset-400 focus:ring-sunset-300 text-base pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-warm-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-warm-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm-password" className="font-medium text-warm-gray-700">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
                    className="bg-white border-warm-gray-200 focus:border-sunset-400 focus:ring-sunset-300 text-base"
                  />
                </div>
                {newPasswordError && (
                  <Alert className="bg-red-50 border border-red-200">
                    <AlertDescription className="text-red-700">{newPasswordError}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-sunset-500 to-coral-500 hover:from-sunset-600 hover:to-coral-600 text-white text-base font-bold rounded-full shadow-lg shadow-sunset-500/20"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Forgot password form
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunset-50 via-coral-50 to-golden-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="w-full max-w-md">
          <button 
            onClick={() => setShowForgotPassword(false)}
            className="inline-flex items-center text-sunset-500 hover:text-sunset-600 mb-8 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </button>
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-lg">
            <CardHeader className="text-center">
              <div className="mx-auto bg-sunset-100 w-16 h-16 rounded-full flex items-center justify-center text-sunset-500 mb-4 shadow-md">
                <Activity className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-space font-extrabold text-warm-gray-900">Reset Password</CardTitle>
              <p className="text-warm-gray-500 font-medium">Enter your email to receive reset instructions</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <Label htmlFor="reset-email" className="font-medium text-warm-gray-700">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="your-email@company.com"
                    className="bg-white border-warm-gray-200 focus:border-sunset-400 focus:ring-sunset-300 text-base"
                  />
                </div>
                {error && (
                  <Alert className="bg-red-50 border border-red-200">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-sunset-500 to-coral-500 hover:from-sunset-600 hover:to-coral-600 text-white text-base font-bold rounded-full shadow-lg shadow-sunset-500/20"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main login/signup form
  return (
    <div className="min-h-screen bg-gradient-to-br from-sunset-50 via-coral-50 to-golden-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-sunset-500 hover:text-sunset-600 mb-8 transition-colors font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-sunset-100 w-16 h-16 rounded-full flex items-center justify-center text-sunset-500 mb-4 shadow-md">
              <Activity className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-space font-extrabold text-warm-gray-900">Welcome to Pulsify</CardTitle>
            <p className="text-warm-gray-500 font-medium">Sign in to your organization account</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-warm-gray-100/80 border border-warm-gray-200 rounded-lg shadow-sm">
                <TabsTrigger value="signin" className="font-semibold text-warm-gray-700">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="font-semibold text-warm-gray-700">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div>
                    <Label htmlFor="email" className="font-medium text-warm-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="your-email@company.com"
                      className="bg-white border-warm-gray-200 focus:border-sunset-400 focus:ring-sunset-300 text-base"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="font-medium text-warm-gray-700">Password</Label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-sunset-500 hover:text-sunset-600 font-medium transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        className="bg-white border-warm-gray-200 focus:border-sunset-400 focus:ring-sunset-300 text-base pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-warm-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-warm-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <Alert className="bg-red-50 border border-red-200">
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-sunset-500 to-coral-500 hover:from-sunset-600 hover:to-coral-600 text-white text-base font-bold rounded-full shadow-lg shadow-sunset-500/20"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div>
                    <Label htmlFor="signup-email" className="font-medium text-warm-gray-700">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="your-email@company.com"
                      className="bg-white border-warm-gray-200 focus:border-sunset-400 focus:ring-sunset-300 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password" className="font-medium text-warm-gray-700">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="Create a password"
                        className="bg-white border-warm-gray-200 focus:border-sunset-400 focus:ring-sunset-300 text-base pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-warm-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-warm-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-warm-gray-500 mt-1">
                      Password must be at least 6 characters
                    </p>
                  </div>
                  {error && (
                    <Alert className="bg-red-50 border border-red-200">
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-sunset-500 to-coral-500 hover:from-sunset-600 hover:to-coral-600 text-white text-base font-bold rounded-full shadow-lg shadow-sunset-500/20"
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                  <div className="text-xs text-center text-warm-gray-400 mt-3">
                    After verifying your email, your organization will be created in the next step.
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <div className="mt-8 text-center">
          <span className="text-xs flex items-center justify-center gap-2 text-warm-gray-400">
            <Star className="w-3 h-3 text-sunset-500" />
            Real Insights. Real Impact.
          </span>
        </div>
      </div>
    </div>
  );
};
