import styles from "./room-manifest.module.css";

type RoomVariant = "field" | "force" | "workbench" | "index";

type RoomManifestProps = {
  variant: RoomVariant;
  number: string;
  room: string;
  title: string;
  description: string;
  principle: string;
  notation: string;
};

function RoomGlyph({ variant }: { variant: RoomVariant }) {
  if (variant === "field") return (
    <svg viewBox="0 0 180 140" aria-hidden="true">
      <ellipse cx="90" cy="70" rx="66" ry="27" transform="rotate(-24 90 70)" />
      <ellipse cx="90" cy="70" rx="48" ry="54" transform="rotate(38 90 70)" />
      <circle className={styles.core} cx="90" cy="70" r="10" />
      <circle className={styles.node} cx="31" cy="46" r="5" />
      <circle className={styles.nodeAlt} cx="143" cy="95" r="4" />
      <path className={styles.vector} d="M34 46 78 64M143 95 102 76" />
    </svg>
  );
  if (variant === "force") return (
    <svg viewBox="0 0 180 140" aria-hidden="true">
      <path d="M14 108 C42 108 38 26 78 26 S112 116 164 26" />
      <path className={styles.echo} d="M14 119 C46 119 45 43 80 43 S115 127 164 43" />
      <path className={styles.vector} d="M148 26h16v16" />
      <circle className={styles.core} cx="78" cy="26" r="7" />
      <circle className={styles.node} cx="164" cy="26" r="5" />
    </svg>
  );
  if (variant === "workbench") return (
    <svg viewBox="0 0 180 140" aria-hidden="true">
      <path d="m90 14 54 29v56l-54 29-54-29V43z" />
      <path className={styles.echo} d="m90 14 0 58 54 27M90 72 36 99M90 72V128" />
      <path className={styles.vector} d="M90 72 144 43M90 72 90 14" />
      <circle className={styles.core} cx="90" cy="72" r="6" />
      <circle className={styles.node} cx="144" cy="43" r="4" />
    </svg>
  );
  return (
    <svg viewBox="0 0 180 140" aria-hidden="true">
      <path d="M34 28h86l25 25v58H34z" />
      <path className={styles.echo} d="M44 18h86l25 25M24 38h86l25 25" />
      <path className={styles.vector} d="M58 58h62M58 73h47M58 88h54" />
      <circle className={styles.core} cx="124" cy="99" r="7" />
    </svg>
  );
}

export function RoomManifest({ variant, number, room, title, description, principle, notation }: RoomManifestProps) {
  return (
    <aside className={styles.manifest} data-room={variant} aria-label={`${room} creative principle`}>
      <div className={styles.identity}>
        <span className={styles.kicker}>FORMA / ROOM {number}</span>
        <span className={styles.room}>{room}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className={styles.figure} aria-hidden="true">
        <span className={styles.figureIndex}>FIELD STUDY / {number}</span>
        <RoomGlyph variant={variant} />
        <span className={styles.figureCaption}>{notation}</span>
      </div>
      <div className={styles.principle}>
        <span>THE ROOM&apos;S RULE</span>
        <p>{principle}</p>
      </div>
    </aside>
  );
}
