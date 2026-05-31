import { cn } from "../../utils/cn";
import type { ElementType, HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
};

export default function Card({ children, className = "", as: Tag = "section", ...props }: CardProps) {
  return (
    <Tag
      className={cn(
        "w-full rounded-[1.5rem] border border-app-line bg-app-card p-4 text-app-text shadow-[0_14px_32px_rgba(15,23,42,0.06)] sm:p-5",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
