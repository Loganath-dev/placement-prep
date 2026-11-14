import Link from "next/link"
import { SiteHeader, StartCta, TrackedLink } from "./landing-client"
import { Icon } from "@/components/app-icon"
import { PREMIUM_ANNUAL_PRICE_INR, PREMIUM_SIX_MONTH_PRICE_INR } from "@/lib/access"
import { FAQS } from "@/lib/content/faq"
import { Button } from "@/components/ui/button"

const LEARNING_AREAS = [
  { icon: "Calculator", title: "Aptitude", description: "Build accuracy in arithmetic, percentages, data interpretation and more.", meta: "Think clearly with numbers" },
  { icon: "Brain", title: "Logical & verbal", description: "Develop reasoning, grammar, vocabulary and reading comprehension.", meta: "Make better connections" },
  { icon: "Cpu", title: "CS core", description: "Understand DBMS, operating systems, networks and core computing ideas.", meta: "Build technical foundations" },
  { icon: "Code2", title: "Programming languages", description: "Learn syntax, logic, debugging and practical programming step by step.", meta: "Turn ideas into code" },
  { icon: "Layers", title: "Data structures & algorithms", description: "Move from arrays and complexity to trees, graphs and problem-solving patterns.", meta: "Learn how to solve" },
  { icon: "Route", title: "Guided learning tracks", description: "Follow an organised route from your first concept to advanced practice.", meta: "Always know what comes next" },
]

const LEARNING_STEPS = [
  { number: "01", title: "Understand one idea", body: "Start with a clear explanation and a worked example. No assumed knowledge." },
  { number: "02", title: "Try it yourself", body: "Answer questions, complete short tasks and apply the concept in a new situation." },
  { number: "03", title: "See what you missed", body: "Get useful feedback, revisit mistakes and strengthen the parts that need work." },
]

