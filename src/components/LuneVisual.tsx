import luneImage from '../assets/images/lune.png'

type LuneVisualProps = {
  className?: string
  name?: string
}

export default function LuneVisual({ className = '', name }: LuneVisualProps) {
  return (
    <div className={`lune-visual ${className}`.trim()}>
      <img className="lune-visual__image" src={luneImage} alt="" />
      {name && <span className="lune-visual__name">{name}</span>}
    </div>
  )
}
