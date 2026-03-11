"use client";

import Link from "next/link";
import { Shield, KeyRound, Settings, LogOut, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

interface SettingsTabProps {
  onLogout: () => Promise<void>;
  onDeleteAccount?: () => Promise<void>;
}

export function SettingsTab({ onLogout, onDeleteAccount }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Security */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              សុវត្ថិភាព
            </CardTitle>
            <CardDescription>គ្រប់គ្រងការកំណត់សុវត្ថិភាពគណនី</CardDescription>
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
        </Card> */}

        

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-600" />
              គណនី
            </CardTitle>
            <CardDescription>ការកំណត់គណនីផ្សេងទៀត</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  ការកំណត់ទូទៅ
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link> */}

            {/* Logout dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
                >
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
                  <AlertDialogAction onClick={onLogout} className="bg-red-600 hover:bg-red-700">
                    ចេញពីគណនី
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

          {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Sparkles className="h-5 w-5" />
            តំបន់គ្រោះថ្នាក់
          </CardTitle>
          <CardDescription>សកម្មភាពទាំងនេះមិនអាចត្រឡប់វិញបានទេ</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-950/20"
              >
                លុបគណនី
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>លុបគណនីជាអចិន្រ្តៃយ៍?</AlertDialogTitle>
                <AlertDialogDescription>
                  សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។ ទិន្នន័យទាំងអស់របស់អ្នករួមទាំងវគ្គសិក្សា
                  វឌ្ឍនភាព និងវិញ្ញាបនបត្រនឹងត្រូវលុបចោលជារៀងរហូត។
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>បោះបង់</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDeleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  បាទ លុបគណនី
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      </div>
    </div>
  );
}