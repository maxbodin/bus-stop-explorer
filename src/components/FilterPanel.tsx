import {UseFiltersReturn} from "@/hooks/useFilters";
import "./FilterPanel.css";

interface FilterPanelProps {
    filters: UseFiltersReturn;
    isOpen: boolean;
    onToggle: () => void;
}

export default function FilterPanel({ filters, isOpen, onToggle }: FilterPanelProps) {
    if (!isOpen) return null;
    return (
        <div className="filter-panel">
            <div className="filter-header">
                <h3>Filtres</h3>
                <div className="header-actions">
                    <button
                        className="reset-btn"
                        onClick={filters.resetFilters}
                        title="Réinitialiser tous les filtres"
                    >
                        ↻
                    </button>
                    <button
                        className="collapse-btn"
                        onClick={onToggle}
                        title="Masquer le panneau"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div className="filter-section">
                <label className="filter-toggle">
                    <input
                        type="checkbox"
                        checked={filters.filterState.showStops}
                        onChange={filters.toggleStops}
                    />
                    <span>Afficher les arrêts</span>
                </label>
            </div>

            <div className="filter-section">
                <label className="filter-toggle">
                    <input
                        type="checkbox"
                        checked={filters.filterState.showRouteGeometry}
                        onChange={filters.toggleRouteGeometry}
                    />
                    <span>Afficher les tracés des lignes</span>
                </label>
            </div>

            {filters.availableRoutes.length > 0 && (
                <div className="filter-section">
                    <div className="filter-section-header">
                        <label className="filter-section-title">Lignes de bus</label>
                    </div>

                    <div className="routes-list">
                        {filters.availableRoutes.map(route => (
                            <label key={route} className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={filters.isRouteVisible(route)}
                                    onChange={() => filters.toggleRoute(route)}
                                />
                                <span className="route-label">Ligne {route}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}