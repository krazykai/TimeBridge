interface NowButtonProps {
  onClick: () => void
}

export default function NowButton({ onClick }: NowButtonProps) {
  return (
    <button className="now-button" onClick={onClick}>
      回到現在
    </button>
  )
}
