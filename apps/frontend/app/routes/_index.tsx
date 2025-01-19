import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";

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
              <header className="flex flex-col items-center gap-9">
                  <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
                      <Link to={"/feed"}>Welcome to Straumur!</Link>
                  </h1>
              </header>
          </div>
      </div>
  );
}
