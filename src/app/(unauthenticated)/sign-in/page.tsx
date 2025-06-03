"use client";

import { Suspense } from "react";
import LoginForm from "./login-from";

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
