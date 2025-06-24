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
          // Sign in with GitHub
          await signIn("github");
          
          // Note: The code below won't execute immediately after sign-in
          // due to the redirect flow, but included per requirement
          const updatedSession = await auth();
          if (updatedSession?.user) {
            // Check if user exists in database
            // Replace with your actual user fetching logic
            const existingUser = await fetchUserFromDatabase(updatedSession.user.id);
            
            if (!existingUser) {
              // Create new user record
              await createUserInDatabase({
                id: updatedSession.user.id,
                name: updatedSession.user.name,
                email: updatedSession.user.email,
                // Add other needed user properties
              });
            }
          }
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