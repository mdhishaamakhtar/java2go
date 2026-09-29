import Link from 'next/link';
import { GoMark } from '../BrandMarks';

/** Site wordmark. The text hides when the desktop sidebar is collapsed. */
export default function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="group flex min-w-0 items-center gap-2.5 rounded-md py-1 sidebar-collapsed:justify-center"
      aria-label="Go for Java Developers, home"
    >
      <GoMark size={26} className="shrink-0 transition-transform group-hover:-rotate-6" />
      <span className="min-w-0 leading-tight sidebar-collapsed:hidden">
        <span className="block text-[0.75rem] font-bold tracking-[0.14em] text-go uppercase">
          Go for
        </span>
        <span className="block text-[1.0625rem] font-bold tracking-[-0.01em] text-primary">
          Java Developers
        </span>
      </span>
    </Link>
  );
}
