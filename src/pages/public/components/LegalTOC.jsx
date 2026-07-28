/**
 * LegalTOC
 *
 * Sticky table-of-contents sidebar for the legal/privacy pages.
 * Renders a vertical scroll track whose fill reflects how far through the
 * sections the reader has scrolled, and highlights the active section.
 */
export function LegalTOC({ sections, activeId, onNavigate }) {
  const activeIndex = Math.max(0, sections.findIndex((section) => section.id === activeId))
  const fillPercent = sections.length > 1 ? (activeIndex / (sections.length - 1)) * 100 : 0

  return (
    <nav className="legal-toc" aria-label="Privacy policy sections">
      <p className="legal-toc-title">On this page</p>

      <div className="legal-toc-body">
        <div className="legal-toc-track" aria-hidden="true">
          <div className="legal-toc-track-fill" style={{ height: `${fillPercent}%` }} />
        </div>

        <ul className="legal-toc-list">
          {sections.map((section) => {
            const isActive = section.id === activeId
            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(section.id)}
                  className={`legal-toc-link${isActive ? ' is-active' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className="legal-toc-num">{String(section.number).padStart(2, '0')}</span>
                  <span className="legal-toc-text">{section.title}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
