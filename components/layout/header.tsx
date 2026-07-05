import React, { useRef } from 'react'
import Link from 'next/link'
import { Logo } from './logo'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModeToggle } from './mode-toggle'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export const HeroHeader = ({ startReveal = false }: { startReveal?: boolean }) => {
    const menuItems = [
        { name: 'Features', href: '#features' },
        { name: 'Workflow', href: '#workflow' },
        { name: 'FAQ', href: '#faq' },
    ]
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useGSAP(() => {
        if (!startReveal) return

        // Respect system preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            gsap.set('.nav-container', { opacity: 1, y: 0 })
            gsap.set('.nav-item-anim', { opacity: 1, y: 0 })
            return
        }

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        tl.fromTo('.nav-container', {
            y: -30,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            duration: 1.6
        })
        .fromTo('.nav-item-anim', {
            y: -10,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.08
        }, '<+0.4')
    }, { scope: containerRef, dependencies: [startReveal] })

    return (
        <header ref={containerRef}>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2">
                <div className={cn('nav-container opacity-0 mx-auto mt-2 max-w-6xl px-6 transition-[max-width,padding,background-color,border-color] duration-300 lg:px-12', isScrolled && 'bg-background/80 max-w-4xl rounded-2xl border backdrop-blur-md lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="nav-item-anim opacity-0 flex w-full items-center justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center gap-2">
                                <Logo />
                            </Link>

                            <div className="flex items-center gap-2 lg:hidden">
                                <ModeToggle />
                                <button
                                    onClick={() => setMenuState(!menuState)}
                                    aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                    className="relative z-20 block cursor-pointer p-2.5">
                                    <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                    <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                                </button>
                            </div>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index} className="nav-item-anim opacity-0">
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground font-medium block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="nav-item-anim opacity-0 bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end gap-6 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="flex flex-col gap-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground font-medium block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="hidden lg:block">
                                <ModeToggle />
                            </div>
                            <Link
                                href="/explore"
                                className="inline-flex h-9 w-full lg:w-auto items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105 mt-6 lg:mt-0"
                            >
                                Open Workspace
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
