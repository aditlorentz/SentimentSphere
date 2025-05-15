import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import brainSvg from "../assets/brain-neural.svg";
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

// Testimonials for the slideshow
const testimonials = [
  {
    quote: "The NLP capabilities have transformed how we process and understand customer feedback. The accuracy and speed of analysis have improved our response time significantly.",
    author: "Dr. Sarah Chen",
    title: "AI Research Lead"
  },
  {
    quote: "Implementing this NLP platform helped us identify customer sentiment trends that would have otherwise gone unnoticed. It's been a game changer for our product development.",
    author: "Michael Rodriguez",
    title: "Product Manager"
  },
  {
    quote: "The insights derived from the sentiment analysis have directly contributed to a 24% increase in customer satisfaction scores over the last quarter.",
    author: "Jennifer Wilson",
    title: "Customer Experience Director"
  }
];

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

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
            <img 
              src={brainSvg}
              alt="Brain with neural connections"
              className="w-full h-auto object-contain mb-12"
            />
            
            <div className="relative">
              <div className="text-5xl text-indigo-200 absolute top-0 left-0 transform -translate-x-6 -translate-y-8">
                "
              </div>
              
              <div className="min-h-[180px] transition-opacity duration-500">
                <p className="text-gray-700 text-lg mb-4">
                  {testimonials[currentTestimonial].quote}
                </p>
                <div className="text-right">
                  <p className="font-semibold">{testimonials[currentTestimonial].author}</p>
                  <p className="text-gray-500 text-sm">{testimonials[currentTestimonial].title}</p>
                </div>
              </div>
              
              <div className="text-5xl text-indigo-200 absolute bottom-0 right-0 transform translate-x-2 translate-y-4">
                "
              </div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, i) => (
                <button 
                  key={i} 
                  className={`h-2 w-2 rounded-full transition-colors ${i === currentTestimonial ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  onClick={() => setCurrentTestimonial(i)}
                />
              ))}
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
