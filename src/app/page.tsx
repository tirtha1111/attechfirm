export default function Page() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000" }}>
      <iframe
        src="/vesper.html"
        title="Vesper.ai — Operational AI Infrastructure"
        allow="autoplay; encrypted-media; fullscreen"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: 0,
          display: "block",
        }}
      />
    </div>
  );
}
