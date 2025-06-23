import { auth, signIn, signOut } from "@/app/api/auth/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, Github } from "lucide-react";

export async function SignInButton() {
  const session = await auth();
  if (session?.user) return null;
  
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github");
      }}
    >
      <Button type="submit" variant="outline">
        <Github className="mr-2 h-4 w-4" />
        GitHubでログイン
      </Button>
    </form>
  );
}

export async function SignOutButton() {
  const session = await auth();
  if (!session?.user) return null;
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
          <AvatarFallback>
            {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:block">
          <p className="text-sm font-medium">{session.user.name || "ユーザー"}</p>
          <p className="text-xs text-gray-500">{session.user.email}</p>
        </div>
      </div>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <Button type="submit" variant="ghost" size="sm">
          <LogOut className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

export async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
          <p className="text-gray-600 mb-6">Learn Planningをご利用いただくには、GitHubアカウントでログインしてください。</p>
          <SignInButton />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}