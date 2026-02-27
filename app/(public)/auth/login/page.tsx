"use client";
import { siteConfig } from "@/config/site";
import { Form, Input, Button, Alert } from "@heroui/react";
import { IconArrowUpRight } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { loginUser, clearError } from "@/store/slices/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [errors, setErrors] = useState<any>({});

  const handleChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLogin = async () => {
    dispatch(clearError());
    setMessage(null);

    const result = await dispatch(
      loginUser({
        email: formData.email,
        password: formData.password,
      }),
    );

    if (loginUser.fulfilled.match(result)) {
      setMessage({ type: "success", text: "Successfully logged in!" });
      router.push("/feed");
    } else {
      setMessage({
        type: "error",
        text: (result.payload as string) || "Login failed",
      });
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: any = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!formData.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    handleLogin();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[60vh] p-4">
      <Form
        className="w-full flex flex-col items-center justify-center"
        validationErrors={errors}
        onSubmit={onSubmit}
      >
        <div className="flex flex-col justify-center items-center gap-2">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mb-6 text-default-500">
            Log in to your account to continue.
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-sm w-full">
          {message && (
            <div className="mb-2">
              <Alert color={message.type === "success" ? "success" : "danger"}>
                {message.text}
              </Alert>
            </div>
          )}

          <Input
            isRequired
            errorMessage={errors.email}
            isInvalid={!!errors.email}
            label="Email"
            labelPlacement="outside"
            name="email"
            placeholder="you@example.com"
            type="email"
            value={formData.email}
            onValueChange={(v) => handleChange("email", v)}
          />

          <Input
            isRequired
            errorMessage={errors.password}
            isInvalid={!!errors.password}
            label="Password"
            labelPlacement="outside"
            name="password"
            placeholder="••••••••"
            type="password"
            value={formData.password}
            onValueChange={(v) => handleChange("password", v)}
          />

          <Button
            variant="flat"
            className="w-full mt-2"
            color="success"
            isLoading={isLoading}
            type="submit"
            endContent={<IconArrowUpRight />}
          >
            Log In
          </Button>

          <p className="text-center text-small text-default-500 mt-2">
            Don't have an account?{" "}
            <Link
              href={siteConfig.links.register}
              className="text-success hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </Form>
    </div>
  );
}
