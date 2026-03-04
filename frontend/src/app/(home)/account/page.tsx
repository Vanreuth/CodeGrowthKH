"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import {
	User,
	Mail,
	Phone,
	MapPin,
	FileText,
	Camera,
	Shield,
	KeyRound,
	LogOut,
	Settings,
	BookOpen,
	Award,
	Clock,
	ChevronRight,
	Sparkles,
	Edit3,
	Save,
	X,
	Loader2,
	GraduationCap,
	Target,
	TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useAuth } from "@/context/AuthContext";
import { AuthError } from "@/lib/auth/auth";

const profileFormSchema = z.object({
	username: z
		.string()
		.min(3, { message: "ឈ្មោះអ្នកប្រើត្រូវមានយ៉ាងតិច 3 តួអក្សរ" })
		.max(50, { message: "ឈ្មោះអ្នកប្រើមិនអាចលើសពី 50 តួអក្សរ" })
		.regex(/^[a-zA-Z0-9_]+$/, {
			message: "ឈ្មោះអ្នកប្រើអាចមានតែអក្សរ លេខ និង underscore",
		}),
	phoneNumber: z.string(),
	address: z.string().max(255),
	bio: z.string().max(500),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Mock stats - replace with real data from API
const userStats = {
	coursesEnrolled: 5,
	coursesCompleted: 2,
	lessonsCompleted: 47,
	totalHours: 28,
	streak: 7,
	certificates: 2,
};

const recentActivity = [
	{ id: 1, type: "lesson", title: "Introduction to React Hooks", course: "React Fundamentals", time: "2 hours ago" },
	{ id: 2, type: "course", title: "Started TypeScript Basics", course: "TypeScript Mastery", time: "1 day ago" },
	{ id: 3, type: "achievement", title: "Completed 50 Lessons", course: "", time: "3 days ago" },
	{ id: 4, type: "lesson", title: "State Management with Redux", course: "React Advanced", time: "5 days ago" },
];

export default function AccountPage() {
	const router = useRouter();
	const { user, initialized, updateProfile, logout } = useAuth();

	const [isLoading, setIsLoading] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [profilePicture, setProfilePicture] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const clearPreview = () => {
		setPreviewUrl((prev) => {
			if (prev) {
				URL.revokeObjectURL(prev);
			}
			return null;
		});
	};

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: {
			username: "",
			phoneNumber: "",
			address: "",
			bio: "",
		},
	});

	const isFetching = !initialized;

	// Redirect if not authenticated once auth state is initialized
	useEffect(() => {
		if (initialized && !user) {
			router.replace("/login?returnUrl=/account");
		}
	}, [initialized, user, router]);

	// Sync form with context user data
	useEffect(() => {
		if (!user) {
			return;
		}

		form.reset({
			username: user.username || "",
			phoneNumber: user.phoneNumber || "",
			address: user.address || "",
			bio: user.bio || "",
		});
	}, [user, form]);

	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				toast.error("រូបភាពត្រូវតែតូចជាង 5MB");
				return;
			}
			if (!file.type.startsWith("image/")) {
				toast.error("សូមជ្រើសរើសឯកសាររូបភាព");
				return;
			}
			setProfilePicture(file);
			setPreviewUrl((prev) => {
				if (prev) {
					URL.revokeObjectURL(prev);
				}
				return URL.createObjectURL(file);
			});
		}
	};

	const handleImageClick = () => {
		if (isEditing) {
			fileInputRef.current?.click();
		}
	};

	async function onSubmit(data: ProfileFormValues) {
		try {
			setIsLoading(true);
			await updateProfile(
				{
					username: data.username,
					phoneNumber: data.phoneNumber || undefined,
					address: data.address || undefined,
					bio: data.bio || undefined,
				},
				profilePicture || undefined
			);

			toast.success("ព័ត៌មានគណនីបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ");
			setIsEditing(false);
			setProfilePicture(null);
			clearPreview();
		} catch (error) {
			console.error("Failed to update profile:", error);
			const message =
				error instanceof AuthError
					? error.message
					: error instanceof Error
						? error.message
						: "បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពព័ត៌មាន";
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	}

	const handleLogout = async () => {
		try {
			await logout();
			toast.success("បានចេញពីគណនីដោយជោគជ័យ");
			router.push("/");
		} catch (error) {
			console.error("Logout error:", error);
			router.push("/");
		}
	};

	const cancelEdit = () => {
		setIsEditing(false);
		setProfilePicture(null);
		clearPreview();
		form.reset({
			username: user?.username || "",
			phoneNumber: user?.phoneNumber || "",
			address: user?.address || "",
			bio: user?.bio || "",
		});
	};

	if (isFetching) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-12 w-12 animate-spin text-violet-600" />
					<p className="text-sm text-muted-foreground">កំពុងផ្ទុកព័ត៌មានគណនី...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className="space-y-8 py-8">
			{/* Hero Section */}
			<section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-blue-50 p-6 shadow-sm md:p-10 dark:border-white/10 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-800">
				{/* Decorative elements */}
				<div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-violet-400/20 via-blue-400/10 to-transparent blur-3xl" />
				<div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr from-emerald-400/10 to-cyan-400/10 blur-2xl" />

				<div className="relative flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
					{/* Avatar */}
					<div className="relative group">
						<div className={`rounded-full p-1 bg-gradient-to-br from-violet-500 via-blue-500 to-emerald-500 ${isEditing ? 'cursor-pointer' : ''}`} onClick={handleImageClick}>
							<Avatar className="h-28 w-28 border-4 border-white dark:border-slate-900 md:h-36 md:w-36">
								<AvatarImage
									src={previewUrl || user?.profilePicture || undefined}
									alt={user?.username || "Profile"}
								/>
								<AvatarFallback className="bg-gradient-to-br from-violet-100 to-blue-100 text-3xl font-bold text-violet-600 dark:from-violet-900/50 dark:to-blue-900/50 dark:text-violet-300">
									{user?.username?.charAt(0).toUpperCase() || <User className="h-12 w-12" />}
								</AvatarFallback>
							</Avatar>
							{isEditing && (
								<div className="absolute inset-1 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-all">
									<Camera className="h-8 w-8 text-white" />
								</div>
							)}
						</div>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={handleImageChange}
							className="hidden"
						/>
						{profilePicture && (
							<Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white">
								រូបភាពថ្មី
							</Badge>
						)}
					</div>

					{/* User Info */}
					<div className="flex-1 text-center md:text-left">
						<div className="flex flex-col items-center gap-3 md:flex-row md:items-start md:justify-between">
							<div>
								<div className="flex items-center justify-center gap-2 md:justify-start">
									<h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
										{user?.username}
									</h1>
									{user?.roles?.includes("ADMIN") && (
										<Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
											<Shield className="mr-1 h-3 w-3" />
											Admin
										</Badge>
									)}
								</div>
								<p className="mt-1 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 md:justify-start">
									<Mail className="h-4 w-4" />
									{user?.email}
								</p>
								{user?.bio && (
									<p className="mt-3 max-w-lg text-sm text-slate-500 dark:text-slate-400">
										{user.bio}
									</p>
								)}
							</div>

							{/* Action Buttons */}
							<div className="flex gap-2">
								{!isEditing ? (
									<Button
										onClick={() => setIsEditing(true)}
										variant="outline"
										className="gap-2"
									>
										<Edit3 className="h-4 w-4" />
										កែប្រែព័ត៌មាន
									</Button>
								) : (
									<>
										<Button
											onClick={cancelEdit}
											variant="ghost"
											className="gap-2"
										>
											<X className="h-4 w-4" />
											បោះបង់
										</Button>
									</>
								)}
							</div>
						</div>

						{/* Quick Stats */}
						<div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
							<div className="flex items-center gap-3 rounded-xl bg-white/80 p-3 shadow-sm dark:bg-white/5">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
									<BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
								</div>
								<div>
									<p className="text-lg font-bold text-slate-900 dark:text-white">{userStats.coursesEnrolled}</p>
									<p className="text-xs text-slate-500">វគ្គសិក្សា</p>
								</div>
							</div>
							<div className="flex items-center gap-3 rounded-xl bg-white/80 p-3 shadow-sm dark:bg-white/5">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
									<GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
								</div>
								<div>
									<p className="text-lg font-bold text-slate-900 dark:text-white">{userStats.coursesCompleted}</p>
									<p className="text-xs text-slate-500">បានបញ្ចប់</p>
								</div>
							</div>
							<div className="flex items-center gap-3 rounded-xl bg-white/80 p-3 shadow-sm dark:bg-white/5">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
									<Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<p className="text-lg font-bold text-slate-900 dark:text-white">{userStats.totalHours}h</p>
									<p className="text-xs text-slate-500">ម៉ោងសិក្សា</p>
								</div>
							</div>
							<div className="flex items-center gap-3 rounded-xl bg-white/80 p-3 shadow-sm dark:bg-white/5">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
									<Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
								</div>
								<div>
									<p className="text-lg font-bold text-slate-900 dark:text-white">{userStats.certificates}</p>
									<p className="text-xs text-slate-500">វិញ្ញាបនបត្រ</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<Tabs defaultValue="profile" className="space-y-6">
				<TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
					<TabsTrigger value="profile" className="gap-2">
						<User className="h-4 w-4" />
						<span className="hidden sm:inline">ព័ត៌មាន</span>
					</TabsTrigger>
					<TabsTrigger value="activity" className="gap-2">
						<TrendingUp className="h-4 w-4" />
						<span className="hidden sm:inline">សកម្មភាព</span>
					</TabsTrigger>
					<TabsTrigger value="settings" className="gap-2">
						<Settings className="h-4 w-4" />
						<span className="hidden sm:inline">ការកំណត់</span>
					</TabsTrigger>
				</TabsList>

				{/* Profile Tab */}
				<TabsContent value="profile" className="space-y-6">
					<div className="grid gap-6 lg:grid-cols-3">
						{/* Profile Form */}
						<Card className="lg:col-span-2">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="h-5 w-5 text-violet-600" />
									ព័ត៌មានផ្ទាល់ខ្លួន
								</CardTitle>
								<CardDescription>
									គ្រប់គ្រងព័ត៌មានគណនីរបស់អ្នក
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Form {...form}>
									<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
										{/* Email (Read-only) */}
										<div className="space-y-2">
											<div className="flex items-center gap-2 text-sm font-medium">
												<Mail className="h-4 w-4 text-muted-foreground" />
												អ៊ីមែល
											</div>
											<Input
												value={user?.email || ""}
												disabled
												className="bg-slate-50 dark:bg-slate-800/50"
											/>
											<p className="text-xs text-muted-foreground">
												អ៊ីមែលមិនអាចផ្លាស់ប្ដូរបានទេ
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
														ឈ្មោះអ្នកប្រើប្រាស់
													</FormLabel>
													<FormControl>
														<Input
															placeholder="johndoe"
															disabled={!isEditing}
															className={!isEditing ? "bg-slate-50 dark:bg-slate-800/50" : ""}
															{...field}
														/>
													</FormControl>
													<FormDescription>
														នេះជាឈ្មោះបង្ហាញជាសាធារណៈរបស់អ្នក
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
														លេខទូរស័ព្ទ
													</FormLabel>
													<FormControl>
														<Input
															placeholder="+855 12 345 678"
															disabled={!isEditing}
															className={!isEditing ? "bg-slate-50 dark:bg-slate-800/50" : ""}
															{...field}
														/>
													</FormControl>
													<FormDescription>
														លេខទូរស័ព្ទសម្រាប់ទំនាក់ទំនង
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
														អាសយដ្ឋាន
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Phnom Penh, Cambodia"
															disabled={!isEditing}
															className={!isEditing ? "bg-slate-50 dark:bg-slate-800/50" : ""}
															{...field}
														/>
													</FormControl>
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
														អំពីខ្ញុំ
													</FormLabel>
													<FormControl>
														<Textarea
															placeholder="ប្រាប់អំពីខ្លួនអ្នកបន្តិច..."
															className={`resize-none ${!isEditing ? "bg-slate-50 dark:bg-slate-800/50" : ""}`}
															rows={4}
															disabled={!isEditing}
															{...field}
														/>
													</FormControl>
													<FormDescription>
														អតិបរមា 500 តួអក្សរ
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										{isEditing && (
											<div className="flex justify-end pt-4">
												<Button type="submit" disabled={isLoading} className="gap-2">
													{isLoading ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<Save className="h-4 w-4" />
													)}
													រក្សាទុកការផ្លាស់ប្តូរ
												</Button>
											</div>
										)}
									</form>
								</Form>
							</CardContent>
						</Card>

						{/* Learning Progress */}
						<div className="space-y-6">
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-base">
										<Target className="h-5 w-5 text-emerald-600" />
										វឌ្ឍនភាពសិក្សា
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<div className="mb-2 flex justify-between text-sm">
											<span className="text-muted-foreground">មេរៀនបានបញ្ចប់</span>
											<span className="font-medium">{userStats.lessonsCompleted} មេរៀន</span>
										</div>
										<Progress value={65} className="h-2" />
									</div>
									<div>
										<div className="mb-2 flex justify-between text-sm">
											<span className="text-muted-foreground">វគ្គសិក្សាបានបញ្ចប់</span>
											<span className="font-medium">{userStats.coursesCompleted}/{userStats.coursesEnrolled}</span>
										</div>
										<Progress value={40} className="h-2" />
									</div>
									<Separator />
									<div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 p-3 dark:from-orange-950/20 dark:to-amber-950/20">
										<div className="flex items-center gap-2">
											<span className="text-2xl">🔥</span>
											<div>
												<p className="text-sm font-medium">Streak បច្ចុប្បន្ន</p>
												<p className="text-xs text-muted-foreground">រៀនជារៀងរាល់ថ្ងៃ</p>
											</div>
										</div>
										<span className="text-2xl font-bold text-orange-600">{userStats.streak}</span>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-base">
										<Award className="h-5 w-5 text-amber-600" />
										សមិទ្ធិផល
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-3 gap-2">
										{[
											{ icon: "🏆", label: "First Course", unlocked: true },
											{ icon: "🎯", label: "10 Lessons", unlocked: true },
											{ icon: "⭐", label: "50 Lessons", unlocked: true },
											{ icon: "🔥", label: "7-Day Streak", unlocked: true },
											{ icon: "💎", label: "Expert", unlocked: false },
											{ icon: "👑", label: "Master", unlocked: false },
										].map((achievement, i) => (
											<div
												key={i}
												className={`flex flex-col items-center gap-1 rounded-lg p-2 ${
													achievement.unlocked
														? "bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
														: "bg-slate-100 opacity-50 dark:bg-slate-800"
												}`}
											>
												<span className="text-2xl">{achievement.icon}</span>
												<span className="text-[10px] text-center text-muted-foreground">{achievement.label}</span>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</TabsContent>

				{/* Activity Tab */}
				<TabsContent value="activity" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="h-5 w-5 text-blue-600" />
								សកម្មភាពថ្មីៗ
							</CardTitle>
							<CardDescription>
								មើលសកម្មភាពសិក្សារបស់អ្នកថ្មីៗនេះ
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recentActivity.map((activity) => (
									<div
										key={activity.id}
										className="flex items-start gap-4 rounded-lg border border-slate-100 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
									>
										<div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
											activity.type === "lesson"
												? "bg-blue-100 dark:bg-blue-900/30"
												: activity.type === "course"
												? "bg-violet-100 dark:bg-violet-900/30"
												: "bg-amber-100 dark:bg-amber-900/30"
										}`}>
											{activity.type === "lesson" ? (
												<BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
											) : activity.type === "course" ? (
												<GraduationCap className="h-5 w-5 text-violet-600 dark:text-violet-400" />
											) : (
												<Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-slate-900 dark:text-white truncate">
												{activity.title}
											</p>
											{activity.course && (
												<p className="text-sm text-muted-foreground truncate">
													{activity.course}
												</p>
											)}
										</div>
										<span className="shrink-0 text-xs text-muted-foreground">
											{activity.time}
										</span>
									</div>
								))}
							</div>
							<Button variant="outline" className="mt-4 w-full">
								មើលសកម្មភាពទាំងអស់
								<ChevronRight className="ml-2 h-4 w-4" />
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Settings Tab */}
				<TabsContent value="settings" className="space-y-6">
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Shield className="h-5 w-5 text-emerald-600" />
									សុវត្ថិភាព
								</CardTitle>
								<CardDescription>
									គ្រប់គ្រងការកំណត់សុវត្ថិភាពគណនី
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Link href="/forgot-password">
									<Button variant="outline" className="w-full justify-between">
										<span className="flex items-center gap-2">
											<KeyRound className="h-4 w-4" />
											ប្តូរពាក្យសម្ងាត់
										</span>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</Link>
								<Link href="/setup-2fa">
									<Button variant="outline" className="w-full justify-between">
										<span className="flex items-center gap-2">
											<Shield className="h-4 w-4" />
											ការផ្ទៀងផ្ទាត់ពីរកត្តា (2FA)
										</span>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</Link>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Settings className="h-5 w-5 text-slate-600" />
									គណនី
								</CardTitle>
								<CardDescription>
									ការកំណត់គណនីផ្សេងទៀត
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Link href="/dashboard/settings">
									<Button variant="outline" className="w-full justify-between">
										<span className="flex items-center gap-2">
											<Settings className="h-4 w-4" />
											ការកំណត់ទូទៅ
										</span>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</Link>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button variant="outline" className="w-full justify-between text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20">
											<span className="flex items-center gap-2">
												<LogOut className="h-4 w-4" />
												ចេញពីគណនី
											</span>
											<ChevronRight className="h-4 w-4" />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>ចេញពីគណនី?</AlertDialogTitle>
											<AlertDialogDescription>
												តើអ្នកប្រាកដជាចង់ចេញពីគណនីរបស់អ្នកមែនទេ? អ្នកនឹងត្រូវចូលម្តងទៀតដើម្បីប្រើប្រាស់។
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>បោះបង់</AlertDialogCancel>
											<AlertDialogAction
												onClick={handleLogout}
												className="bg-red-600 hover:bg-red-700"
											>
												ចេញពីគណនី
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</CardContent>
						</Card>
					</div>

					{/* Danger Zone */}
					<Card className="border-red-200 dark:border-red-900/50">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-red-600">
								<Sparkles className="h-5 w-5" />
								តំបន់គ្រោះថ្នាក់
							</CardTitle>
							<CardDescription>
								សកម្មភាពទាំងនេះមិនអាចត្រឡប់វិញបានទេ
							</CardDescription>
						</CardHeader>
						<CardContent>
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-950/20">
										លុបគណនី
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>លុបគណនីជាអចិន្រ្តៃយ៍?</AlertDialogTitle>
										<AlertDialogDescription>
											សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។ ទិន្នន័យទាំងអស់របស់អ្នករួមទាំងវគ្គសិក្សា វឌ្ឍនភាព និងវិញ្ញាបនបត្រនឹងត្រូវលុបចោលជារៀងរហូត។
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>បោះបង់</AlertDialogCancel>
										<AlertDialogAction className="bg-red-600 hover:bg-red-700">
											បាទ លុបគណនី
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
