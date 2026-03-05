"use client";

import { useEffect, useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Camera, User, Mail, Phone, MapPin, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getMe } from "@/lib/auth";

const profileFormSchema = z.object({
	username: z
		.string()
		.min(3, { message: "Username must be at least 3 characters." })
		.max(50, { message: "Username must not exceed 50 characters." })
		.regex(/^[a-zA-Z0-9_]+$/, {
			message: "Username can only contain letters, numbers, and underscores.",
		}),
	phoneNumber: z
		.string()
		.max(32, { message: "Phone number must not exceed 32 characters." })
		.default(""),
	address: z
		.string()
		.max(255, { message: "Address must not exceed 255 characters." })
		.default(""),
	bio: z
		.string()
		.max(500, { message: "Bio must not exceed 500 characters." })
		.default(""),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsAccountPage() {
	const { user, initialized, updateProfile: updateAuthProfile } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(true);
	const [profilePicture, setProfilePicture] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const form = useForm<ProfileFormValues, any, ProfileFormValues>({
		resolver: zodResolver(profileFormSchema) as unknown as Resolver<ProfileFormValues>,
		defaultValues: {
			username: "",
			phoneNumber: "",
			address: "",
			bio: "",
		},
	});

	// Fetch current user profile on mount
	useEffect(() => {
		if (!initialized) {
			setIsFetching(false);
			return;
		}

		async function fetchProfile() {
			try {
				setIsFetching(true);
				const profile = await getMe();
				form.reset({
					username: profile.username || "",
					phoneNumber: profile.phoneNumber || "",
					address: profile.address || "",
					bio: profile.bio || "",
				});
			} catch (error) {
				console.error("Failed to fetch profile:", error);
				toast.error("Failed to load profile data");
			} finally {
				setIsFetching(false);
			}
		}

		fetchProfile();
	}, [initialized, form]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Image size must be less than 5MB");
				return;
			}
			if (!file.type.startsWith("image/")) {
				toast.error("Please select an image file");
				return;
			}
			setProfilePicture(file);
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
		}
	};

	const handleImageClick = () => {
		fileInputRef.current?.click();
	};

	async function onSubmit(data: ProfileFormValues) {
		try {
			setIsLoading(true);
			await updateAuthProfile(
				{
					username: data.username,
					phoneNumber: data.phoneNumber || undefined,
					address: data.address || undefined,
					bio: data.bio || undefined,
				},
				profilePicture || undefined
			);

			toast.success("Profile updated successfully");
			setProfilePicture(null);
		} catch (error) {
			console.error("Failed to update profile:", error);
			toast.error(error instanceof Error ? error.message : "Failed to update profile");
		} finally {
			setIsLoading(false);
		}
	}

	if (isFetching) {
		return (
			<div className="flex h-[400px] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Account</h3>
				<p className="text-sm text-muted-foreground">
					Manage your account settings and profile information.
				</p>
			</div>
			<Separator />

			{/* Profile Picture Section */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Profile Picture</CardTitle>
					<CardDescription>
						Click on the avatar to upload a new profile picture.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-6">
						<div className="relative group cursor-pointer" onClick={handleImageClick}>
							<Avatar className="h-24 w-24">
								<AvatarImage
									src={previewUrl || user?.profilePicture || undefined}
									alt={user?.username || "Profile"}
								/>
								<AvatarFallback className="text-2xl">
									{user?.username?.charAt(0).toUpperCase() || <User className="h-8 w-8" />}
								</AvatarFallback>
							</Avatar>
							<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
								<Camera className="h-6 w-6 text-white" />
							</div>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleImageChange}
								className="hidden"
							/>
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium">{user?.username}</p>
							<p className="text-sm text-muted-foreground">{user?.email}</p>
							{profilePicture && (
								<p className="text-xs text-green-600">
									New image selected: {profilePicture.name}
								</p>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Profile Form */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Profile Information</CardTitle>
					<CardDescription>
						Update your profile details. Your email cannot be changed.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{/* Email (Read-only) */}
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<label className="text-sm font-medium">Email</label>
								</div>
								<Input
									value={user?.email || ""}
									disabled
									className="bg-muted"
								/>
								<p className="text-xs text-muted-foreground">
									Email address cannot be changed.
								</p>
							</div>

							{/* Username */}
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2">
											<User className="h-4 w-4 text-muted-foreground" />
											Username
										</FormLabel>
										<FormControl>
											<Input placeholder="johndoe" {...field} />
										</FormControl>
										<FormDescription>
											This is your public display name.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Phone Number */}
							<FormField
								control={form.control}
								name="phoneNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2">
											<Phone className="h-4 w-4 text-muted-foreground" />
											Phone Number
										</FormLabel>
										<FormControl>
											<Input placeholder="+1 (555) 000-0000" {...field} />
										</FormControl>
										<FormDescription>
											Your phone number for account recovery.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Address */}
							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2">
											<MapPin className="h-4 w-4 text-muted-foreground" />
											Address
										</FormLabel>
										<FormControl>
											<Input placeholder="123 Main St, City, Country" {...field} />
										</FormControl>
										<FormDescription>
											Your location (optional).
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Bio */}
							<FormField
								control={form.control}
								name="bio"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2">
											<FileText className="h-4 w-4 text-muted-foreground" />
											Bio
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Tell us a little about yourself..."
												className="resize-none"
												rows={4}
												{...field}
											/>
										</FormControl>
										<FormDescription>
											A brief description about yourself. Max 500 characters.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-end">
								<Button type="submit" disabled={isLoading}>
									{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Save Changes
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
