import Button from "../common/Button";
import Icon from "../common/Icon";
import type { ReactNode } from "react";

type SubmitButtonProps = {
  children: ReactNode;
  loading?: boolean;
  tone?: "green" | "indigo" | "primary";
};

export default function SubmitButton({ children, loading, tone = "indigo" }: SubmitButtonProps) {
  return (
    <Button type="submit" variant={tone} className="w-full" disabled={loading}>
      {loading ? (
        <>
          <Icon name="loader-circle" size={18} color="#fff" className="animate-spin" />
          Working...
        </>
      ) : children}
    </Button>
  );
}
