"use client";

import { clsx } from "clsx";

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    className?: string;
}

export default function Table<T extends { id: string | number }>({
    data,
    columns,
    onRowClick,
    className
}: TableProps<T>) {
    return (
        <div className={clsx("overflow-x-auto rounded-lg border border-slate-200 bg-white/50 backdrop-blur-sm", className)}>
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/80">
                    <tr>
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                scope="col"
                                className={clsx(
                                    "px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider",
                                    col.className
                                )}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white/40 divide-y divide-slate-100">
                    {data.map((item, rowIdx) => (
                        <tr
                            key={item.id}
                            onClick={() => onRowClick && onRowClick(item)}
                            className={clsx(
                                "transition-colors hover:bg-indigo-50/50",
                                onRowClick && "cursor-pointer"
                            )}
                        >
                            {columns.map((col, colIdx) => (
                                <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                    {typeof col.accessor === 'function'
                                        ? col.accessor(item)
                                        : (item[col.accessor] as React.ReactNode)}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                                No data found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
