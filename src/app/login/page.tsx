import React from "react";
import { login } from "./actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4" dir="rtl">
      <Card className="w-full max-w-md border-sage-200 shadow-xl shadow-sage-900/5 dark:border-sage-800/40 dark:bg-sage-900/20">
        <CardHeader className="space-y-1 text-center items-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-arabic tracking-tight">تسجيل الدخول</CardTitle>
          <CardDescription className="font-arabic">
            أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى لوحة التحكم
          </CardDescription>
        </CardHeader>
        <form action={login}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-arabic text-right rounded-md border border-red-100 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label className="font-arabic text-right block" htmlFor="email">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
                className="text-left"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-arabic text-right block" htmlFor="password">
                كلمة المرور
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="text-left"
                dir="ltr"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full font-arabic text-lg h-11" type="submit">
              دخول
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
