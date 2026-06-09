import Link from 'next/link';
import Logo from './Logo';

interface Breadcrumb {
  href: string;
  label: string;
}

export default function AppHeader({
  breadcrumbs,
  right,
  rightLinks,
}: {
  breadcrumbs?: Breadcrumb[];
  right?: React.ReactNode;
  rightLinks?: { href: string; label: string }[];
}) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {breadcrumbs?.map((crumb, i) => (
            <span key={i} className="flex items-center gap-4">
              {i > 0 && <span className="text-gray-300">|</span>}
              <Link href={crumb.href} className="text-sm text-indigo-600 hover:text-indigo-800">
                ← {crumb.label}
              </Link>
            </span>
          ))}
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2">
            <Logo size={20} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {rightLinks?.map((link, i) => (
            <Link key={i} href={link.href} className="text-sm text-gray-500 hover:text-gray-700">{link.label}</Link>
          ))}
          {right}
        </div>
      </div>
    </header>
  );
}
