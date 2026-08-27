import { ExternalLink } from "lucide-react";

type DeliverableLinksProps = {
  links?: string[];
};

export function DeliverableLinks({ links }: DeliverableLinksProps) {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-2.5 py-1">
      {links.map((link, index) => (
        <li key={`${index}-${link}`}>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-w-0 max-w-full items-center gap-1.5 overflow-hidden py-0.5 text-sm font-medium leading-6 text-orange-600 transition-colors hover:text-orange-700 hover:underline"
          >
            <ExternalLink
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 text-orange-500 transition-colors group-hover:text-orange-700"
            />
            <span className="min-w-0 flex-1 truncate break-all">{link}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
