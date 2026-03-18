import {UseFiltersReturn} from "@/hooks/useFilters";

interface FilterPanelProps {
    filters: UseFiltersReturn;
    isOpen: boolean;
    onToggle: () => void;
}

export default function FilterPanel({ filters, isOpen, onToggle }: FilterPanelProps) {
    if (!isOpen) return null;
    return (
        <div
            className="absolute top-2.5 right-2.5 z-1000 max-h-[80vh] max-w-[320px] overflow-y-auto rounded-lg border border-neutral-300 bg-white p-4 shadow-lg"
            style={{ position: "absolute", top: "10px", right: "10px", zIndex: 1400, background: "white", border: "1px solid #d4d4d4", borderRadius: "8px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", maxWidth: "320px", maxHeight: "80vh", overflowY: "auto" }}
        >
            <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-3">
                <h3 className="m-0 text-lg font-semibold text-neutral-800">Filtres</h3>
                <div className="flex gap-2">
                    <button
                        className="rounded border border-neutral-300 px-2 py-1 text-base text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-800"
                        onClick={filters.resetFilters}
                        title="Réinitialiser tous les filtres"
                    >
                        ↻
                    </button>
                    <button
                        className="rounded border border-neutral-300 px-2 py-1 text-sm text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-800"
                        onClick={onToggle}
                        title="Masquer le panneau"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div className="mb-4 rounded-md p-2 hover:bg-neutral-50">
                <label className="flex items-center gap-2 text-sm text-neutral-800">
                    <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer"
                        checked={filters.filterState.showStops}
                        onChange={filters.toggleStops}
                    />
                    <span>Afficher les arrêts</span>
                </label>
            </div>

            <div className="mb-4 rounded-md p-2 hover:bg-neutral-50">
                <label className="flex items-center gap-2 text-sm text-neutral-800">
                    <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer"
                        checked={filters.filterState.showRouteGeometry}
                        onChange={filters.toggleRouteGeometry}
                    />
                    <span>Afficher les tracés des lignes</span>
                </label>
            </div>

            {filters.availableRoutes.length > 0 && (
                <div className="mb-2">
                    <div className="mb-2 flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Lignes de bus</label>
                    </div>

                    <div className="flex max-h-75 flex-col gap-2 overflow-y-auto pr-1">
                        {filters.availableRoutes.map(route => (
                            <label key={route} className="flex items-center gap-2 rounded-md p-2 text-sm text-neutral-800 transition hover:bg-neutral-50">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 cursor-pointer"
                                    checked={filters.isRouteVisible(route)}
                                    onChange={() => filters.toggleRoute(route)}
                                />
                                <span className="flex-1 select-none">Ligne {route}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}