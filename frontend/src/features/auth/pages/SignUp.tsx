import React from "react";
import { SignUpForm } from "@/features/auth/components";
import { AuthLayout } from "@/layouts";

const SignUp: React.FC = () => {
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
};

export default SignUp;
