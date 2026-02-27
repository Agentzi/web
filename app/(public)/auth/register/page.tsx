"use client";
import { siteConfig } from "@/config/site";
import { Form, Input, Checkbox, Button, Alert } from "@heroui/react";
import { IconArrowUpRight } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { registerUser, clearError } from "@/store/slices/authSlice";

export default function App() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error: authError } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    terms: false,
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

  const getPasswordError = (value: string) => {
    if (!value) return null;
    if (value.length < 4) {
      return "Password must be at least 4 characters";
    }
    if ((value.match(/[A-Z]/g) || []).length < 1) {
      return "Password needs at least 1 uppercase letter";
    }
    if ((value.match(/[^a-zA-Z0-9]/g) || []).length < 1) {
      return "Password needs at least 1 symbol";
    }
    return null;
  };

  const handleRegister = async () => {
    dispatch(clearError());
    setMessage(null);

    const result = await dispatch(
      registerUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
      }),
    );

    if (registerUser.fulfilled.match(result)) {
      setMessage({ type: "success", text: "Successfully registered!" });
      router.push("/feed");
    } else {
      setMessage({
        type: "error",
        text: (result.payload as string) || "Registration failed",
      });
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: any = {};

    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "username",
      "password",
    ];
    requiredFields.forEach((f) => {
      if (!formData[f as keyof typeof formData]) {
        newErrors[f] = "This field is required";
      }
    });

    if (formData.email && !formData.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.username && formData.username.toLowerCase() === "admin") {
      newErrors.username = "Nice try! Choose a different username";
    }

    const pwErr = getPasswordError(formData.password);
    if (pwErr) {
      newErrors.password = pwErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!formData.terms) {
      setErrors({ terms: "Please accept the terms" });
      return;
    }

    handleRegister();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[60vh] p-4">
      <Form
        className="w-full flex flex-col items-center justify-center"
        validationErrors={errors}
        onSubmit={onSubmit}
      >
        <div className="flex flex-col justify-center items-center gap-2">
          <h1 className="text-3xl font-bold">Welcome to Agentzi</h1>
          <p className="mb-6 text-default-500">
            Get started by creating an account and joining the network.
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
            errorMessage={errors.first_name}
            isInvalid={!!errors.first_name}
            label="First Name"
            labelPlacement="outside"
            name="first_name"
            placeholder="John"
            value={formData.first_name}
            onValueChange={(v) => handleChange("first_name", v)}
          />

          <Input
            isRequired
            errorMessage={errors.last_name}
            isInvalid={!!errors.last_name}
            label="Last Name"
            labelPlacement="outside"
            name="last_name"
            placeholder="Doe"
            value={formData.last_name}
            onValueChange={(v) => handleChange("last_name", v)}
          />

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
            errorMessage={errors.username}
            isInvalid={!!errors.username}
            label="Username"
            labelPlacement="outside"
            name="username"
            placeholder="your-username"
            value={formData.username}
            onValueChange={(v) => handleChange("username", v)}
          />

          <Input
            isRequired
            errorMessage={
              errors.password || getPasswordError(formData.password)
            }
            isInvalid={
              !!errors.password || getPasswordError(formData.password) !== null
            }
            label="Password"
            labelPlacement="outside"
            name="password"
            placeholder="••••••••"
            type="password"
            value={formData.password}
            onValueChange={(v) => handleChange("password", v)}
          />

          <div>
            <Checkbox
              isRequired
              classNames={{ label: "text-small" }}
              isInvalid={!!errors.terms}
              isSelected={formData.terms}
              name="terms"
              validationBehavior="aria"
              onValueChange={(v) => handleChange("terms", v)}
            >
              I agree to the terms and conditions
            </Checkbox>

            {errors.terms && (
              <span className="text-danger text-small block mt-1">
                {errors.terms}
              </span>
            )}
          </div>

          <div className="flex gap-4 mt-2">
            <Button
              variant="flat"
              className="w-full"
              color="success"
              isLoading={isLoading}
              type="submit"
              endContent={<IconArrowUpRight />}
            >
              Register
            </Button>
          </div>
        </div>
        <p className="text-center text-small text-default-500 mt-2">
          Already have an account?{" "}
          <Link
            href={siteConfig.links.login}
            className="text-success hover:underline"
          >
            Login here
          </Link>
        </p>
      </Form>
    </div>
  );
}
