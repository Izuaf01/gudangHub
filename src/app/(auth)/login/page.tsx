"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Warehouse, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Email atau password salah");
        return;
      }

      toast.success("Berhasil masuk");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-ink mb-5">
          <Warehouse className="h-6 w-6 text-canvas" />
        </div>
        <h1 className="text-2xl font-medium text-ink">GudangHub</h1>
        <p className="text-sm text-mute mt-1">
          Masuk ke sistem manajemen gudang
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Email" required error={errors.email?.message}>
          <Input
            {...register("email")}
            type="email"
            placeholder="nama@perusahaan.com"
            autoComplete="email"
            error={errors.email?.message}
          />
        </FormField>

        <FormField label="Password" required error={errors.password?.message}>
          <div className="relative">
            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              autoComplete="current-password"
              error={errors.password?.message}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon w-8 h-8 bg-transparent"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-mute" />
              ) : (
                <Eye className="h-4 w-4 text-mute" />
              )}
            </button>
          </div>
        </FormField>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          className="w-full mt-2"
        >
          {isSubmitting ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <div className="mt-8 p-4 bg-soft-cloud border border-hairline-soft">
        <p className="text-xs font-medium text-mute mb-2">Akun Demo</p>
        <p className="text-xs text-mute">
          Email:{" "}
          <span className="text-ink font-medium">admin@gudanghub.com</span>
        </p>
        <p className="text-xs text-mute">
          Password: <span className="text-ink font-medium">admin123</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm animate-pulse" />}>
      <LoginForm />
    </Suspense>
  );
}
