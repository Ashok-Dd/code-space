// Brand mark: twisted-ribbon "S" mark on a transparent background.
function Logo({ className = "w-8 h-8" }) {
  return (
    <img
      src="/brand-mark.png"
      alt="GrabCode"
      className={`shrink-0 object-contain ${className}`}
    />
  );
}

export default Logo;
