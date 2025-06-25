"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function SignInButton() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <button disabled>Loading...</button>;
  }
  
  if (session?.user) {
    // User is already signed in
    return null;
  }

  const handleSignIn = async () => {
    try {
      await signIn("github", { callbackUrl: "/" });
      // Note: After successful sign-in, the user will be redirected
      // You can handle post-signin logic in a callback or useEffect
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <button onClick={handleSignIn} type="button">
      Sign in
    </button>
  );
}

export function SignOutButton() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <button disabled>Loading...</button>;
  }
  
  if (!session?.user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <button onClick={handleSignOut} type="button">
      Sign out
    </button>
  );
}