export function LandingPage() {
  const featuredFaqs = FAQS.slice(0, 4)
  return (
    <div className="sb-marketing min-h-svh bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="relative isolate overflow-hidden border-b border-[#e5ebf3]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -right-40 -top-40 size-[34rem] rounded-full border border-[#e6edf7]" />
            <div className="absolute -right-16 -top-16 size-[26rem] rounded-full border border-[#e6edf7]" />
            <div className="absolute right-[11%] top-24 size-2 rounded-full bg-[#8aa9e7]" />
            <div className="absolute bottom-14 left-[7%] size-1.5 rounded-full bg-[#b6c9e8]" />
          </div>
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 sm:px-8 md:grid-cols-[1.05fr_.95fr] md:pb-24 md:pt-24">
            <div className="sb-landing-enter">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#dce5f2] bg-white px-3 py-1.5 text-xs font-semibold text-[#52627b] shadow-[0_5px_18px_-15px_rgba(20,40,80,.3)]">
                <span className="size-1.5 rounded-full bg-[#315fca]" />
                Placement preparation, with a plan that moves you forward
              </div>
              <h1 className="mt-6 max-w-2xl text-[2.8rem] font-semibold leading-[1.04] tracking-[-0.055em] text-[#142039] sm:text-6xl">
                Prepare with a plan.
                <span className="mt-1 block text-[#315fca]">Build skills that stay with you.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#5c6b82] sm:text-lg sm:leading-8">
                From aptitude to DSA, StudyBench turns placement preparation into a clear daily routine: learn concepts with focused flashcards, practise what you learn, review mistakes and track your progress.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <StartCta placement="hero_primary" size="lg" className="h-12 rounded-xl bg-[#315fca] px-6 text-white shadow-[0_10px_24px_-14px_rgba(49,95,202,.75)] hover:bg-[#244fae]">Build my free study plan</StartCta>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-[#d6dfec] bg-white px-5 text-[#34445f] hover:bg-[#f1f5fb]">
                  <TrackedLink href="#learning-paths" placement="hero_paths">Explore the roadmap <Icon name="ArrowDown" className="ml-2 size-4" /></TrackedLink>
                </Button>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#718096]">
                <span className="inline-flex items-center gap-1.5"><Icon name="Check" className="size-3.5 text-[#2f8a68]" /> Start free</span>
                <span className="inline-flex items-center gap-1.5"><Icon name="Check" className="size-3.5 text-[#2f8a68]" /> Learn at your pace</span>
                <span className="inline-flex items-center gap-1.5"><Icon name="Check" className="size-3.5 text-[#2f8a68]" /> No coding judge</span>
              </div>
              <div className="mt-8 grid max-w-xl grid-cols-3 gap-2">
                {[
                  { value: "6", label: "learning areas" },
                  { value: "Learn", label: "with flashcards" },
                  { value: "Improve", label: "with feedback" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#e1e8f1] bg-white/85 px-3 py-3">
                    <p className="text-base font-bold tracking-tight text-[#1d2b43] sm:text-lg">{item.value}</p>
                    <p className="mt-1 text-[10px] leading-4 text-[#718096] sm:text-xs">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="sb-landing-enter relative mx-auto w-full max-w-[510px] md:justify-self-end" style={{ animationDelay: "120ms" }}>
              <div className="relative rounded-[28px] border border-[#dce5f1] bg-white p-4 shadow-[0_28px_80px_-48px_rgba(31,58,105,.32)] sm:p-5">
                <div className="flex items-center justify-between border-b border-[#edf1f6] px-1 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#8a97aa]">Your learning workspace</p>
                    <p className="mt-1 text-lg font-semibold tracking-tight text-[#18253d]">One step at a time.</p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-xl bg-[#edf3ff] text-[#315fca]"><Icon name="BookOpenCheck" className="size-5" /></span>
                </div>
                <div className="px-1 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#25344e]">Your first roadmap</span>
                    <span className="rounded-full bg-[#f1f5fb] px-2.5 py-1 text-[10px] font-semibold text-[#6c7b91]">BEGINNER → ADVANCED</span>
                  </div>
                  <div className="relative mt-5 space-y-4 pl-2">
                    <div className="absolute bottom-7 left-[21px] top-5 w-px bg-[#dce6f5]" />
                    {[
                      { title: "Understand the basics", detail: "A short concept lesson", status: "Start here", done: true },
                      { title: "Practise the concept", detail: "Try it with guided questions", status: "Up next", done: false },
                      { title: "Check your understanding", detail: "A quick chapter checkpoint", status: "Then", done: false },
                    ].map((item, index) => (
                      <div key={item.title} className="relative flex items-center gap-3">
                        <span className={item.done ? "relative z-10 grid size-7 shrink-0 place-items-center rounded-full bg-[#315fca] text-white shadow-[0_0_0_5px_white]" : "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border border-[#dce5f1] bg-white text-[#8a97aa] shadow-[0_0_0_5px_white]"}>
                          {item.done ? <Icon name="Check" className="size-3.5" /> : <span className="text-[10px] font-semibold">{index + 1}</span>}
                        </span>
                        <div className="min-w-0 flex-1 rounded-xl border border-[#e7edf5] bg-[#fbfcfe] px-3.5 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-[#27364f]">{item.title}</p>
                            <span className="shrink-0 text-[10px] font-semibold text-[#8190a5]">{item.status}</span>
                          </div>
                          <p className="mt-1 text-xs text-[#8491a4]">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f0f5fd] px-4 py-3">
                    <div><p className="text-xs font-semibold text-[#315fca]">A steady routine</p><p className="mt-0.5 text-xs text-[#6c7b91]">Learn · practise · improve</p></div>
                    <Icon name="ArrowUpRight" className="size-4 text-[#315fca]" />
                  </div>
                </div>
              </div>
              <div className="sb-float-note absolute -bottom-5 -left-3 hidden rounded-2xl border border-[#dce5f1] bg-white px-4 py-3 shadow-[0_14px_32px_-22px_rgba(31,58,105,.45)] sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8b98aa]">Your pace</p>
                <p className="mt-1 text-sm font-semibold text-[#24344f]">20 minutes a day</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#315fca]">Built around how students learn</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-.045em] text-[#17243a] sm:text-4xl">A roadmap, not a pile of resources.</h2>
            <p className="mt-4 text-base leading-7 text-[#64738a]">You shouldn’t have to guess what to study, jump between disconnected videos or memorise answers without understanding them.</p>
          </div>
          <div id="learning-paths" className="mt-9 grid scroll-mt-24 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LEARNING_AREAS.map((area, index) => (
              <article key={area.title} className="sb-area-card rounded-2xl border border-[#e1e8f1] bg-white p-5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-[#c2d2ec] hover:shadow-[0_18px_36px_-28px_rgba(31,58,105,.28)]" style={{ animationDelay: `${index * 55}ms` }}>
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-[#edf3ff] text-[#315fca]"><Icon name={area.icon} className="size-5" /></span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9aa5b5]">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold tracking-tight text-[#1d2b43]">{area.title}</h3>
                <p className="mt-2 min-h-[60px] text-sm leading-6 text-[#6c7b91]">{area.description}</p>
                <p className="mt-4 border-t border-[#edf1f6] pt-3 text-xs font-semibold text-[#315fca]">{area.meta}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[#e7edf5] bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#315fca]">The learning loop</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#17243a] sm:text-4xl">Learn it. Try it. Own it.</h2>
              <p className="mt-4 text-base leading-7 text-[#64738a]">A repeatable learning loop helps you turn passive reading into active understanding.</p>
            </div>
            <div className="mt-9 grid gap-8 md:grid-cols-3 md:gap-10">
              {LEARNING_STEPS.map((step) => (
                <div key={step.number} className="relative">
                  <p className="text-sm font-semibold tracking-[.12em] text-[#8ca5d7]">{step.number}</p>
                  <h3 className="mt-3 text-lg font-semibold text-[#1d2b43]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6c7b91]">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#315fca]">Simple pricing</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#17243a] sm:text-4xl">A small investment in a more structured preparation routine.</h2>
              <p className="mt-4 text-base leading-7 text-[#64738a]">Start free. Upgrade when you want every learning path, practice set and progress tool.</p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-[#e1e8f1] bg-white p-6 sm:p-7">
              <p className="text-sm font-semibold text-[#6c7b91]">Free</p>
              <p className="mt-3 text-4xl font-semibold tracking-[-.05em] text-[#17243a]">₹0</p>
              <p className="mt-3 text-sm leading-6 text-[#6c7b91]">Explore selected lessons, experience the learning flow and decide when you are ready for more.</p>
              <ul className="mt-5 space-y-2 text-xs text-[#64738a]">
                <li>✓ Selected introductory lessons</li>
                <li>✓ Personal learning roadmap</li>
                <li>✓ No payment details to start</li>
              </ul>
              <StartCta placement="pricing_free" variant="outline" className="mt-7 h-11 w-full rounded-xl border-[#d7e0ec]">Start free</StartCta>
            </article>
            <article className="relative overflow-hidden rounded-2xl border border-[#b9cbed] bg-[#f2f6ff] p-6 sm:p-7">
              <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-[#315fca]">Premium · 6 months</p><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#315fca]">180 DAYS</span></div>
              <p className="mt-3 text-4xl font-semibold tracking-[-.05em] text-[#17243a]">₹{PREMIUM_SIX_MONTH_PRICE_INR}</p>
              <p className="mt-1 text-xs text-[#8794a7]">One-time payment · 180 days · about ₹50/month</p>
              <p className="mt-3 text-sm leading-6 text-[#64738a]">Build consistency with six months of full access to every learning path and practice tools.</p>
              <ul className="mt-4 space-y-2 text-xs text-[#64738a]">
                <li>✓ All learning paths and lesson flashcards</li>
                <li>✓ Lesson practice and chapter assessments</li>
                <li>✓ Mistake review and learning analytics</li>
              </ul>
              <StartCta placement="pricing_six_month" className="mt-7 h-11 w-full rounded-xl bg-[#315fca] text-white hover:bg-[#244fae]">Explore Premium</StartCta>
            </article>
            <article className="relative overflow-hidden rounded-2xl border border-[#b9cbed] bg-[#f2f6ff] p-6 sm:p-7">
              <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-[#315fca]">Premium · 1 year</p><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#315fca]">SAVE ₹99</span></div>
              <p className="mt-3 text-4xl font-semibold tracking-[-.05em] text-[#17243a]">₹{PREMIUM_ANNUAL_PRICE_INR}</p>
              <p className="mt-1 text-xs text-[#8794a7]">One-time payment · 365 days · about ₹42/month</p>
              <p className="mt-3 text-sm leading-6 text-[#64738a]">Best value for students who want a full year to learn, practise, revise and prepare.</p>
              <ul className="mt-4 space-y-2 text-xs text-[#64738a]">
                <li>✓ Everything in the 6-month plan</li>
                <li>✓ A full year to build and revisit skills</li>
                <li>✓ Save ₹99 versus two 6-month renewals</li>
              </ul>
              <StartCta placement="pricing_annual" className="mt-7 h-11 w-full rounded-xl bg-[#315fca] text-white hover:bg-[#244fae]">Explore Premium</StartCta>
            </article>
          </div>
        </section>

        <section className="border-y border-[#e7edf5] bg-[#f3f6fc]">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-[1.05fr_.95fr] md:items-center md:py-18">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#315fca]">Refer & earn</p>
              <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-.045em] text-[#17243a] sm:text-4xl">Your study circle can grow with you.</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#64738a]">Invite classmates who are serious about placement preparation. When an eligible friend completes a verified Premium purchase, you receive a fixed referral reward.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="h-11 rounded-xl bg-[#315fca] px-5 text-white hover:bg-[#244fae]">
                  <Link href="/auth/signup">Create an account to refer <Icon name="ArrowRight" className="ml-2 size-4" /></Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-xl border-[#d7e0ec] bg-white">
                  <Link href="/terms">Read referral rules</Link>
                </Button>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#7b899d]">Referral participation requires an eligible account and acceptance of programme terms. Self-referrals, duplicate or fraudulent accounts and reversed payments are excluded.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#dce5f1] bg-white p-5 shadow-[0_16px_40px_-32px_rgba(31,58,105,.28)]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8794a7]">Friend buys 6 months · ₹299</p>
                <p className="mt-3 text-4xl font-bold tracking-tight text-[#17243a]">₹25</p>
                <p className="mt-1 text-sm text-[#64738a]">Fixed referral reward</p>
              </div>
              <div className="rounded-2xl border border-[#b9cbed] bg-white p-5 shadow-[0_16px_40px_-32px_rgba(31,58,105,.28)]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#315fca]">Friend buys 1 year · ₹499</p>
                <p className="mt-3 text-4xl font-bold tracking-tight text-[#17243a]">₹50</p>
                <p className="mt-1 text-sm text-[#64738a]">Fixed referral reward</p>
              </div>
              <p className="text-xs leading-5 text-[#7b899d] sm:col-span-2">A 15-day review period applies. Approved rewards have a ₹250 minimum payout balance and are paid manually by UPI on the 25th of each month, subject to verification.</p>
            </div>
          </div>
        </section>

        <section className="border-y border-[#e7edf5] bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#315fca]">Questions</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#17243a]">Before you begin.</h2></div>
              <Button asChild variant="outline" className="rounded-xl border-[#d7e0ec]"><Link href="/faq">View all FAQs <Icon name="ArrowUpRight" className="ml-2 size-4" /></Link></Button>
            </div>
            <div className="mt-7 grid gap-3 md:grid-cols-2">
              {featuredFaqs.map((faq) => <article key={faq.id} className="rounded-2xl border border-[#e1e8f1] bg-[#fbfcfe] p-5"><h3 className="font-semibold text-[#1d2b43]">{faq.question}</h3><p className="mt-2 text-sm leading-6 text-[#6c7b91]">{faq.answer.replace(/\*\*/g, "")}</p></article>)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
          <div className="overflow-hidden rounded-[28px] bg-[#172b50] px-6 py-10 text-white sm:px-10 md:flex md:items-center md:justify-between md:gap-10 md:py-12">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#a9c3f4]">Your next step starts here</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-4xl">Build skills you can explain, apply and trust.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#c3d0e5]">Start with one lesson. Keep showing up. Let your understanding grow one step at a time.</p>
            </div>
            <StartCta placement="final_cta" size="lg" className="mt-7 h-12 shrink-0 rounded-xl bg-white px-6 text-[#172b50] hover:bg-[#edf3ff] md:mt-0">Create your free account</StartCta>
          </div>
        </section>
      </main>
      <footer className="border-t border-[#e5ebf3] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-[#7a8799] sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} StudyBench. Learn with purpose.</p>
          <div className="flex flex-wrap gap-5"><Link href="/blog" className="hover:text-[#315fca]">Blog</Link><Link href="/privacy" className="hover:text-[#315fca]">Privacy</Link><Link href="/terms" className="hover:text-[#315fca]">Terms</Link><Link href="/faq" className="hover:text-[#315fca]">FAQ</Link></div>
        </div>
      </footer>
    </div>
  )
}
