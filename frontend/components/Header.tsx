"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header
            className="w-full"
            style={{ backgroundColor: "var(--brand-bg)" }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-20">
                    {/* LEFT: Logo and name */}
                    <Link href="/" className="flex items-center gap-4">
                        <div className="relative rounded overflow-hidden" style={{ width: 64, height: 64 }}>
                            <Image
                                src="/Younyx_Logo.png"
                                alt="Younyx Logo"
                                fill
                                sizes="(max-width: 768px) 64px, 64px"
                                style={{ objectFit: "contain" }}
                                priority
                            />
                        </div>

                        <div className="leading-none">
                            <div
                                className="font-serif font-semibold"
                                style={{ color: "var(--brand-gold)", fontSize: "1.375rem" }}
                            >
                                Younyx
                            </div>
                            <div className="text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>
                                Collections
                            </div>
                        </div>
                    </Link>

                    {/* RIGHT: social icons only (Instagram + Facebook) */}
                    <div className="flex items-center gap-4">

                        {/* ORIGINAL INSTAGRAM ICON */}
                        <a
                            href="https://instagram.com/younyxcollections"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Instagram"
                            className="p-1"
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 551.034 551.034"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <linearGradient id="IG" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#feda75" />
                                    <stop offset="25%" stopColor="#fa7e1e" />
                                    <stop offset="50%" stopColor="#d62976" />
                                    <stop offset="75%" stopColor="#962fbf" />
                                    <stop offset="100%" stopColor="#4f5bd5" />
                                </linearGradient>

                                <path
                                    fill="url(#IG)"
                                    d="M386.878 0H164.156C73.65 0 0 73.65 0 164.156v222.721C0 477.384 73.65 551.034 164.156 551.034h222.721c90.506 0 164.156-73.65 164.156-164.156V164.156C551.034 73.65 477.384 0 386.878 0zM495.034 386.878c0 59.821-48.334 108.156-108.156 108.156H164.156c-59.821 0-108.156-48.334-108.156-108.156V164.156c0-59.821 48.334-108.156 108.156-108.156h222.721c59.821 0 108.156 48.334 108.156 108.156v222.721z"
                                />

                                <path
                                    fill="#fff"
                                    d="M275.517 133.06c-78.571 0-142.457 63.886-142.457 142.457S196.946 418 275.517 418s142.457-63.886 142.457-142.457-63.886-142.483-142.457-142.483zm0 234.914c-51.017 0-92.457-41.44-92.457-92.457s41.44-92.457 92.457-92.457 92.457 41.44 92.457 92.457-41.44 92.457-92.457 92.457z"
                                />

                                <circle fill="#fff" cx="418.31" cy="133.06" r="34.15" />
                            </svg>


                        </a>

                        {/* ORIGINAL FACEBOOK ICON */}
                        <a
                            href="https://www.facebook.com/profile.php?id=61584111562604"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Facebook"
                            className="p-1"
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 320 512"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fill="#1877F2"
                                    d="M279.14 288l14.22-92.66h-88.91V127.41c0-25.35 
    12.42-50.06 52.24-50.06h40.42V6.26S260.43 
    0 225.36 0c-73.22 0-121.08 44.38-121.08 
    124.72v70.62H22.89V288h81.39v224h100.17V288z"
                                />
                            </svg>

                        </a>

                    </div>
                </div>
            </div>
        </header>
    );
}
