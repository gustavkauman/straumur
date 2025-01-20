import type { MetaFunction } from "@remix-run/cloudflare";
import { Button } from "@straumur/ui";

export const meta: MetaFunction = () => {
  return [
    { title: "Straumur" },
    { name: "description", content: "Read the internet your way!" },
  ];
};

export default function Index() {
  return (
      <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-16">
              <header className="flex flex-col items-center gap-2">
                  <h1 className="leading text-4xl font-bold text-gray-800 dark:text-gray-100">
                    Straumur
                  </h1>
                  <h2 className="italic">
                    Read the internet your way!
                  </h2>
              </header>
              <div>
                <Button to={"/feed"}>Login with Google</Button>
              </div>
          </div>
      </div>
  );
}
