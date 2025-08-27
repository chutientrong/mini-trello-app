import React from "react";
import { AuthLayout } from "@/layouts";
import { SignInForm } from "@/features/auth/components";

const SignIn: React.FC = () => {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  );
};

export default SignIn;
