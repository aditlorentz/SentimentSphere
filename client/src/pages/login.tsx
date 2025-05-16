import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import nlpLogo from "../assets/logo-nlp.webp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    // Debug info
    console.log("Login attempt with:", values.username, values.password);
    
    try {
      // Hardcoded login for testing
      if (values.username === "admin@nlp" && values.password === "12345") {
        console.log("Credentials match - setting up local auth");
        // Store user directly in localStorage for testing
        const userData = {
          username: values.username,
          role: "admin"
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setLocation("/survey-dashboard");
        return;
      }
      
      // Regular login flow
      const success = await login(values.username, values.password);
      console.log("Login result:", success);
      
      if (success) {
        setLocation("/survey-dashboard");
      } else {
        setErrorMessage("Invalid credentials. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left section with Brain image and testimonial */}
      <div className="md:w-1/2 bg-white p-6 flex flex-col">
        <div className="flex items-center space-x-2 mb-8">
          <img 
            src={nlpLogo} 
            alt="NLP Logo" 
            className="h-12"
          />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-lg">
            {/* NLP Technology Highlight */}
            <div className="mb-12 p-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl text-center">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Powered by Advanced NLP Technology
              </h3>
              <p className="text-gray-600">
                Our sentiment analysis platform uses state-of-the-art natural language processing to transform complex text data into actionable insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right section with login form */}
      <div className="md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-display font-bold mb-2 text-black tracking-tight">Login</h2>
          <p className="text-gray-600 mb-8">Enter your credentials to login</p>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {errorMessage}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          placeholder="Username"
                          className="pl-10 py-6 rounded-lg border-gray-200"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="pl-10 py-6 rounded-lg border-gray-200"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium text-white"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>

          <p className="text-sm text-center text-gray-500 mt-6">
            By clicking continue, you agree to our{" "}
            <a href="#" className="text-indigo-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-indigo-600 hover:underline">
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
