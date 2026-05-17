export default function CleoAvatar({ size = 'sm' }) {
  const src = size === 'lg' ? 256 : 96
  const px = size === 'lg' ? 72 : 32
  return (
    <picture className={`cleo-avatar cleo-avatar--${size}`}>
      <source type="image/webp" srcSet={`/images/cleo-${src}.webp`} />
      <img
        src={`/images/cleo-${src}.png`}
        alt="Cleo, Wedding Concierge"
        width={px}
        height={px}
        loading={size === 'lg' ? 'lazy' : 'eager'}
      />
    </picture>
  )
}
