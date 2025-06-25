import { auth, signIn, signOut } from "@/app/api/auth/auth";

export async function SignInButton() {
  const session = await auth();
  
  if (session?.user) {
    // User is already signed in
    return null;
  }
  
  return (
    <>
      <form
        action={async () => {
          "use server";
          await signIn("github");
        }}
      >
        <button type='submit'>Sign in</button>
      </form>
    </>
  );
}

export async function SignOutButton() {
  const session = await auth();
  if (!session?.user) return null;
  return (
    <>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button type='submit'>Sign out</button>
      </form>
    </>
  );
}