"use client";

import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  UserCheck,
  UserX,
  Shield,
  GraduationCap,
  Users as UsersIcon,
  Mail,
  Calendar,
  Loader2,
  AlertTriangle,
  Phone,
  MapPin,
  FileText,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatCard } from "@/components/StatCard";
import { DataTable } from "@/components/dataTable/DataTable";
import { useUsers, useUserAdmin, userKeys } from "@/hooks/useUsers";
import { fetchUsers } from '@/lib/api/users'
import type { UserResponse, UpdateUserRequest, UserRequest } from "@/types/userType";

// --- DataTable adapter hook ---------------------------------------------------

type UserTableParams = {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  search?: string;
  status?: string;
};

function useUsersTable(params: UserTableParams) {
  const { page = 0, size = 10, sortBy = "id", sortDir = "asc", search, status } = params;
  const query = useQuery({
    queryKey: userKeys.list({ page, size, sortBy, sortDir, search, status }),
    queryFn: () => fetchUsers({ page, size, sortBy, sortDir, search, status }),
    placeholderData: keepPreviousData,
  });
  return {
    data: query.data ? { success: true as const, message: "", data: query.data } : undefined,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// --- Helpers -----------------------------------------------------------------

/** Pick highest-priority role from array */
function primaryRole(roles: string[] = []): string {
  if (roles.includes("ADMIN") || roles.includes("ROLE_ADMIN"))      return "ADMIN";
  if (roles.includes("INSTRUCTOR") || roles.includes("ROLE_INSTRUCTOR")) return "INSTRUCTOR";
  return "USER";
}

// --- Role Badge ---------------------------------------------------------------

function RoleBadge({ roles }: { roles: string[] }) {
  const role = primaryRole(roles);
  const config: Record<string, { color: string; bg: string; icon: typeof Shield }> = {
    ADMIN:      { color: "text-violet-700 dark:text-violet-300", bg: "bg-violet-100 dark:bg-violet-900/40", icon: Shield },
    INSTRUCTOR: { color: "text-blue-700 dark:text-blue-300",    bg: "bg-blue-100 dark:bg-blue-900/40",    icon: GraduationCap },
    USER:       { color: "text-slate-700 dark:text-slate-300",  bg: "bg-slate-100 dark:bg-slate-800",     icon: UsersIcon },
  };
  const { color, bg, icon: Icon } = config[role] || config.USER;
  return (
    <Badge variant="outline" className={`${bg} ${color} border-0 gap-1 text-xs`}>
      <Icon className="h-3 w-3" />
      {role}
    </Badge>
  );
}

// --- Status Badge -------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE";
  if (active) {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 gap-1 text-xs">
        <UserCheck className="h-3 w-3" /> Active
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-0 gap-1 text-xs">
      <UserX className="h-3 w-3" /> {status === "BANNED" ? "Banned" : "Inactive"}
    </Badge>
  );
}

// --- View Dialog -------------------------------------------------------------

function UserViewDialog({
  user,
  open,
  onClose,
}: {
  user: UserResponse | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!user) return null;

  const formatDate = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Full profile information for this user.</DialogDescription>
        </DialogHeader>

        {/* Avatar + name section */}
        <div className="flex items-center gap-4 pt-2">
          <Avatar className="h-16 w-16 border-2 border-border shadow">
            <AvatarImage src={user.profile_picture || undefined} alt={user.username} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-xl font-bold">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{user.username}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />{user.email}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <RoleBadge roles={user.roles} />
              <StatusBadge status={user.status} />
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</p>
            <p className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {user.phoneNumber || ""}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Address</p>
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {user.address || ""}
            </p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bio</p>
            <p className="flex items-start gap-1.5 text-muted-foreground">
              <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              {user.bio || ""}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</p>
            <p className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {formatDate(user.createdAt)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Updated</p>
            <p>{formatDate(user.updatedAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">All Roles</p>
            <div className="flex flex-wrap gap-1">
              {user.roles.map((r) => <RoleBadge key={r} roles={[r]} />)}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Login Attempts</p>
            <p>{user.login_attempt ?? 0}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Add Dialog --------------------------------------------------------------

function UserAddDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { create, creating } = useUserAdmin();
  const emptyForm = (): UserRequest & { confirmPassword?: string; selectedRole: string } => ({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: ["USER"],
    selectedRole: "USER",
    phoneNumber: "",
    address: "",
    bio: "",
  });
  const [form, setForm] = useState(emptyForm());
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setForm(emptyForm());
      setProfilePicture(null);
      setError(null);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const { confirmPassword, selectedRole, ...payload } = form;
      await create({ ...payload, roles: [selectedRole] }, profilePicture || undefined);
      setForm(emptyForm());
      setProfilePicture(null);
      toast.success("User created successfully");
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create user.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> Add New User
          </DialogTitle>
          <DialogDescription>Create a new user account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="add-username">Username <span className="text-destructive">*</span></Label>
            <Input
              id="add-username"
              required
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-email">Email <span className="text-destructive">*</span></Label>
            <Input
              id="add-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="email@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="add-password">Password <span className="text-destructive">*</span></Label>
              <Input
                id="add-password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Password"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-confirm">Confirm Password <span className="text-destructive">*</span></Label>
              <Input
                id="add-confirm"
                type="password"
                required
                value={form.confirmPassword ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Confirm"
                autoComplete="new-password"
              />
            </div>
          </div>
          {/* Phone + Address */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="add-phone">Phone</Label>
              <Input id="add-phone" value={form.phoneNumber ?? ""} onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} placeholder="+855 ..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-address">Address</Label>
              <Input id="add-address" value={form.address ?? ""} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="City, Country" />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="add-bio">Bio</Label>
            <Textarea id="add-bio" value={form.bio ?? ""} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Short bio..." rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-profile-picture">Profile Picture</Label>
            <Input
              id="add-profile-picture"
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={form.selectedRole} onValueChange={(v) => setForm((f) => ({ ...f, selectedRole: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={creating}>Cancel</Button>
            <Button type="submit" disabled={creating} className="gap-2">
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Edit Dialog -------------------------------------------------------------

function UserEditDialog({
  user,
  open,
  onClose,
}: {
  user: UserResponse | null;
  open: boolean;
  onClose: () => void;
}) {
  const { update, updating } = useUserAdmin();
  const [error, setError] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [form, setForm] = useState<UpdateUserRequest & { password?: string; _role?: string }>({});

  useEffect(() => {
    if (open && user) {
      setForm({
        username:    user.username,
        email:       user.email,
        phoneNumber: user.phoneNumber ?? "",
        address:     user.address     ?? "",
        bio:         user.bio         ?? "",
        status:      user.status,
        password:    "",
        _role:       primaryRole(user.roles),
      });
      setProfilePicture(null);
      setError(null);
    }
  }, [open, user]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setForm({});
      setProfilePicture(null);
      setError(null);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    try {
      const { _role, password, ...rest } = form;
      const payload: UpdateUserRequest = { ...rest };
      if (password) payload.password = password;
      if (_role) payload.roles = [_role];
      await update(user.id, payload, profilePicture || undefined);
      toast.success("User updated successfully");
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to update user.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profile_picture || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-xs">
                {user?.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            Edit User
          </DialogTitle>
          <DialogDescription>Update user profile, role, and status.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          {/* Username + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input id="edit-username" value={form.username ?? ""} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="Username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={form.email ?? ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
            </div>
          </div>

          {/* Phone + Address */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" value={form.phoneNumber ?? ""} onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} placeholder="+855 ..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input id="edit-address" value={form.address ?? ""} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="City, Country" />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea id="edit-bio" value={form.bio ?? ""} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Short bio..." rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-profile-picture">Profile Picture</Label>
            <Input
              id="edit-profile-picture"
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form._role ?? "USER"} onValueChange={(v) => setForm((f) => ({ ...f, _role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status ?? "ACTIVE"} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="BANNED">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="edit-password">New Password <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="edit-password" type="password" value={form.password ?? ""} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Leave blank to keep current" autoComplete="new-password" />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={updating}>Cancel</Button>
            <Button type="submit" disabled={updating} className="gap-2">
              {updating && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Delete Dialog -----------------------------------------------------------

function UserDeleteDialog({
  user,
  open,
  onClose,
}: {
  user: UserResponse | null;
  open: boolean;
  onClose: () => void;
}) {
  const { remove, removing } = useUserAdmin();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) return;
    setError(null);
    try {
      await remove(user.id);
      toast.success("User deleted successfully");
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete user.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-2">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{user?.username}</span>?
            All their data will be permanently removed.
          </p>
          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={removing}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={removing} className="gap-2">
            {removing && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Table columns -----------------------------------------------------------

const USER_COLUMNS = [
  {
    key: "username",
    label: "User",
    sortable: true,
    render: (_: unknown, user: UserResponse) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={user.profile_picture || undefined} alt={user.username} />
          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-xs font-medium">
            {user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{user.username}</p>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <Mail className="h-3 w-3 shrink-0" />{user.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "roles",
    label: "Role",
    sortable: false,
    render: (value: unknown) => <RoleBadge roles={Array.isArray(value) ? (value as string[]) : []} />,
  },
  {
    key: "status",
    label: "Status",
    render: (value: unknown) => <StatusBadge status={String(value ?? "INACTIVE")} />,
  },
  {
    key: "createdAt",
    label: "Joined",
    sortable: true,
    render: (value: unknown) => (
      <span className="text-sm text-muted-foreground flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5 shrink-0" />
        {value
          ? new Date(String(value)).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : ""}
      </span>
    ),
  },
];

const USER_FILTERS = [
  {
    key: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "Active",   value: "ACTIVE" },
      { label: "Inactive", value: "INACTIVE" },
      { label: "Banned",   value: "BANNED" },
    ],
  },
];

// --- Main Component ----------------------------------------------------------

export default function UsersPage() {
  const [viewUser,   setViewUser]   = useState<UserResponse | null>(null);
  const [editUser,   setEditUser]   = useState<UserResponse | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserResponse | null>(null);
  const [addOpen,    setAddOpen]    = useState(false);

  const { data: statsData, loading: statsLoading } = useUsers({ page: 0, size: 1000 });
  const allUsers = statsData?.content ?? [];
  const stats = {
    total:       statsData?.totalElements ?? 0,
    admins:      allUsers.filter((u) => primaryRole(u.roles) === "ADMIN").length,
    instructors: allUsers.filter((u) => primaryRole(u.roles) === "INSTRUCTOR").length,
    activeUsers: allUsers.filter((u) => u.status === "ACTIVE").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">Manage user accounts and permissions</p>
        </div>
        <Button size="sm" className="gap-2 self-start sm:self-auto" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={UsersIcon}     label="Total Users"  value={stats.total}       color="#8b5cf6" loading={statsLoading} />
        <StatCard icon={Shield}        label="Admins"       value={stats.admins}      color="#ef4444" loading={statsLoading} />
        <StatCard icon={GraduationCap} label="Instructors"  value={stats.instructors} color="#3b82f6" loading={statsLoading} />
        <StatCard icon={UserCheck}     label="Active Users" value={stats.activeUsers} color="#10b981" loading={statsLoading} />
      </div>

      {/* Data Table */}
      <DataTable<UserResponse>
        title="User Management"
        description="View and manage all registered users"
        columns={USER_COLUMNS}
        useDataHook={useUsersTable}
        filters={USER_FILTERS}
        onView={(user)   => setViewUser(user)}
        onEdit={(user)   => setEditUser(user)}
        onDelete={(user) => setDeleteUser(user)}
      />

      {/* Add Modal */}
      <UserAddDialog open={addOpen} onClose={() => setAddOpen(false)} />

      {/* View Modal */}
      <UserViewDialog user={viewUser} open={viewUser !== null} onClose={() => setViewUser(null)} />

      {/* Edit Modal */}
      <UserEditDialog user={editUser} open={editUser !== null} onClose={() => setEditUser(null)} />

      {/* Delete Modal */}
      <UserDeleteDialog user={deleteUser} open={deleteUser !== null} onClose={() => setDeleteUser(null)} />
    </div>
  );
}
