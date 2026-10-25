import { GoMark, JavaMark } from '../BrandMarks';
import { RichText } from '../RichText';

function ColumnLabel({
  label,
  index,
  isDefault,
}: {
  label: string;
  index: number;
  isDefault: boolean;
}) {
  if (!isDefault) return <>{label}</>;
  const Mark = index === 0 ? JavaMark : GoMark;
  return (
    <span className={`inline-flex items-center gap-2 ${index === 0 ? 'text-java' : 'text-go'}`}>
      <Mark size={14} />
      {label}
    </span>
  );
}

/** On phones rows stack, so each cell is prefixed by its column's mark or name. */
function CellPrefix({
  label,
  index,
  isDefault,
}: {
  label: string;
  index: number;
  isDefault: boolean;
}) {
  if (isDefault) {
    const Mark = index === 0 ? JavaMark : GoMark;
    return (
      <span className="mt-[0.3em] shrink-0 sm:hidden">
        <Mark size={13} />
      </span>
    );
  }
  return (
    <span className="block shrink-0 text-caption font-bold text-ink-3 [font-stretch:112.5%] sm:hidden">
      {label}
    </span>
  );
}

/**
 * A table across the full page width. Without a `head`, columns are Java | Go.
 * On phones the rows stack (display: block), which makes browsers drop table
 * semantics, so the roles are spelled out to keep it a table for screen readers.
 */
export default function DataTable({ rows, head }: { rows: string[][]; head?: string[] }) {
  const isDefault = !head;
  const labels = head ?? ['Java', 'Go'];

  return (
    <div className="span-full mt-[calc(var(--block-gap)+0.5rem)] overflow-hidden rounded-[0.3rem] border border-rule-strong bg-sunk">
      <table
        role="table"
        className="w-full border-collapse text-left font-sans text-label leading-[1.6] max-sm:block"
      >
        <thead role="rowgroup" className="max-sm:sr-only">
          <tr role="row" className="border-b border-rule-strong">
            {labels.map((label, i) => (
              <th
                key={i}
                scope="col"
                role="columnheader"
                className="px-4 py-2.5 align-bottom text-caption font-bold text-ink-3 [font-stretch:112.5%]"
                style={{ width: `${100 / labels.length}%` }}
              >
                <ColumnLabel label={label} index={i} isDefault={isDefault} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup" className="max-sm:block">
          {rows.map((row, r) => (
            <tr
              key={r}
              role="row"
              className="border-b border-rule last:border-b-0 max-sm:block max-sm:space-y-1.5 max-sm:px-4 max-sm:py-3"
            >
              {row.map((cell, c) => (
                <td
                  key={c}
                  role="cell"
                  className={`px-4 py-3 align-top max-sm:p-0 ${
                    isDefault ? 'max-sm:flex max-sm:gap-2' : 'max-sm:block'
                  } ${c === 0 ? 'text-ink-2' : 'text-ink'}`}
                >
                  <CellPrefix label={labels[c]} index={c} isDefault={isDefault} />
                  <span className="min-w-0">
                    <RichText text={cell} />
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
