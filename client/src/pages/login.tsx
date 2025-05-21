import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import nlpLogo from "../assets/logo-nlp.webp";
import haraldImage from "../assets/harald-arlander-aIvQqbJ9yF0-unsplash.jpg";
import markusImage from "../assets/markus-spiske-Skf7HxARcoc-unsplash.jpg";
import shubhamDhageImage from "../assets/shubham-dhage-T9rKvI3N0NM-unsplash.jpg";
import shubhamSharanImage from "../assets/shubham-sharan-OC8VNwyE47I-unsplash.jpg";
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

// AI/NLP images for the slideshow
const aiImages = [
  {
    src: haraldImage,
    alt: "NLP Text Analysis",
    quote: "Analisis Sentimen: Mengubah teks feedback karyawan menjadi insight yang bermakna"
  },
  {
    src: markusImage,
    alt: "AI Programming",
    quote: "Dashboard Interaktif: Visualisasi data dengan peta heatmap dan wordcloud"
  },
  {
    src: shubhamDhageImage,
    alt: "Neural Network",
    quote: "Smart Analytics: Deteksi tren sentimen dan identifikasi area peningkatan"
  },
  {
    src: shubhamSharanImage,
    alt: "Data Visualization",
    quote: "AI Chatbot: Rekomendasi cepat dengan teknologi Gemini 2.0 Flash"
  }
];

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  
  // Auto-rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % aiImages.length);
    }, 5000); // Change image every 5 seconds
    
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
            {/* AI/NLP Image Slideshow */}
            <div className="relative rounded-xl overflow-hidden shadow-xl mb-8 aspect-video bg-gray-100">
              <img 
                src={aiImages[currentImage].src}
                alt={aiImages[currentImage].alt}
                className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
              />
              
              {/* Quote Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="text-white font-medium">
                  {aiImages[currentImage].quote}
                </p>
              </div>
            </div>
            
            {/* Image Slider Dots */}
            <div className="flex justify-center mb-8 space-x-2">
              {aiImages.map((_, i) => (
                <button 
                  key={i} 
                  className={`h-2 w-2 rounded-full transition-colors ${i === currentImage ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  onClick={() => setCurrentImage(i)}
                  aria-label={`View ${aiImages[i].alt}`}
                />
              ))}
            </div>
            
            {/* NLP Technology Highlight */}
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Powered by Advanced NLP Technology
              </h3>
              <p className="text-gray-600 text-sm">
                Transform complex feedback data into actionable organizational insights with our cutting-edge sentiment analysis platform.
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
