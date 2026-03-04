"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const DEFAULT_RETURN_URL = "/";

function resolveReturnUrl(rawReturnUrl: string | null, storedReturnUrl: string | null): string {
	const candidate = rawReturnUrl ?? storedReturnUrl;
	if (!candidate) {
		return DEFAULT_RETURN_URL;
	}

	try {
		const decoded = decodeURIComponent(candidate);
		return decoded.startsWith("/") ? decoded : DEFAULT_RETURN_URL;
	} catch {
		return DEFAULT_RETURN_URL;
	}
}

function resolvePostLoginRedirect(roles: string[] | undefined, returnUrl: string): string {
	if (roles?.includes("ADMIN")) {
		return "/dashboard";
	}

	if (returnUrl.startsWith("/dashboard")) {
		return "/";
	}

	return returnUrl || "/";
}

export default function OAuthRedirectPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { syncSession } = useAuth();
	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
	const [errorMessage, setErrorMessage] = useState<string>("");

	useEffect(() => {
		let isMounted = true;

		async function completeOAuthLogin() {
			const error = searchParams.get("error");
			const storedReturnUrl = localStorage.getItem("oauthReturnUrl");
			const returnUrl = resolveReturnUrl(searchParams.get("returnUrl"), storedReturnUrl);
			const loginUrl = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;

			// Check for error from backend
			if (error) {
				if (isMounted) {
					setStatus("error");
					setErrorMessage(decodeURIComponent(error));
				}
				localStorage.removeItem("oauthReturnUrl");
				toast.error("OAuth login failed", { description: decodeURIComponent(error) });
				setTimeout(() => router.replace(loginUrl), 3000);
				return;
			}

			try {
				const profile = await syncSession();
				if (!isMounted) {
					return;
				}

				if (!profile) {
					throw new Error("Unable to complete OAuth session.");
				}

				localStorage.removeItem("oauthReturnUrl");

				if (isMounted) {
					setStatus("success");
				}

				toast.success("OAuth login successful", {
					description: `Welcome back, ${profile.username}!`,
				});

				const targetUrl = resolvePostLoginRedirect(profile.roles, returnUrl);
				// Short delay to show success state
				setTimeout(() => router.replace(targetUrl), 1000);
			} catch (err) {
				console.error("OAuth session sync error:", err);
				if (!isMounted) {
					return;
				}

				setStatus("error");
				const message = err instanceof Error ? err.message : "Failed to fetch user profile";
				setErrorMessage(message);

				localStorage.removeItem("oauthReturnUrl");

				toast.error("Unable to complete OAuth login", { description: message });
				setTimeout(() => router.replace(loginUrl), 3000);
			}
		}

		completeOAuthLogin();
		return () => {
			isMounted = false;
		};
	}, [router, searchParams, syncSession]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					{status === "loading" && (
						<>
							<Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
							<CardTitle className="mt-4">Finishing sign in</CardTitle>
							<CardDescription>
								Completing your OAuth login...
							</CardDescription>
						</>
					)}
					{status === "success" && (
						<>
							<CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
							<CardTitle className="mt-4 text-green-600">Success!</CardTitle>
							<CardDescription>
								Redirecting you to your account...
							</CardDescription>
						</>
					)}
					{status === "error" && (
						<>
							<XCircle className="mx-auto h-12 w-12 text-red-500" />
							<CardTitle className="mt-4 text-red-600">Login Failed</CardTitle>
							<CardDescription>
								{errorMessage || "Unable to complete OAuth login"}
							</CardDescription>
						</>
					)}
				</CardHeader>
				<CardContent className="text-center text-sm text-muted-foreground">
					{status === "loading" && "Please wait..."}
					{status === "error" && "Redirecting to login page..."}
				</CardContent>
			</Card>
		</div>
	);
}
