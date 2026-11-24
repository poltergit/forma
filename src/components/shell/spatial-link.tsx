"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useSpatialNavigation } from "./spatial-transition";

type Props = ComponentProps<typeof Link>;

export function SpatialLink({ href, onClick, ...props }: Props) {
  const { navigate } = useSpatialNavigation();

  return (
    <Link
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) return;

        const anchor = event.currentTarget;
        if (anchor.target && anchor.target !== "_self") return;
        if (anchor.hasAttribute("download")) return;

        const destination = new URL(anchor.href);
        if (destination.origin !== window.location.origin) return;
        if (destination.pathname === window.location.pathname) return;

        event.preventDefault();
        navigate(destination.pathname + destination.search + destination.hash);
      }}
    />
  );
}
