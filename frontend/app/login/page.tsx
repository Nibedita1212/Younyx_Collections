// app/login/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthModal from "../../components/AuthModal"; // same path style as your other app files

export default function LoginRoutePage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search?.get("next") ?? "/";

  // keep modal open state so we can play close animation / control behaviour
  const [open, setOpen] = useState(true);

  // when modal closed -> navigate to next
  function handleClose() {
    setOpen(false);
    // small delay to allow any CSS close animation (optional)
    setTimeout(() => {
      // use push so user can go back if needed
      router.push(next);
    }, 80);
  }

  // If the page was opened without `open` (rare), ensure it navigates back
  useEffect(() => {
    if (!open) {
      router.push(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    // Render your modal component exactly as it expects
    <AuthModal open={open} initialTab="login" onClose={handleClose} />
  );
}
