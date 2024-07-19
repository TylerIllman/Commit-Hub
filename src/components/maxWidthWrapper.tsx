import { ReactNode } from "react";
import { cn } from "~/lib/utils";

type MaxWidthWrapperProps = {
  className?: string;
  children: ReactNode;
};

const MaxWidthWrapper = ({ className, children }: MaxWidthWrapperProps) => {
  return (
    <div
      className={cn(
        "max-width-screen-xl mx-auto w-full px-2.5 md:px-20",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
