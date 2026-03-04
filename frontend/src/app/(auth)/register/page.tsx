
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ImagePlus, Lock, Mail, Upload, User, UserPlus } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { AuthError } from "@/lib/auth/auth";
import { fetchOAuthProviders, getOAuthAuthorizationUrl } from "@/lib/auth/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const DEFAULT_RETURN_URL = "/";

function resolveReturnUrl(rawReturnUrl: string | null): string {
  if (!rawReturnUrl) return DEFAULT_RETURN_URL;
  try {
    const decoded = decodeURIComponent(rawReturnUrl);
    return decoded.startsWith("/") ? decoded : DEFAULT_RETURN_URL;
  } catch {
    return DEFAULT_RETURN_URL;
  }
}

function resolvePostAuthRedirect(roles?: string[]): string {
  return roles?.includes("ADMIN") ? "/dashboard" : "/";
}

const formSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters." })
      .max(30, { message: "Username must be 30 characters or fewer." })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Only letters, numbers, and underscore are allowed.",
      }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z
      .string()
      .min(8, { message: "Confirm password must be at least 8 characters." }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { register, loading, user, initialized } = useAuth();
  const returnUrl = resolveReturnUrl(searchParams.get("returnUrl"));
  const [photo, setPhoto] = useState<File | undefined>();
  const [oauthProviders, setOauthProviders] = useState<string[]>([]);
  const [isOauthLoading, setIsOauthLoading] = useState(true);
  const [activeOauthProvider, setActiveOauthProvider] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (initialized && user) {
      router.replace(resolvePostAuthRedirect(user.roles));
    }
  }, [initialized, user, router]);

  useEffect(() => {
    let isMounted = true;

    async function loadProviders() {
      try {
        const providers = await fetchOAuthProviders();
        if (isMounted) {
          setOauthProviders(providers);
        }
      } catch {
        if (isMounted) {
          setOauthProviders([]);
        }
      } finally {
        if (isMounted) {
          setIsOauthLoading(false);
        }
      }
    }

    loadProviders();
    return () => {
      isMounted = false;
    };
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await register(
        {
          username: values.username,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
        },
        photo
      );
      toast.success("Account created successfully.", {
        description: "You can now sign in to continue.",
      });
      const loginUrl = `/login?registered=true&returnUrl=${encodeURIComponent(returnUrl)}`;
      router.push(loginUrl);
    } catch (error) {
      const message = error instanceof AuthError ? error.message : "Registration failed";
      toast.error("Unable to create account", { description: message });
    }
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPhoto(undefined);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      event.target.value = "";
      setPhoto(undefined);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      event.target.value = "";
      setPhoto(undefined);
      return;
    }

    setPhoto(file);
  }

  async function onOAuthSignIn(provider: string) {
    try {
      setActiveOauthProvider(provider);
      localStorage.setItem("oauthReturnUrl", returnUrl);
      const authUrl = await getOAuthAuthorizationUrl(provider);
      window.location.assign(authUrl);
    } catch {
      setActiveOauthProvider(null);
      localStorage.removeItem("oauthReturnUrl");
      toast.error("OAuth sign-up failed", {
        description: "Unable to start OAuth flow. Please try again.",
      });
    }
  }

  return (
    <Card className="w-full max-w-md border-border/70 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md">
          <UserPlus className="h-6 w-6" />
        </div>
        <CardTitle className="mt-4 text-2xl">Create account</CardTitle>
        <CardDescription>
          Join ADUTI Learning and start your learning journey.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="your_username" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="email" placeholder="you@example.com" className="pl-10" {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="At least 8 characters" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="Re-enter your password" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-muted-foreground" />
                Profile picture (optional)
              </FormLabel>
              <FormControl>
                <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="file"
                    accept="image/*"
                    className="cursor-pointer border-0 p-0 shadow-none file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-xs file:font-medium file:text-primary"
                    onChange={handlePhotoChange}
                  />
                </div>
              </FormControl>
              {photo ? (
                <p className="text-xs text-muted-foreground">{photo.name}</p>
              ) : null}
            </FormItem>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:brightness-110"
              disabled={form.formState.isSubmitting || loading || activeOauthProvider !== null}
            >
              {form.formState.isSubmitting || loading ? "Creating account..." : "Create account"}
            </Button>

            {oauthProviders.length > 0 && (
              <>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or continue with</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {oauthProviders.map((provider) => (
                    <Button
                      key={provider}
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isOauthLoading || activeOauthProvider !== null || form.formState.isSubmitting || loading}
                      onClick={() => onOAuthSignIn(provider)}
                    >
                      {activeOauthProvider === provider
                        ? "Redirecting..."
                        : `Continue with ${provider.charAt(0).toUpperCase()}${provider.slice(1)}`}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
