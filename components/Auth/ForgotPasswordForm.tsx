import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Email is required");
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement forgot password API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setEmailSent(true);
      toast.success("Password reset email sent!");
    } catch (error) {
      toast.error("Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Check your email
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={onBack}
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Forgot your password?
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <Button
        variant="outline"
        onClick={onBack}
        className="w-full"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to sign in
      </Button>
    </div>
  );
}
