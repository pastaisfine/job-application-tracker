import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-stone-50">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <section className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Application pipeline
          </p>
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            Track every job in one board
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
            Job Hunt gives you a simple kanban board to organize applications, move opportunities through each stage, and keep your search moving.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                Start for free
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Open dashboard
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
