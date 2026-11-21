
function SourceReferences({ sources }) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <section className="sources-section">
      <p className="eyebrow">TRUSTED INFORMATION</p>

      <h2>Official Sources & References</h2>

      <p>
        Explore official government and WHO documents
        to learn more about this vaccine.
      </p>

      <div className="sources-list">
        {sources.map((source, index) => (
          <div className="source-card" key={index}>
            <div>
              <h3>{source.organization}</h3>
              <p>{source.title}</p>
            </div>

            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="source-link"
            >
              Read Official Document ↗
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SourceReferences;
