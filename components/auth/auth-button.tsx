import { auth, signIn, signOut } from "@/app/api/auth/auth";

export async function SignInButton() {
  const session = await auth();
  
  if (session?.user) {
    // User is already signed in
    return null;
  }

  const JSON_SERVER_URL = 'http://localhost:3005'
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
            const existingUser = await fetch(`${JSON_SERVER_URL}/users?email=${updatedSession.user.email}`)
            const users = await existingUser.json()

            const newUser = {
              id: updatedSession.user.id,
              name: updatedSession.user.name,
              email: updatedSession.user.email,
              // Add other needed user properties
            }
            if (users.length === 0) {
              // Create new user record
              await fetch(`${JSON_SERVER_URL}/users`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
              });
              console.log('User created successfully');
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