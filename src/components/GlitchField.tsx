/**
 * The dead-signal background, for a camera panel that has not been switched on.
 *
 * Three gradient layers and no canvas, no WebGL and no image: a panel that is
 * off should not cost more than a panel that is on. The animation lives in
 * `globals.css` next to the site's other CSS motion — see the `.glitch` block
 * there for what each layer does and why the filter is inherited rather than
 * set here.
 *
 * Deliberately not a client component. It has no state and no handlers, so it
 * renders on the server inside whichever client component owns the camera.
 */
export default function GlitchField({ className }: { className?: string }) {
  return (
    <span aria-hidden className={`glitch ${className ?? ""}`}>
      <span className="glitch-split" />
      <span className="glitch-tear" />
      <span className="glitch-scan" />
    </span>
  );
}
